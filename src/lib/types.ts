export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: "buyer" | "provider" | "admin";
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderProfile {
  id: string;
  bio: string;
  skills: string[];
  years_experience: number;
  website: string;
  created_at: string;
  updated_at: string;
}

export interface Gig {
  id: string;
  provider_id: string;
  provider_name?: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  currency: string;
  location: string;
  cover_image: string | null;
  status: "draft" | "pending" | "approved" | "rejected" | "archived";
  featured_until: string | null;
  avg_rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AdPackage {
  id: string;
  name: string;
  description: string;
  price_minor: number;
  currency: string;
  duration_days: number;
  priority_boost: number;
  max_gigs: number;
  features: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface ProviderSubscription {
  id: string;
  provider_id: string;
  package_id: string;
  package_name?: string;
  package_max_gigs?: number;
  status: "active" | "expired" | "cancelled";
  start_date: string;
  end_date: string;
  payment_details: string | null;
  created_at: string;
}

export interface GigBoost {
  id: string;
  subscription_id: string;
  gig_id: string;
  provider_id: string;
  status: "pending" | "approved" | "rejected";
  gig_title?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  gig_id: string;
  gig_title?: string;
  buyer_id: string;
  buyer_name?: string;
  provider_id: string;
  provider_name?: string;
  status: "inquiry" | "offered" | "accepted" | "in_progress" | "delivered" | "payment_received" | "completed" | "cancelled" | "disputed";
  initial_message: string;
  description: string;
  offered_price: number | null;
  contact_phone: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  dispute_reason: string | null;
  dispute_raised_by: string | null;
  dispute_created_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  gig_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  rating: number;
  body: string;
  created_at: string;
}
