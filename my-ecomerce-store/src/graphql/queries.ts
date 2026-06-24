import { gql } from "@apollo/client";

// ============================================================
// Product Queries
// ============================================================

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      _id
      name
      price
      image
      category
      stock
      badge
      rating
      reviews
    }
  }
`;

export interface ProductsResponse {
  products: {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    stock: number;
    badge: string;
    rating: number;
    reviews: number;
  }[];
}

// ============================================================
// Order Queries
// ============================================================

// All orders (admin only)
export const GET_ORDERS = gql`
  query GetOrders {
    orders {
      _id
      userId
      items {
        productId
        name
        price
        quantity
        image
      }
      totalAmount
      status
      shippingAddress {
        fullName
        phone
        address
        city
        postalCode
      }
      createdAt
    }
  }
`;

export interface OrdersResponse {
  orders: {
    _id: string;
    userId: string;
    items: {
      productId: string;
      name: string;
      price: number;
      quantity: number;
      image: string;
    }[];
    totalAmount: number;
    status: string;
    shippingAddress: {
      fullName: string;
      phone: string;
      address: string;
      city: string;
      postalCode: string;
    };
    createdAt: string;
  }[];
}

// My orders (current user)
export const GET_MY_ORDERS = gql`
  query GetMyOrders {
    orders {
      _id
      totalAmount
      status
      createdAt
      items {
        name
        price
        quantity
        image
      }
    }
  }
`;

export interface MyOrdersResponse {
  orders: {
    _id: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: {
      name: string;
      price: number;
      quantity: number;
      image: string;
    }[];
  }[];
}

// ============================================================
// User Queries
// ============================================================

export const GET_ME = gql`
  query Me {
    me {
      _id
      name
      email
      role
    }
  }
`;

export interface MeResponse {
  me: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
}

// ============================================================
// Admin Notification Queries
// ============================================================

export const GET_ADMIN_NOTIFICATIONS = gql`
  query GetAdminNotifications {
    adminNotifications {
      _id
      orderId
      message
      read
      createdAt
    }
  }
`;

export interface AdminNotificationsResponse {
  adminNotifications: {
    _id: string;
    orderId: string;
    message: string;
    read: boolean;
    createdAt: string;
  }[];
}

// ============================================================
// User Notification Queries (New)
// ============================================================

export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications {
    getUserNotifications {
      _id
      orderId
      title
      message
      type
      read
      createdAt
    }
  }
`;

export interface UserNotificationsResponse {
  getUserNotifications: {
    _id: string;
    orderId: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
  }[];
}
