import { gql } from "@apollo/client";

// ============================================================
// Mutations
// ============================================================

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id: _id
        name
        email
        role
      }
    }
  }
`;

export interface LoginResponse {
  login: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

// ============================================================

export const SIGNUP = gql`
  mutation Signup(
    $name: String!
    $email: String!
    $password: String!
    $role: String
  ) {
    signup(name: $name, email: $email, password: $password, role: $role) {
      token
      user {
        id: _id
        name
        email
        role
      }
    }
  }
`;

export interface SignupResponse {
  signup: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

// ============================================================

export const CREATE_ORDER = gql`
  mutation CreateOrder(
    $items: [OrderItemInput!]!
    $shippingAddress: ShippingAddressInput!
  ) {
    createOrder(items: $items, shippingAddress: $shippingAddress) {
      _id
      totalAmount
      status
    }
  }
`;

export interface CreateOrderResponse {
  createOrder: {
    _id: string;
    totalAmount: number;
    status: string;
  };
}

// ============================================================

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      _id
      status
    }
  }
`;

export interface UpdateOrderStatusResponse {
  updateOrderStatus: {
    _id: string;
    status: string;
  };
}

// ============================================================

// ✅ CREATE_PRODUCT with file upload
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!, $file: Upload) {
    createProduct(input: $input, file: $file) {
      id: _id
      name
      price
      image
      category
      stock
    }
  }
`;

export interface CreateProductResponse {
  createProduct: {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    stock: number;
  };
}

// ============================================================

// ✅ UPDATE_PRODUCT with file upload (optional)
export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!, $file: Upload) {
    updateProduct(id: $id, input: $input, file: $file) {
      id: _id
      name
      price
      image
      category
      stock
    }
  }
`;

export interface UpdateProductResponse {
  updateProduct: {
    _id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    stock: number;
  };
}

// ============================================================

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export interface DeleteProductResponse {
  deleteProduct: boolean;
}

// ============================================================
// User Notification Mutations (New)
// ============================================================

export const MARK_USER_NOTIFICATION_READ = gql`
  mutation MarkUserNotificationRead($id: ID!) {
    markUserNotificationRead(id: $id) {
      _id
      read
    }
  }
`;
