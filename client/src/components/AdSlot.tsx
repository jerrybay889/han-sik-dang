import { AdSense } from "./AdSense";

interface AdSlotProps {
  variant: "banner" | "rectangle" | "feed";
  slot?: string;
  className?: string;
}

export function AdSlot({ variant, slot, className = "" }: AdSlotProps) {
  const defaultSlots = {
    banner: "1234567890",
    rectangle: "0987654321",
    feed: "1357924680"
  };

  const adSlot = slot || defaultSlots[variant];
  const format = variant === "banner" ? "horizontal" : variant === "rectangle" ? "rectangle" : "fluid";
  const minHeight = variant === "banner" ? "90px" : variant === "rectangle" ? "250px" : "150px";

  return (
    <div className={className} style={{ minHeight }}>
      <AdSense 
        slot={adSlot} 
        format={format}
        className="w-full"
      />
    </div>
  );
}
