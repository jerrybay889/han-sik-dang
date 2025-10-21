import { useEffect } from "react";

interface AdSenseProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  style?: React.CSSProperties;
  className?: string;
}

export function AdSense({ slot, format = "auto", style, className = "" }: AdSenseProps) {
  const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;

  useEffect(() => {
    try {
      if (window.adsbygoogle && publisherId) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, [publisherId]);

  if (!publisherId) {
    return (
      <div className={className} data-testid={`ad-slot-${slot}`}>
        <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-4">
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-semibold mb-1">Advertisement Placeholder</p>
            <p className="text-xs">
              Set VITE_ADSENSE_PUBLISHER_ID to enable ads
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className} data-testid={`ad-slot-${slot}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={publisherId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}
