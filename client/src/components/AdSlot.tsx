interface AdSlotProps {
  variant: "banner" | "rectangle";
  className?: string;
}

export function AdSlot({ variant, className = "" }: AdSlotProps) {
  const height = variant === "banner" ? "90px" : "250px";

  return (
    <div
      className={`relative bg-[hsl(var(--ad-zone))] rounded-md flex items-center justify-center ${className}`}
      style={{ minHeight: height }}
      data-testid={`ad-${variant}`}
    >
      <div className="absolute top-2 right-2 text-[10px] text-muted-foreground">
        Advertisement
      </div>
      <div className="text-center text-muted-foreground">
        <div className="text-sm font-medium">광고 영역</div>
        <div className="text-xs">Google AdSense</div>
        <div className="text-xs opacity-60">{height}</div>
      </div>
    </div>
  );
}
