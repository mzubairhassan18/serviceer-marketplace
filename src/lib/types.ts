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
  features: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface ProviderSubscription {
  id: string;
  provider_id: string;
  package_id: string;
  package_name?: string;
  status: "active" | "expired" | "cancelled";
  start_date: string;
  end_date: string;
  payment_details: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  gig_id: string;
  gig_title?: string;
  buyer_id: string;
  buyer_name?: string;
  provider_id: string;
  provider_name?: string;
  status: "inquiry" | "accepted" | "in_progress" | "completed" | "cancelled";
  initial_message: string;
  contact_phone: string | null;
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
