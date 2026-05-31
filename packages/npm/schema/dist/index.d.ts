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
export declare const PACKAGE_NAME: "@mplp/schema";
export declare const PACKAGE_VERSION: "1.0.7";
export declare const MPLP_PROTOCOL_VERSION: "1.0.0";
export declare const PACKAGE_ROLE: "schema-data-mirror";
export declare const CONTRACT_MODE: "direct-schema-data-mirror";
export type { MplpKernelDuty, MplpKernelDutyBaseline } from "./kernel-duties";
export { kernelDutyBaseline, KERNEL_DUTIES, KERNEL_DUTY_IDS, KERNEL_DUTY_NAMES, KERNEL_DUTY_COUNT } from "./kernel-duties";

export default packageMetadata;
