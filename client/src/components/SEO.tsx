import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "restaurant";
  structuredData?: object;
};

export function SEO({
  title,
  description,
  keywords = [],
  image = "/attached_assets/배경제거 -Gemini_Generated_Image_1ac1sb1ac1sb1ac1_ALTools_AIRemoveBG_1760940109625.png",
  url,
  type = "website",
  structuredData,
}: SEOProps) {
  const { language } = useLanguage();
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
  
  const defaultTitle = "한식당 (Hansikdang) - Your Korean Restaurant Guide";
  const defaultDescription = "Discover authentic Korean restaurants with AI-powered recommendations. Perfect guide for tourists visiting Korea. Available in 8 languages.";
  
  const finalTitle = title ? `${title} | 한식당` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const keywordString = keywords.length > 0 
    ? keywords.join(", ") 
    : "Korean restaurant, Korean food, Seoul restaurants, Korean cuisine, restaurant guide, AI recommendations, tourist guide Korea, 한식당, 맛집";

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywordString} />
      <meta name="author" content="Hansikdang" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Mobile App Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="한식당" />
      <meta name="application-name" content="한식당" />
      <meta name="theme-color" content="#1A5F7A" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="한식당 (Hansikdang)" />
      <meta property="og:locale" content={language === 'ko' ? 'ko_KR' : language === 'ja' ? 'ja_JP' : 'en_US'} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Multilingual Tags */}
      <link rel="alternate" hrefLang="ko" href={`${baseUrl}${url || '/'}`} />
      <link rel="alternate" hrefLang="en" href={`${baseUrl}${url || '/'}`} />
      <link rel="alternate" hrefLang="ja" href={`${baseUrl}${url || '/'}`} />
      <link rel="alternate" hrefLang="zh-Hans" href={`${baseUrl}${url || '/'}`} />
      <link rel="alternate" hrefLang="zh-Hant" href={`${baseUrl}${url || '/'}`} />
      <link rel="alternate" hrefLang="es" href={`${baseUrl}${url || '/'}`} />
      <link rel="alternate" hrefLang="fr" href={`${baseUrl}${url || '/'}`} />
      <link rel="alternate" hrefLang="de" href={`${baseUrl}${url || '/'}`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${url || '/'}`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
