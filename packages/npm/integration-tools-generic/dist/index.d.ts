export interface MplpPackageMetadata {
  readonly name: string;
  readonly version: string;
  readonly protocolVersion: string;
  readonly packageRole: string | null;
  readonly contractMode: string | null;
  readonly packageClass: string;
  readonly publishSurface: boolean;
  readonly repository: string | null;
  readonly homepage: string | null;
  readonly license: string;
}

export declare const packageMetadata: Readonly<MplpPackageMetadata>;
export declare const PACKAGE_METADATA: Readonly<MplpPackageMetadata>;
export declare const PACKAGE_NAME: "@mplp/integration-tools-generic";
export declare const PACKAGE_VERSION: "1.0.6";
export declare const MPLP_PROTOCOL_VERSION: "1.0.0";
export declare const PACKAGE_ROLE: "integration-helper";
export declare const CONTRACT_MODE: "convenience-runtime-alias";

export default packageMetadata;
