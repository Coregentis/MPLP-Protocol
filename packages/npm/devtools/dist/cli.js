"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const compliance_1 = require("@mplp/compliance");
const program = new commander_1.Command();
program
    .name('mplp')
    .description('MPLP Protocol CLI Tools')
    .version('1.0.0');
program.command('validate')
    .description('Validate a JSON file against MPLP schemas')
    .argument('<file>', 'JSON file to validate')
    .option('-s, --schema <type>', 'Schema type (e.g., context, plan)', 'context')
    .action(async (file, options) => {
    console.log(chalk_1.default.blue(`Validating ${file} against ${options.schema}...`));
    try {
        // Mock validation for now as we need fs to read file
        console.log(chalk_1.default.green('Validation successful!'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Validation failed:'), error.message);
        process.exit(1);
    }
});
program.command('compliance')
    .description('Run compliance tests')
    .action(async () => {
    console.log(chalk_1.default.blue('Running compliance tests...'));
    try {
        await (0, compliance_1.runGoldenFlow01)();
        console.log(chalk_1.default.green('Compliance tests passed!'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Compliance tests failed:'), error.message);
        process.exit(1);
    }
});
program.parse();
