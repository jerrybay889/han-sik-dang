import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation, ExternalLink } from "lucide-react";

interface NaverMapProps {
  latitude: number;
  longitude: number;
  restaurantName: string;
  address: string;
  zoom?: number;
  className?: string;
}

declare global {
  interface Window {
    naver: any;
  }
}

export function NaverMap({
  latitude,
  longitude,
  restaurantName,
  address,
  zoom = 16,
  className = "",
}: NaverMapProps) {
  const { language } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  // Fetch Naver Maps Client ID from API
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setClientId(data.naverMapsClientId))
      .catch(() => setScriptError(true));
  }, []);

  // Load Naver Maps script dynamically
  useEffect(() => {
    if (!clientId) return;

    // Check if already loaded
    if (window.naver && window.naver.maps) {
      setMapLoaded(true);
      return;
    }

    // Map language codes (4 supported: ko, en, zh, ja)
    // Fallback to English for unsupported languages
    const mapLanguage = ['ko', 'en', 'zh', 'ja'].includes(language) ? language : 'en';

    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&language=${mapLanguage}`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setScriptError(true);
    
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [language, clientId]);

  // Initialize map when script is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.naver) return;

    const mapOptions = {
      center: new window.naver.maps.LatLng(latitude, longitude),
      zoom: zoom,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
      mapTypeControl: false,
    };

    const map = new window.naver.maps.Map(mapRef.current, mapOptions);

    // Add marker
    const marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(latitude, longitude),
      map: map,
      title: restaurantName,
    });

    // Add info window
    const contentString = [
      `<div style="padding: 10px; min-width: 200px;">`,
      `<h4 style="margin: 0 0 5px; font-weight: 600;">${restaurantName}</h4>`,
      `<p style="margin: 0; font-size: 12px; color: #666;">${address}</p>`,
      `</div>`,
    ].join('');

    const infoWindow = new window.naver.maps.InfoWindow({
      content: contentString,
    });

    infoWindow.open(map, marker);

    // Click marker to toggle info window
    window.naver.maps.Event.addListener(marker, 'click', () => {
      if (infoWindow.getMap()) {
        infoWindow.close();
      } else {
        infoWindow.open(map, marker);
      }
    });

    return () => {
      marker.setMap(null);
      infoWindow.close();
    };
  }, [mapLoaded, latitude, longitude, restaurantName, address, zoom]);

  // Open in Naver Maps app or web
  const openInNaverMaps = () => {
    const url = `https://map.naver.com/v5/search/${encodeURIComponent(restaurantName)}?c=${longitude},${latitude},16,0,0,0,dh`;
    window.open(url, '_blank');
  };

  // Get directions in Naver Maps
  const getDirections = () => {
    const url = `https://map.naver.com/v5/directions/-/-/-/car?c=${longitude},${latitude},16,0,0,0,dh&e=${longitude},${latitude}`;
    window.open(url, '_blank');
  };

  if (scriptError) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          {language === "en" ? "Failed to load map" : "지도를 불러올 수 없습니다"}
        </p>
      </Card>
    );
  }

  if (!mapLoaded) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          {language === "en" ? "Loading map..." : "지도 로딩 중..."}
        </p>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-64" data-testid="naver-map" />
      <div className="p-3 flex gap-2 border-t">
        <Button
          size="sm"
          variant="outline"
          onClick={getDirections}
          className="flex-1"
          data-testid="button-directions"
        >
          <Navigation className="w-4 h-4 mr-2" />
          {language === "en" ? "Directions" : "길찾기"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={openInNaverMaps}
          className="flex-1"
          data-testid="button-open-naver-maps"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          {language === "en" ? "Open in Naver Maps" : "네이버 지도에서 보기"}
        </Button>
      </div>
    </Card>
  );
}
