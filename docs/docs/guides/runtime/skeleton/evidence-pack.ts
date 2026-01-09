export interface EvidenceArtifactsContract {
    execution_ndjson: "execution.ndjson";
    tool_events_ndjson: "tool-events.ndjson";
    fs_events_ndjson: "fs-events.ndjson";
    sa_events_ndjson: "sa-events.ndjson";
    map_events_ndjson: "map-events.ndjson";
}

/** Frozen artifact names for Profile-14-Golden. */
export const EVIDENCE_ARTIFACTS_14_GOLDEN: EvidenceArtifactsContract = {
    execution_ndjson: "execution.ndjson",
    tool_events_ndjson: "tool-events.ndjson",
    fs_events_ndjson: "fs-events.ndjson",
    sa_events_ndjson: "sa-events.ndjson",
    map_events_ndjson: "map-events.ndjson",
};
