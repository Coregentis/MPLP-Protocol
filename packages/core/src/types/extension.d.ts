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
 * Extension Module Core Protocol: Describes the minimal required semantics (Core Profile) for the MPLP plugin system, capability injection, and protocol enhancement points.
 */
export interface Extension {
    /** [PROTOCOL-CORE] MPLP protocol and schema metadata. */
    meta: any;
    /** [PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status. */
    governance?: object;
    /** [PROTOCOL-CORE] Global unique identifier for the Extension. */
    extension_id: any;
    /** [PROTOCOL-CORE] Identifier of the Context this Extension belongs to. */
    context_id: any;
    /** [PROTOCOL-CORE] Extension name (human-readable). */
    name: string;
    /** [PROTOCOL-CORE] Extension type classification. */
    extension_type: 'capability' | 'policy' | 'integration' | 'transformation' | 'validation' | 'other';
    /** [PROTOCOL-CORE] Extension version (SemVer format). */
    version: string;
    /** [PROTOCOL-CORE] Extension status. */
    status: 'registered' | 'active' | 'inactive' | 'deprecated';
    /** [PROTOCOL-CORE] Extension configuration object (L2 safe, implementation details excluded). */
    config?: {
        [key: string]: any;
    };
    /** [PROTOCOL-CORE] Trace reference bound to this Extension. */
    trace?: any;
    /** [PROTOCOL-CORE] List of key events directly related to this Extension. */
    events?: any[];
}
