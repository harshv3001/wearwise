import styles from "./FieldDisplay.module.scss";

export default function FieldDisplay({
  label,
  value,
  placeholder = "Not added yet",
}) {
  return (
    <div className={styles.displayField}>
      <p className={styles.fieldLabel}>{label}</p>
      <p className={value ? styles.fieldValue : styles.fieldPlaceholder}>
        {value || placeholder}
      </p>
    </div>
  );
}
