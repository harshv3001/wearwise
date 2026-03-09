import { useState } from 'react';
import styles from './Accordion.module.scss';

export default function Accordion({ title, startOpened, children }) {
    const [opened, setOpened] = useState(!!startOpened);
    const toggleOpened = () => {setOpened(opened => !opened)};

    return (
        <div className={`${styles.accordion_container}`}>
            <div className={styles.header}>
                <h5>{title}</h5>
                
                <button onClick={toggleOpened}>
                <span className="material-symbols-outlined" aria-hidden="true">
                    { opened ? "remove" : "add"}
                </span>
                </button>
            </div>
            <div className={`${styles.main} ${opened ? styles.main_open : ""}`}>
                {children}
            </div>
        </div>
    );
}
