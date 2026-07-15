export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: "buyer" | "provider" | "admin";
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface Gig {
  id: string;
  providerId: string;
  providerName?: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  currency: string;
  location: string;
  coverImage: string | null;
  status: "draft" | "pending" | "approved" | "rejected" | "archived";
  featuredUntil: string | null;
  avgRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdPackage {
  id: string;
  name: string;
  description: string;
  priceMinor: number;
  currency: string;
  durationDays: number;
  priorityBoost: number;
  features: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

export interface ProviderSubscription {
  id: string;
  providerId: string;
  packageId: string;
  packageName?: string;
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  paymentDetails: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  gigId: string;
  gigTitle?: string;
  buyerId: string;
  buyerName?: string;
  providerId: string;
  providerName?: string;
  status: "inquiry" | "accepted" | "in_progress" | "completed" | "cancelled";
  initialMessage: string;
  contactPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}
