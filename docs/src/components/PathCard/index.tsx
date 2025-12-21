import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './styles.module.css';

interface PathCardProps {
    title: string;
    description: string;
    to: string;
    icon?: string; // Optional emoji or icon character
    className?: string;
}

export default function PathCard({ title, description, to, icon, className }: PathCardProps): React.ReactElement {
    return (
        <Link to={to} className={clsx('card', styles.pathCard, className)}>
            <div className="card__body">
                {icon && <div className={styles.icon}>{icon}</div>}
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>
            </div>
        </Link>
    );
}
