export type Category = "seeds" | "fertilizers" | "tools";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  unit: string;
  price: number;
  rating: number;
  stock: number;
  description: string;
  badge?: "Best Seller" | "Top Rated" | "Featured";
  image: string;
  customDiscount?: string;
  customOldPrice?: number;
  customReviewCount?: number;
  customBadgeText?: string;
}

export interface ProductReview {
  name: string;
  location: string;
  rating: number;
  body: string;
}

export interface CartItem {
  productId: string;
  qty: number;
}

export interface MandiPrice {
  id?: string;
  crop: string;
  mandi: string;
  state: string;
  price: number;
  changePct: number;
  arrival?: string;
}

export interface Scheme {
  id: string;
  name: string;
  issuer: string;
  category: string;
  description: string;
  deadline: string;
  eligibility: string;
  url: string;
}

export interface InsuranceScheme {
  code: string;
  name: string;
  description: string;
  premium: string;
  managedBy: string;
  states: string;
  type: string;
  crops?: string[];
  coverage?: string;
}

export interface Course {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  instructor: string;
  hours: number;
  lessons: number;
  progress: number;
  topic: string;
  description?: string;
  format?: string;
}

export interface Internship {
  id: string;
  title: string;
  org: string;
  type: string;
  location: string;
  stipend: string;
  posted: string;
  skills: string[];
  deadline?: string;
  description?: string;
}

export interface Crop {
  name: string;
  emoji: string;
  season: "Kharif" | "Rabi" | "Zaid";
  sowing: string;
  harvest: string;
  duration: string;
  water: string;
  states: string;
  tip: string;
  months: number[];
  tasks?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: "info" | "success" | "warning" | "alert";
  category?: string;
  read?: boolean;
}

export interface WeatherDay {
  day: string;
  condition: string;
  high: number;
  low: number;
  rain: number;
  advisory: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}
