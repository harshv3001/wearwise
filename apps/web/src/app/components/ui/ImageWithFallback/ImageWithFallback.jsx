import { useState } from "react";
import styles from "./ImageWithFallback.module.scss";
import { toAppImageUrl } from "../../../../lib/imageUrl";
import Skeleton from "../Skeleton/Skeleton";

export default function ImageWithFallback({
  imageUrl,
  alt,
  fallbackText,
  fallbackImage,
  className = "",
  imgClassName = "",
  showLoadingSkeleton = true,
}) {
  const [failedSrc, setFailedSrc] = useState("");
  const [loadedSrc, setLoadedSrc] = useState("");
  const resolvedImageUrl = toAppImageUrl(imageUrl);
  const hasImageError = Boolean(resolvedImageUrl) && failedSrc === resolvedImageUrl;
  const isImageLoaded = Boolean(resolvedImageUrl) && loadedSrc === resolvedImageUrl;
  const imageClassName = `${styles.image} ${
    imgClassName || className
  } ${isImageLoaded ? styles.imageVisible : styles.imageHidden}`;

  if (resolvedImageUrl && !hasImageError) {
    return (
      <div className={`${styles.frame} ${className}`}>
        {!isImageLoaded && showLoadingSkeleton ? (
          <Skeleton className={styles.skeleton} height="100%" width="100%" />
        ) : null}
        <img
          src={resolvedImageUrl}
          alt={alt}
          className={imageClassName}
          referrerPolicy="no-referrer"
          onLoad={() => {
            setLoadedSrc(resolvedImageUrl);
            if (failedSrc === resolvedImageUrl) {
              setFailedSrc("");
            }
          }}
          onError={() => {
            setFailedSrc(resolvedImageUrl);
          }}
        />
      </div>
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
