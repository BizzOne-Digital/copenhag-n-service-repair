"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
export function SafeImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const valid =
    src === "/images/brand/copenhagen-logo.png" ||
    /^\/images\/generated\/[a-z-]+\.webp$/.test(src || "") ||
    src?.startsWith("/api/uploads/") ||
    src?.startsWith("https://images.unsplash.com/");
  const source = failed || !valid ? "/placeholder.svg" : src;
  return (
    <Image
      key={src}
      src={source}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      unoptimized={source.startsWith("/api/uploads/")}
      onError={() => setFailed(true)}
    />
  );
}
