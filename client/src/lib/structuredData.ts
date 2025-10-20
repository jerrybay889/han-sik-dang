export const createOrganizationSchema = (baseUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "한식당 (Hansikdang)",
  alternateName: "Hansikdang",
  url: baseUrl,
  logo: `${baseUrl}/attached_assets/배경제거 -Gemini_Generated_Image_1ac1sb1ac1sb1ac1_ALTools_AIRemoveBG_1760940109625.png`,
  description: "AI-powered Korean restaurant discovery platform for tourists visiting Korea",
  address: {
    "@type": "PostalAddress",
    addressCountry: "KR",
  },
  sameAs: [
    // Add social media links when available
  ],
});

export const createWebsiteSchema = (baseUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "한식당 (Hansikdang)",
  alternateName: "Hansikdang",
  url: baseUrl,
  description: "Discover authentic Korean restaurants with AI-powered recommendations",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${baseUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  inLanguage: ["ko", "en", "ja", "zh-CN", "zh-TW", "es", "fr", "de"],
});

export const createMobileApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "한식당 (Hansikdang)",
  applicationCategory: "TravelApplication",
  operatingSystem: ["iOS", "Android"],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "2500",
  },
});

export const createRestaurantSchema = (restaurant: {
  name: string;
  nameEn?: string;
  cuisine: string;
  rating?: number;
  reviews?: number;
  image?: string;
  address?: string;
  priceRange?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: restaurant.name,
  alternateName: restaurant.nameEn,
  image: restaurant.image,
  servesCuisine: restaurant.cuisine,
  aggregateRating: restaurant.rating
    ? {
        "@type": "AggregateRating",
        ratingValue: restaurant.rating,
        reviewCount: restaurant.reviews || 0,
      }
    : undefined,
  address: restaurant.address
    ? {
        "@type": "PostalAddress",
        addressCountry: "KR",
        streetAddress: restaurant.address,
      }
    : undefined,
  priceRange: restaurant.priceRange || "₩₩",
});

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const createArticleSchema = (article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.title,
  description: article.description,
  image: article.image,
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  author: {
    "@type": "Organization",
    name: article.author || "Hansikdang",
  },
  publisher: {
    "@type": "Organization",
    name: "Hansikdang",
    logo: {
      "@type": "ImageObject",
      url: "/attached_assets/배경제거 -Gemini_Generated_Image_1ac1sb1ac1sb1ac1_ALTools_AIRemoveBG_1760940109625.png",
    },
  },
});
