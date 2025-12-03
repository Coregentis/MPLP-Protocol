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
 * Trace Module Core Protocol: Describes the minimal required semantics (Core Profile) for execution trace resources (Trace) and their key segments and events.
 */
export interface Trace {
    /** [PROTOCOL-CORE] MPLP protocol and schema metadata. */
    meta: any;
    /** [PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status. */
    governance?: object;
    /** [PROTOCOL-CORE] Global unique identifier for the Trace. */
    trace_id: any;
    /** [PROTOCOL-CORE] Identifier of the Context this Trace belongs to. */
    context_id: any;
    /** [PROTOCOL-CORE] Identifier of the Plan associated with this Trace (if any). */
    plan_id?: any;
    /** [PROTOCOL-CORE] Root span definition of the Trace (follows L1 trace-base structure). */
    root_span: any;
    /** [PROTOCOL-CORE] Current status of the Trace. */
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    /** [PROTOCOL-CORE] Trace start time (ISO 8601). */
    started_at?: string;
    /** [PROTOCOL-CORE] Trace finish time (ISO 8601, optional if not finished). */
    finished_at?: string;
    /** [PROTOCOL-CORE] Key execution segments in the Trace (can correspond to multiple spans or phased aggregations). */
    segments?: any[];
    /** [PROTOCOL-CORE] List of events directly related to this Trace (errors, retries, status changes, etc.). */
    events?: any[];
}
