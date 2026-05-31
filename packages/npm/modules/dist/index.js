"use strict";

const packageMetadata = Object.freeze({"name":"@mplp/modules","version":"1.0.6","protocolVersion":"1.0.0","packageRole":"module-helper","contractMode":"derived-protocol-helper","packageClass":"PUBLIC","publishSurface":true,"repository":"https://github.com/Coregentis/MPLP-Protocol.git","homepage":"https://www.mplp.io/what-is-mplp","license":"Apache-2.0"});

exports.packageMetadata = packageMetadata;
exports.PACKAGE_METADATA = packageMetadata;
exports.PACKAGE_NAME = packageMetadata.name;
exports.PACKAGE_VERSION = packageMetadata.version;
exports.MPLP_PROTOCOL_VERSION = packageMetadata.protocolVersion;
exports.PACKAGE_ROLE = packageMetadata.packageRole;
exports.CONTRACT_MODE = packageMetadata.contractMode;

exports.default = packageMetadata;
