/**
 * Copyright 2025 邦士（北京）网络科技有限公司.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Confirm, Plan, validateConfirm } from "@mplp/core-protocol";
import { v4 as uuidv4 } from "uuid";

export interface CreateConfirmOptions {
    status: "approved" | "rejected" | "pending" | "cancelled";
    requestedByRole?: string;
    reason?: string;
}

export function createConfirm(plan: Plan, options: CreateConfirmOptions): Confirm {
    const confirm: Confirm = {
        meta: {
            protocol_version: "1.0.0",
            schema_version: "1.0.0",
            created_at: new Date().toISOString()
        },
        confirm_id: uuidv4(),
        target_type: "plan",
        target_id: plan.plan_id,
        status: options.status,
        requested_by_role: options.requestedByRole || "system",
        requested_at: new Date().toISOString(),
        ...(options.reason && { reason: options.reason })
    };

    const validation = validateConfirm(confirm);
    if (!validation.ok) {
        throw new Error(`Invalid Confirm generated: ${JSON.stringify(validation.errors)}`);
    }

    return confirm;
}
