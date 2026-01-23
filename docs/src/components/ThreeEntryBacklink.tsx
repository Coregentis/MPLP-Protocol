import React from 'react';
import styles from './ThreeEntryBacklink.module.css';

/**
 * Four-Entry Model Backlink Strip
 * 
 * Provides visible cross-entry navigation for AI crawlers and users.
 * NOT JSON-LD - plain HTML with semantic links.
 * 
 * Four-Entry Model:
 * - Website: Discovery & Positioning
 * - Docs (this): Specification & Reference  
 * - Repo: Source of Truth
 * - Lab: Evidence & Adjudication
 */
export default function ThreeEntryBacklink(): React.ReactElement {
    return (
        <div className={styles.threeEntryBacklink}>
            <div className={styles.label}>MPLP Entry Points:</div>
            <div className={styles.entries}>
                <a
                    href="https://www.mplp.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.entry}
                >
                    <span className={styles.entryName}>Website</span>
                    <span className={styles.entryRole}>Discovery</span>
                </a>
                <span className={styles.separator}>•</span>
                <span className={`${styles.entry} ${styles.current}`}>
                    <span className={styles.entryName}>Docs</span>
                    <span className={styles.entryRole}>Specification</span>
                </span>
                <span className={styles.separator}>•</span>
                <a
                    href="https://github.com/Coregentis/MPLP-Protocol"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.entry}
                >
                    <span className={styles.entryName}>Repository</span>
                    <span className={styles.entryRole}>Truth Source</span>
                </a>
                <span className={styles.separator}>•</span>
                <a
                    href="https://lab.mplp.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.entry}
                >
                    <span className={styles.entryName}>Validation Lab</span>
                    <span className={styles.entryRole}>Adjudication</span>
                </a>
            </div>
            <div className={styles.entityCard}>
                <a
                    href="/assets/geo/mplp-entity.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Machine-readable MPLP entity definition"
                >
                    Entity Card
                </a>
            </div>
        </div>
    );
}
