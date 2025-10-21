import { useEffect } from "react";
import { Card } from "@/components/ui/card";

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
      <Card className={`p-4 bg-muted/30 border-dashed ${className}`}>
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-semibold mb-1">Advertisement Placeholder</p>
          <p className="text-xs">
            Set VITE_ADSENSE_PUBLISHER_ID to enable ads
          </p>
        </div>
      </Card>
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
