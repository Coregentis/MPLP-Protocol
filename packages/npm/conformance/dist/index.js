"use strict";

const packageMetadata = Object.freeze({"name":"@mplp/conformance","version":"1.0.1","protocolVersion":"1.0.0","packageRole":"conformance-compatibility-alias","contractMode":"convenience-runtime-alias","packageClass":"PUBLIC","publishSurface":true,"repository":"https://github.com/Coregentis/MPLP-Protocol.git","homepage":"https://www.mplp.io/what-is-mplp","license":"Apache-2.0"});

exports.packageMetadata = packageMetadata;
exports.PACKAGE_METADATA = packageMetadata;
exports.PACKAGE_NAME = packageMetadata.name;
exports.PACKAGE_VERSION = packageMetadata.version;
exports.MPLP_PROTOCOL_VERSION = packageMetadata.protocolVersion;
exports.PACKAGE_ROLE = packageMetadata.packageRole;
exports.CONTRACT_MODE = packageMetadata.contractMode;

exports.default = packageMetadata;
