import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Phone, Clock, Star, DollarSign, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Restaurant, Review } from "@shared/schema";

export default function RestaurantDetailPage() {
  const { t, language } = useLanguage();
  const [, params] = useRoute("/restaurant/:id");
  const restaurantId = params?.id;

  const { data: restaurant, isLoading: loadingRestaurant } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: reviews = [], isLoading: loadingReviews } = useQuery<Review[]>({
    queryKey: ["/api/reviews", restaurantId],
    enabled: !!restaurantId,
  });

  if (loadingRestaurant) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto">
          <div className="h-64 bg-muted animate-pulse" />
          <div className="p-4 space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-6 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t("error.notFound")}</h2>
          <Link href="/">
            <Button variant="default" data-testid="button-back-home">
              {t("nav.discover")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const restaurantName = language === "en" ? restaurant.nameEn : restaurant.name;
  const restaurantDescription = language === "en" ? restaurant.descriptionEn : restaurant.description;

  return (
    <>
      <SEO
        title={`${restaurantName} - ${t("nav.discover")}`}
        description={restaurantDescription}
        keywords={[restaurant.name, restaurant.nameEn, restaurant.cuisine, restaurant.district, "Korean restaurant"]}
        url={`/restaurant/${restaurant.id}`}
      />
      <div className="min-h-screen bg-background pb-8">
        <div className="max-w-md mx-auto">
          {/* Header Image */}
          <div className="relative">
            <img
              src={restaurant.imageUrl}
              alt={restaurantName}
              className="w-full h-64 object-cover"
              data-testid="img-restaurant-hero"
            />
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <Link href="/">
                <Button
                  size="icon"
                  variant="secondary"
                  className="bg-background/80 backdrop-blur-sm"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                size="icon"
                variant="secondary"
                className="bg-background/80 backdrop-blur-sm"
                data-testid="button-save"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="px-4 pt-4">
            {/* Title & Rating */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold mb-1" data-testid="text-restaurant-name">
                {restaurantName}
              </h1>
              <p className="text-muted-foreground mb-3">
                {language === "en" ? restaurant.name : restaurant.nameEn}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="secondary" data-testid="badge-cuisine">
                  {restaurant.cuisine}
                </Badge>
                {restaurant.rating > 0 && (
                  <div className="flex items-center gap-1" data-testid="rating-display">
                    <Star className="w-5 h-5 fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]" />
                    <span className="font-semibold text-lg">{restaurant.rating}</span>
                    <span className="text-muted-foreground">
                      ({restaurant.reviewCount} {t("reviews.title")})
                    </span>
                  </div>
                )}
                {restaurant.isVegan === 1 && (
                  <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">
                    Vegan
                  </Badge>
                )}
                {restaurant.isHalal === 1 && (
                  <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-400">
                    Halal
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t("restaurant.price")}</span>
                </div>
                <p className="font-semibold" data-testid="text-price-range">
                  {restaurant.priceRange}
                </p>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t("restaurant.location")}</span>
                </div>
                <p className="font-semibold truncate" data-testid="text-district">
                  {restaurant.district}
                </p>
              </Card>
            </div>

            {/* Description */}
            <Card className="p-4 mb-6">
              <h2 className="font-semibold mb-2">{t("restaurant.about")}</h2>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-description">
                {restaurantDescription}
              </p>
            </Card>

            {/* Contact Info */}
            <Card className="p-4 mb-6">
              <h2 className="font-semibold mb-3">{t("restaurant.info")}</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">{t("restaurant.address")}</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-address">
                      {restaurant.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">{t("restaurant.phone")}</p>
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="text-sm text-primary hover:underline"
                      data-testid="link-phone"
                    >
                      {restaurant.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">{t("restaurant.hours")}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line" data-testid="text-hours">
                      {restaurant.openHours}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reviews Section */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t("reviews.title")} ({reviews.length})
                </h2>
                <Button size="sm" variant="default" data-testid="button-write-review">
                  {t("reviews.write")}
                </Button>
              </div>

              {loadingReviews ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="border-t pt-3">
                      <div className="h-4 bg-muted rounded animate-pulse w-1/3 mb-2" />
                      <div className="h-3 bg-muted rounded animate-pulse w-full mb-1" />
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground" data-testid="text-no-reviews">
                    {t("reviews.empty")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("reviews.beFirst")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-t pt-4 first:border-t-0 first:pt-0" data-testid={`review-${review.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{review.userName}</p>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-[hsl(var(--accent-success))] text-[hsl(var(--accent-success))]" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString(language)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
