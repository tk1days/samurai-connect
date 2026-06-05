export type Role = "user" | "expert" | "admin";

export type Expert = {
  id: string;
  display_name: string;
  avatar_url?: string;
  license?: string;
  title: string;
  bio?: string;
  location?: string;
  price_label: string;
  gender?: "male" | "female" | "other";
  is_online: boolean;
  is_approved: boolean;
  is_priority: boolean;
  rating: number;
  review_count: number;
  tags?: string[];
  categories?: string[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
};
