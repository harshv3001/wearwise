import styles from "./ImageWithFallback.module.scss";

export default function ImageWithFallback({
  imageUrl,
  alt,
  fallbackText,
  fallbackImage,
  className = "",
  imgClassName = "",
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={`${styles.image} ${imgClassName} ${className}`}
      />
    );
  }

  if (fallbackImage) {
    return (
      <img
        src={fallbackImage}
        alt={alt}
        className={`${styles.image} ${imgClassName} ${className}`}
      />
    );
  }

  return (
    <div className={`${styles.fallbackBox} ${imgClassName} ${className}`}>
      <span>{fallbackText}</span>
    </div>
  );
}
