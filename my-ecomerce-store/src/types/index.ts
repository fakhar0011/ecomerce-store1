export interface Product {
    _id: string;
    name: string;
    price: number;
    category: "electronics" | "fashion" | "clothing" | "accessories";
    image?: string;
    stock: number;
    rating?: number;
    reviews?: number;
    badge?: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export type FilterType =
    | "all"
    | "electronics"
    | "fashion"
    | "clothing"
    | "accessories";

// ← Yeh add karo
export type UserRole = "admin" | "user";

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
}