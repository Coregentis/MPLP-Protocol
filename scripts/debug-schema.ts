import { readFileSync } from "fs";
import { join } from "path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);

const commonDir = join(__dirname, "../schemas/v2/common");

// Load dependencies
const identifiers = JSON.parse(readFileSync(join(commonDir, "identifiers.schema.json"), "utf8"));
const metadata = JSON.parse(readFileSync(join(commonDir, "metadata.schema.json"), "utf8"));

ajv.addSchema(identifiers);
ajv.addSchema(metadata);

// Load target
const targetPath = join(commonDir, "learning-sample.schema.json");
const target = JSON.parse(readFileSync(targetPath, "utf8"));

try {
    ajv.compile(target);
    console.log("OK");
} catch (err: any) {
    console.error("Error:");
    console.error(err.message);
    if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
}
