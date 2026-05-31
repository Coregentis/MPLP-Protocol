"use strict";

const kernelDutyBaseline = require("../schemas/kernel-duties.json");
const KERNEL_DUTIES = Object.freeze(kernelDutyBaseline.duties.map((duty) => Object.freeze({ ...duty })));
const KERNEL_DUTY_IDS = Object.freeze(KERNEL_DUTIES.map((duty) => duty.id));
const KERNEL_DUTY_NAMES = Object.freeze(KERNEL_DUTIES.map((duty) => duty.name));
const KERNEL_DUTY_COUNT = kernelDutyBaseline.count;

exports.kernelDutyBaseline = Object.freeze({ ...kernelDutyBaseline, duties: KERNEL_DUTIES });
exports.KERNEL_DUTIES = KERNEL_DUTIES;
exports.KERNEL_DUTY_IDS = KERNEL_DUTY_IDS;
exports.KERNEL_DUTY_NAMES = KERNEL_DUTY_NAMES;
exports.KERNEL_DUTY_COUNT = KERNEL_DUTY_COUNT;
exports.default = exports.kernelDutyBaseline;
