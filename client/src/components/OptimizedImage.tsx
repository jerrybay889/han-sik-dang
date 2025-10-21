import { useState } from "react";
import { cn } from "@/lib/utils";

type OptimizedImageProps = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  onLoad?: () => void;
  onError?: () => void;
  "data-testid"?: string;
};

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  objectFit = "cover",
  onLoad,
  onError,
  "data-testid": testId,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239ca3af'%3EImage%3C/text%3E%3C/svg%3E";

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ width, height }}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={hasError ? fallbackImage : src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "w-full h-full transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{ objectFit }}
        onLoad={handleLoad}
        onError={handleError}
        width={width}
        height={height}
        data-testid={testId}
      />
    </div>
  );
}
