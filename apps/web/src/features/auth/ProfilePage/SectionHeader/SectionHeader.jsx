import styles from "./SectionHeader.module.scss";

export default function SectionHeader({ title, description, action }) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <h2 className={styles.cardTitle}>{title}</h2>
        {description ? <p className={styles.sectionCopy}>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
