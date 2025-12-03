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
/**
 * Confirm Module Core Protocol: Describes the minimal required semantics (Core Profile) for approval requests and decision records.
 */
export interface Confirm {
    /** [PROTOCOL-CORE] MPLP protocol schema metadata (version, source, cross-cutting tags, etc.). */
    meta: any;
    /** [PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status. */
    governance?: object;
    /** [PROTOCOL-CORE] Global unique identifier for the approval request. */
    confirm_id: any;
    /** [PROTOCOL-CORE] Approval target type (type of the resource being approved). */
    target_type: 'context' | 'plan' | 'trace' | 'extension' | 'other';
    /** [PROTOCOL-CORE] Global unique identifier of the resource being approved. */
    target_id: any;
    /** [PROTOCOL-CORE] Current status of the approval request. */
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    /** [PROTOCOL-CORE] Identifier of the role initiating the approval request (should correspond to role_id in Role module). */
    requested_by_role: string;
    /** [PROTOCOL-CORE] Approval request creation time (ISO 8601). */
    requested_at: string;
    /** [PROTOCOL-CORE] Reason for the request, for humans and Agents. */
    reason?: string;
    /** [PROTOCOL-CORE] List of decision records related to this Confirm request. */
    decisions?: any[];
    /** [PROTOCOL-CORE] Trace reference bound to this Confirm request (for cross-module tracing). */
    trace?: any;
    /** [PROTOCOL-CORE] List of key events directly related to this Confirm request (creation, decision, cancellation, etc.). */
    events?: any[];
}
