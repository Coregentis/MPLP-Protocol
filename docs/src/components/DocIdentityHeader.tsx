import React from 'react';
import styles from './DocIdentityHeader.module.css';
import { getDocIdentity } from './docIdentity/getDocIdentity';

interface DocIdentityHeaderProps {
    frontMatter: any;
}

export default function DocIdentityHeader({ frontMatter }: DocIdentityHeaderProps): React.ReactElement {
    const identity = getDocIdentity(frontMatter);

    return (
        <div className={styles.docIdentityHeader}>
            <div className={styles.badges}>
                <span className={`${styles.badge} ${styles[identity.doc_profile]}`}>
                    {identity.doc_profile.replace(/-/g, ' ').toUpperCase()}
                </span>

                {identity.lifecycle_status && (
                    <span className={`${styles.badge} ${styles.lifecycle}`}>
                        {identity.lifecycle_status.toUpperCase()}
                    </span>
                )}

                {identity.authority && (
                    <span className={`${styles.badge} ${styles.authority}`}>
                        {identity.authority}
                    </span>
                )}
            </div>

            <div className={styles.truthSource}>
                <strong>Truth Source:</strong>{' '}
                <a
                    href="https://github.com/Coregentis/MPLP-Protocol"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Repository schemas and tests are authoritative.
                </a>
            </div>

            {identity.showDisambiguation && (
                <div className={styles.disambiguation}>
                    <strong>MPLP</strong> = Multi-Agent Lifecycle Protocol (not a license).
                </div>
            )}
        </div>
    );
}
