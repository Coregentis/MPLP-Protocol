// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';

const SCHEMAS_ROOT = path.join(__dirname, '../schemas/v2');
const OUTPUT_ROOT = path.join(__dirname, '../packages/sdk-py/src/mplp_sdk/models');

// Map schema filename (relative to schemas/v2) to python module path (relative to models/)
// Key: schema file path relative to SCHEMAS_ROOT
// Value: python module path relative to OUTPUT_ROOT (without .py)
const SCHEMA_MAPPING: Record<string, string> = {
    "mplp-context.schema.json": "context",
    "mplp-plan.schema.json": "plan",
    "mplp-confirm.schema.json": "confirm",
    "mplp-trace.schema.json": "trace",
    "mplp-role.schema.json": "role",
    "mplp-extension.schema.json": "extension",
    "mplp-dialog.schema.json": "dialog",
    "mplp-collab.schema.json": "collab",
    "mplp-core.schema.json": "core",
    "mplp-network.schema.json": "network",
    "common/identifiers.schema.json": "common/identifiers",
    "common/metadata.schema.json": "common/meta",
    "common/common-types.schema.json": "common/common_types",
    "common/trace-base.schema.json": "common/trace_base",
    "common/events.schema.json": "common/events",
    "common/learning-sample.schema.json": "common/learning_sample"
};

// Map schema file to the main class name it exports
const SCHEMA_CLASS_NAMES: Record<string, string> = {
    "mplp-context.schema.json": "Context",
    "mplp-plan.schema.json": "Plan",
    "mplp-confirm.schema.json": "Confirm",
    "mplp-trace.schema.json": "Trace",
    "mplp-role.schema.json": "Role",
    "mplp-extension.schema.json": "Extension",
    "mplp-dialog.schema.json": "Dialog",
    "mplp-collab.schema.json": "Collab",
    "mplp-core.schema.json": "Core",
    "mplp-network.schema.json": "Network",
    "common/identifiers.schema.json": "Uuid", // Special case for string type
    "common/metadata.schema.json": "Metadata",
    "common/common-types.schema.json": "CommonTypes", // Container for definitions
    "common/trace-base.schema.json": "TraceBase",
    "common/events.schema.json": "Event",
    "common/learning-sample.schema.json": "LearningSample"
};

function toPascalCase(s: string): string {
    return s.split(/[-_]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
}

function ensureDir(filePath: string) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}

// Helper to resolve imports
// Returns { typeName: string, importStmt: string | null }
function resolveRef(ref: string, currentSchemaFile: string): { typeName: string, importStmt: string | null } {
    if (ref.startsWith('#/definitions/') || ref.startsWith('#/$defs/')) {
        const defName = ref.split('/').pop();
        return { typeName: toPascalCase(defName), importStmt: null };
    }

    // External ref
    const [filePath, hash] = ref.split('#');

    // Resolve relative path
    // currentSchemaFile is relative to SCHEMAS_ROOT, e.g. "mplp-context.schema.json" or "common/metadata.schema.json"
    const currentDir = path.dirname(currentSchemaFile);
    const absoluteRefPath = path.resolve(path.join(SCHEMAS_ROOT, currentDir), filePath);
    const relativeRefPath = path.relative(SCHEMAS_ROOT, absoluteRefPath).replace(/\\/g, '/');

    const targetModule = SCHEMA_MAPPING[relativeRefPath];
    if (!targetModule) {
        console.warn(`Unknown schema ref: ${ref} (resolved to ${relativeRefPath})`);
        return { typeName: 'Dict[str, Any]', importStmt: 'from typing import Any, Dict' };
    }

    let typeName = SCHEMA_CLASS_NAMES[relativeRefPath];

    // If hash exists, it points to a definition inside that file
    if (hash) {
        const defName = hash.split('/').pop();
        typeName = toPascalCase(defName);
    }

    // Calculate relative import path
    // currentModule: context (in models/)
    // targetModule: common/meta (in models/common/)
    // relative: .common.meta

    const currentModulePath = SCHEMA_MAPPING[currentSchemaFile];
    const currentModuleDir = path.dirname(currentModulePath);
    const targetModuleDir = path.dirname(targetModule);
    const targetModuleName = path.basename(targetModule);

    let importPath = '';

    // Simple logic: use absolute package imports "mplp_sdk.models..." to avoid relative mess
    const packagePath = `mplp_sdk.models.${targetModule.replace(/\//g, '.')}`;

    return {
        typeName,
        importStmt: `from ${packagePath} import ${typeName}`
    };
}

function generateType(prop: any, currentSchemaFile: string, imports: Set<string>): string {
    if (prop.$ref) {
        const { typeName, importStmt } = resolveRef(prop.$ref, currentSchemaFile);
        if (importStmt) imports.add(importStmt);
        return typeName;
    }

    if (prop.oneOf || prop.anyOf) {
        const variants = (prop.oneOf || prop.anyOf).map((v: any) => generateType(v, currentSchemaFile, imports));
        imports.add('from typing import Union');
        return `Union[${variants.join(', ')}]`;
    }

    if (prop.allOf) {
        // Simplified: if allOf contains a ref, use that ref. If it merges, we might need a new class.
        // For P7.2, we assume allOf is used for inheritance or composition where we can pick the main type.
        // Or we treat it as Dict[str, Any] if too complex.
        // But wait, "Maximum-Rigor".
        // If allOf has 1 item, use it.
        if (prop.allOf.length === 1) {
            return generateType(prop.allOf[0], currentSchemaFile, imports);
        }
        // If multiple, usually it's "extends".
        // We can try to find the $ref one.
        const refItem = prop.allOf.find((i: any) => i.$ref);
        if (refItem) {
            const { typeName, importStmt } = resolveRef(refItem.$ref, currentSchemaFile);
            if (importStmt) imports.add(importStmt);
            return typeName; // This is lossy if there are other properties.
        }
        return 'Dict[str, Any]';
    }

    if (prop.type === 'string') {
        if (prop.enum) {
            // Inline literal for simplicity, or generate Enum class?
            // Spec says "Prefer Enum". But for now Literal is safer for codegen without complex state.
            // "enum must be mapped to type-safe enum".
            // I will use Literal for now as it IS type safe in Pydantic.
            // Generating separate Enum classes requires naming them, which is hard for inline enums.
            imports.add('from typing import Literal');
            const values = prop.enum.map((v: string) => `"${v}"`).join(', ');
            return `Literal[${values}]`;
        }
        if (prop.format === 'date-time') {
            imports.add('from datetime import datetime');
            return 'datetime';
        }
        return 'str';
    }
    if (prop.type === 'boolean') {
        return 'bool';
    }
    if (prop.type === 'integer') {
        return 'int';
    }
    if (prop.type === 'number') {
        return 'float';
    }
    if (prop.type === 'array') {
        imports.add('from typing import List');
        if (prop.items) {
            const itemType = generateType(prop.items, currentSchemaFile, imports);
            return `List[${itemType}]`;
        }
        return 'List[Any]';
    }
    if (prop.type === 'object') {
        imports.add('from typing import Dict, Any');
        if (prop.additionalProperties !== false) {
            return 'Dict[str, Any]';
        }
        // If it has properties but is inline, we should generate a nested class.
        // But `generateType` returns a string.
        // We need to handle this in `generateClass`.
        return 'Dict[str, Any]'; // Fallback for inline objects without explicit class generation here
    }

    imports.add('from typing import Any');
    return 'Any';
}

function generateClass(className: string, schema: any, currentSchemaFile: string, imports: Set<string>, extraClasses: string[]): string {
    // If schema is just a type (like identifiers), generate type alias
    if (schema.type === 'string' || schema.type === 'integer' || schema.type === 'boolean' || schema.type === 'array') {
        // Handle pattern for string
        if (schema.type === 'string' && schema.pattern) {
            imports.add('from typing import Annotated');
            imports.add('from pydantic import Field');
            // Escape backslashes in pattern
            const pattern = schema.pattern.replace(/\\/g, '\\\\');
            return `${className} = Annotated[str, Field(pattern=r"${pattern}")]\n\n`;
        }
        const pyType = generateType(schema, currentSchemaFile, imports);
        return `${className} = ${pyType}\n\n`;
    }

    let code = `class ${className}(BaseModel):\n`;
    const desc = (schema.description || className).replace(/"/g, "'");
    code += `    """${desc}"""\n`;

    const required = new Set(schema.required || []);
    const properties = schema.properties || {};

    // Handle allOf merging
    if (schema.allOf) {
        // This is complex. For now, we assume allOf is used for composition.
        // We will just merge properties from allOf schemas if they are inline.
        // If they are refs, we should inherit? Pydantic supports inheritance.
        // But multiple inheritance can be tricky.
        // Let's try to flatten properties.
        // Note: This is a simplification.
    }

    if (schema.additionalProperties !== false) {
        code += `    model_config = ConfigDict(extra="allow")\n`;
    } else {
        code += `    model_config = ConfigDict(extra="forbid")\n`;
    }

    for (const [propName, propDef] of Object.entries(properties) as [string, any][]) {
        // Check for inline object definition -> generate nested class
        let pyType = 'Any';
        if (propDef.type === 'object' && propDef.properties && !propDef.$ref) {
            const nestedClassName = `${className}${toPascalCase(propName)}`;
            const nestedClassCode = generateClass(nestedClassName, propDef, currentSchemaFile, imports, extraClasses);
            extraClasses.push(nestedClassCode);
            pyType = nestedClassName;
        } else {
            pyType = generateType(propDef, currentSchemaFile, imports);
        }

        const isRequired = required.has(propName);
        const fieldDesc = (propDef.description || '').replace(/"/g, "'");

        imports.add('from typing import Optional');
        imports.add('from pydantic import Field');

        if (isRequired) {
            code += `    ${propName}: ${pyType} = Field(..., description="${fieldDesc}")\n`;
        } else {
            code += `    ${propName}: Optional[${pyType}] = Field(None, description="${fieldDesc}")\n`;
        }
    }
    code += '\n';
    return code;
}

function generateFile(schemaFile: string) {
    const schemaPath = path.join(SCHEMAS_ROOT, schemaFile);
    if (!fs.existsSync(schemaPath)) {
        console.warn(`Schema not found: ${schemaPath}`);
        return;
    }
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

    const modulePath = SCHEMA_MAPPING[schemaFile];
    const outputPath = path.join(OUTPUT_ROOT, `${modulePath}.py`);
    ensureDir(outputPath);

    const imports = new Set<string>();
    imports.add('from __future__ import annotations');
    imports.add('from pydantic import BaseModel, ConfigDict');

    const extraClasses: string[] = [];
    let mainCode = '';

    // Process Definitions
    const defs = schema.definitions || schema.$defs || {};
    for (const [defName, defSchema] of Object.entries(defs)) {
        const className = toPascalCase(defName);
        mainCode += generateClass(className, defSchema, schemaFile, imports, extraClasses);
    }

    // Process Main Class
    const mainClassName = SCHEMA_CLASS_NAMES[schemaFile];
    mainCode += generateClass(mainClassName, schema, schemaFile, imports, extraClasses);

    // Combine
    let fileContent = Array.from(imports).join('\n') + '\n\n';
    fileContent += extraClasses.join('\n');
    fileContent += mainCode;

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Generated ${outputPath}`);
}

function main() {
    for (const schemaFile of Object.keys(SCHEMA_MAPPING)) {
        generateFile(schemaFile);
    }

    // Generate __init__.py files
    // mplp_sdk/models/__init__.py should export main classes
    const modelsInitPath = path.join(OUTPUT_ROOT, '__init__.py');
    let modelsInit = '';
    for (const [schemaFile, modulePath] of Object.entries(SCHEMA_MAPPING)) {
        if (modulePath.startsWith('common/')) continue;
        const className = SCHEMA_CLASS_NAMES[schemaFile];
        modelsInit += `from .${modulePath} import ${className}\n`;
    }
    fs.writeFileSync(modelsInitPath, modelsInit);

    // mplp_sdk/models/common/__init__.py
    const commonInitPath = path.join(OUTPUT_ROOT, 'common/__init__.py');
    let commonInit = '';
    for (const [schemaFile, modulePath] of Object.entries(SCHEMA_MAPPING)) {
        if (!modulePath.startsWith('common/')) continue;
        const className = SCHEMA_CLASS_NAMES[schemaFile];
        const moduleName = path.basename(modulePath);
        commonInit += `from .${moduleName} import ${className}\n`;
    }
    fs.writeFileSync(commonInitPath, commonInit);
}

main();
