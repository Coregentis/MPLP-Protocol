#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "../..");

const schemaPath = path.join(root, "release-manifests/mplp-public-manifest.schema.json");
const manifestPath = path.join(root, "release-manifests/mplp-public-manifest.example.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function allowsType(schemaType, actualType) {
  if (Array.isArray(schemaType)) return schemaType.includes(actualType);
  return schemaType === actualType;
}

function validateNode(schema, value, pointer, errors) {
  if (!schema || typeof schema !== "object") return;

  if (schema.type) {
    const actualType = typeOf(value);
    if (!allowsType(schema.type, actualType)) {
      errors.push(`${pointer}: expected type ${JSON.stringify(schema.type)}, got ${actualType}`);
      return;
    }
    if (actualType === "null") return;
  }

  if (Object.prototype.hasOwnProperty.call(schema, "const") && value !== schema.const) {
    errors.push(`${pointer}: expected const ${JSON.stringify(schema.const)}, got ${JSON.stringify(value)}`);
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${pointer}: expected one of ${schema.enum.join(", ")}, got ${JSON.stringify(value)}`);
  }

  if (typeof value === "string") {
    if (schema.minLength && value.length < schema.minLength) {
      errors.push(`${pointer}: expected minLength ${schema.minLength}`);
    }
    if (schema.pattern && !(new RegExp(schema.pattern).test(value))) {
      errors.push(`${pointer}: failed pattern ${schema.pattern}`);
    }
    if (schema.format === "uri") {
      try {
        new URL(value);
      } catch {
        errors.push(`${pointer}: expected URI`);
      }
    }
    if (schema.format === "date-time" && Number.isNaN(Date.parse(value))) {
      errors.push(`${pointer}: expected parseable date-time`);
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) {
      errors.push(`${pointer}: expected at least ${schema.minItems} item(s)`);
    }
    if (schema.items) {
      value.forEach((item, index) => validateNode(schema.items, item, `${pointer}/${index}`, errors));
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const properties = schema.properties || {};
    for (const key of schema.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(`${pointer}: missing required property ${key}`);
      }
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) {
          errors.push(`${pointer}: unexpected property ${key}`);
        }
      }
    }
    for (const [key, childSchema] of Object.entries(properties)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        validateNode(childSchema, value[key], `${pointer}/${key}`, errors);
      }
    }
  }
}

function requireBoundary(condition, message, errors) {
  if (!condition) errors.push(`boundary: ${message}`);
}

const schema = readJson(schemaPath);
const manifest = readJson(manifestPath);
const errors = [];

validateNode(schema, manifest, "$", errors);

requireBoundary(
  manifest.validation_lab_boundary?.non_certifying === true &&
    manifest.validation_lab_boundary?.no_endorsement === true &&
    manifest.validation_lab_boundary?.no_regulator_approval === true,
  "Validation Lab must remain non-certifying, non-endorsing, and non-regulatory",
  errors
);

requireBoundary(
  manifest.website_boundary?.discovery_positioning_only === true &&
    manifest.website_boundary?.protocol_truth_override_allowed === false,
  "Website must remain discovery/positioning only and cannot override protocol truth",
  errors
);

requireBoundary(
  manifest.repo_migration_status?.migration_now === false &&
    manifest.repo_migration_status?.remotes_changed === false &&
    manifest.repo_migration_status?.package_repository_urls_changed === false,
  "repo migration and package repository URL changes must remain false",
  errors
);

requireBoundary(
  manifest.package_replacement_status?.status === "planned_not_published" &&
    manifest.package_replacement_status?.package_actions_executed === false,
  "package replacement must remain planned_not_published with no package actions",
  errors
);

requireBoundary(
  manifest.release_status?.gates?.submodule_removal_allowed === false,
  "Website submodule removal must not be allowed by this draft manifest",
  errors
);

if (errors.length > 0) {
  console.error("Protocol public manifest validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Protocol public manifest schema/example validation passed.");
