import { useState } from "react";

const buildImageKitUrl = (src, transforms) => {
  if (!src || !src.includes("ik.imagekit.io")) return src;
  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}tr=${transforms}`;
};

const OptimizedImage = ({
  src,
  alt = "",
  width,
  height,
  className = "",
  quality = 70,
}) => {
  const [loaded, setLoaded] = useState(false);

  const isImageKit = src?.includes("ik.imagekit.io");

  const mainSrc = isImageKit
    ? buildImageKitUrl(src, `${width ? `w-${width},` : ""}q-${quality},f-auto`)
    : src;

  const placeholderSrc = isImageKit
    ? buildImageKitUrl(src, "w-20,q-20,bl-10")
    : null;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {placeholderSrc && !loaded && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover scale-110 blur-sm"
        />
      )}

      {/* Main image */}
      <img
        src={mainSrc}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${loaded || !placeholderSrc ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

export default OptimizedImage;
