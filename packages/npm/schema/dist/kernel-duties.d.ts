export interface MplpKernelDuty {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

export interface MplpKernelDutyBaseline {
  readonly protocol_version: string;
  readonly source_of_truth: string;
  readonly count: number;
  readonly duties: readonly MplpKernelDuty[];
}

export declare const kernelDutyBaseline: Readonly<MplpKernelDutyBaseline>;
export declare const KERNEL_DUTIES: readonly MplpKernelDuty[];
export declare const KERNEL_DUTY_IDS: readonly string[];
export declare const KERNEL_DUTY_NAMES: readonly string[];
export declare const KERNEL_DUTY_COUNT: number;
export default kernelDutyBaseline;
