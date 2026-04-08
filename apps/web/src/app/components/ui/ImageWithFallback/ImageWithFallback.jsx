import { useState } from "react";
import styles from "./ImageWithFallback.module.scss";

export default function ImageWithFallback({
  imageUrl,
  alt,
  fallbackText,
  fallbackImage,
  className = "",
  imgClassName = "",
}) {
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={`${styles.image} ${imgClassName} ${className}`}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
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
