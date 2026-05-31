"use strict";

const packageMetadata = Object.freeze({"name":"@mplp/sdk-ts","version":"1.0.8","protocolVersion":"1.0.0","packageRole":"typescript-facade-helper","contractMode":"derived-protocol-helper","packageClass":"PUBLIC","publishSurface":true,"repository":"https://github.com/Coregentis/MPLP-Protocol.git","homepage":"https://www.mplp.io/what-is-mplp","license":"Apache-2.0"});

exports.packageMetadata = packageMetadata;
exports.PACKAGE_METADATA = packageMetadata;
exports.PACKAGE_NAME = packageMetadata.name;
exports.PACKAGE_VERSION = packageMetadata.version;
exports.MPLP_PROTOCOL_VERSION = packageMetadata.protocolVersion;
exports.PACKAGE_ROLE = packageMetadata.packageRole;
exports.CONTRACT_MODE = packageMetadata.contractMode;

const kernelDutyExports = require("./kernel-duties.js");
exports.kernelDutyBaseline = kernelDutyExports.kernelDutyBaseline;
exports.KERNEL_DUTIES = kernelDutyExports.KERNEL_DUTIES;
exports.KERNEL_DUTY_IDS = kernelDutyExports.KERNEL_DUTY_IDS;
exports.KERNEL_DUTY_NAMES = kernelDutyExports.KERNEL_DUTY_NAMES;
exports.KERNEL_DUTY_COUNT = kernelDutyExports.KERNEL_DUTY_COUNT;

exports.default = packageMetadata;
