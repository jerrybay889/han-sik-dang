import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create a singleton Supabase client instance
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Database Types for TypeScript
export interface Restaurant {
  id: string;
  name_ko: string;
  name_en?: string;
  category: string;
  district: string;
  price_range: 'budget' | 'medium' | 'premium' | 'luxury';
  rating: number;
  review_count: number;
  description_ko?: string;
  description_en?: string;
  ai_description_ko?: string;
  ai_description_en?: string;
  thumbnail_url?: string;
  image_urls?: string[];
  created_at?: string;
  updated_at?: string;
}

// Helper function to fetch restaurants
export async function fetchRestaurants(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching restaurants:', error);
      return [];
    }

    return data as Restaurant[];
  } catch (err) {
    console.error('Exception fetching restaurants:', err);
    return [];
  }
}

// Helper function to fetch restaurant by ID
export async function fetchRestaurantById(id: string) {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching restaurant:', error);
      return null;
    }

    return data as Restaurant;
  } catch (err) {
    console.error('Exception fetching restaurant:', err);
    return null;
  }
}