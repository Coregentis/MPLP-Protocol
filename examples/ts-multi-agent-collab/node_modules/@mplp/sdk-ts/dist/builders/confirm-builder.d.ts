/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * © 2025 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
import { Confirm, Plan } from "@mplp/core";
export interface CreateConfirmOptions {
    status: "approved" | "rejected" | "pending" | "cancelled";
    requestedByRole?: string;
    reason?: string;
}
export declare function createConfirm(plan: Plan, options: CreateConfirmOptions): Confirm;
