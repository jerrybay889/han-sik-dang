/**
 * Google Places API 클라이언트
 * 레스토랑의 구글 평점과 리뷰수를 수집
 */

interface PlaceSearchResult {
  place_id: string;
  rating?: number;
  user_ratings_total?: number;
  name: string;
}

interface PlacesApiResponse {
  results: PlaceSearchResult[];
  status: string;
}

export class GooglePlacesApiService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('GOOGLE_PLACES_API_KEY is not set');
    }
  }

  /**
   * 레스토랑 검색 및 평점/리뷰수 수집
   */
  async searchPlace(name: string, address: string): Promise<{
    placeId: string | null;
    rating: number | null;
    reviewCount: number | null;
  }> {
    try {
      // Text Search API 사용
      const query = encodeURIComponent(`${name} ${address}`);
      const url = `${this.baseUrl}/textsearch/json?query=${query}&key=${this.apiKey}&language=ko&region=kr`;

      const response = await fetch(url);
      const data: PlacesApiResponse = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        console.warn(`Google Places API: No results for ${name}`);
        return { placeId: null, rating: null, reviewCount: null };
      }

      // 첫 번째 결과 사용
      const place = data.results[0];
      
      return {
        placeId: place.place_id || null,
        rating: place.rating || null,
        reviewCount: place.user_ratings_total || null,
      };
    } catch (error) {
      console.error(`Google Places API error for ${name}:`, error);
      return { placeId: null, rating: null, reviewCount: null };
    }
  }

  /**
   * Rate limiting을 위한 지연
   */
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
