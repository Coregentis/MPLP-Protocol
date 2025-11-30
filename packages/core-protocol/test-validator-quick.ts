// Quick manual verification of ValidationResult structure
import { validateContext } from './src/validators';

const invalid = {
    meta: { protocol_version: '1.0.0' },
    // missing required fields
};

const result = validateContext(invalid);
console.log(JSON.stringify(result, null, 2));
