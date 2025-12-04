/**
 * © 2025 邦士（北京）网络科技有限公司
 * Licensed under the Apache License, Version 2.0.
 *
 * This file is part of the MPLP reference implementation.
 * It is NOT part of the frozen protocol specification.
 */
/**
 * Dialog Module Core Protocol: Describes the dialog interaction semantics in multi-agent systems, adopting Minimal Protocol Format aligned with OpenAI/Anthropic standards.
 */
export interface Dialog {
    /** [PROTOCOL-CORE] MPLP protocol and schema metadata. */
    meta: any;
    /** [PROTOCOL-CORE] Governance metadata for lifecycle management, truth domain authority, and locking status. */
    governance?: object;
    /** [PROTOCOL-CORE] Global unique identifier for the Dialog. */
    dialog_id: any;
    /** [PROTOCOL-CORE] Associated Context ID. */
    context_id: any;
    /** [PROTOCOL-CORE] Dialog thread ID (for multi-turn dialog grouping). */
    thread_id?: any;
    /** [PROTOCOL-CORE] Dialog status. */
    status: 'active' | 'paused' | 'completed' | 'cancelled';
    /** [PROTOCOL-CORE] Dialog message list (Minimal Protocol Format). */
    messages: any[];
    /** [PROTOCOL-CORE] Dialog start time (ISO 8601). */
    started_at?: string;
    /** [PROTOCOL-CORE] Dialog end time (ISO 8601). */
    ended_at?: string;
    /** [PROTOCOL-CORE] Audit trace reference associated with this dialog. */
    trace?: any;
    /** [PROTOCOL-CORE] List of key events directly related to this dialog. */
    events?: any[];
}
