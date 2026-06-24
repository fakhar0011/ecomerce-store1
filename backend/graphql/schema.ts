export const typeDefs = `#graphql
  scalar Upload

  type User {
    _id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String!
  }

  type Product {
    _id: ID!
    name: String!
    price: Float!
    image: String!
    category: String!
    stock: Int!
    badge:String
    rating:Float
    reviews:Int
    createdAt: String!
  }

  input ProductInput {
    name: String!
    price: Float!
    image: String!
    category: String!
    stock: Int!
    badge:String
    rating:Float
    reviews:Int
  }

  type OrderItem {
    productId: String!
    name: String!
    price: Float!
    quantity: Int!
    image: String
  }

  type ShippingAddress {
    fullName: String!
    phone: String!
    address: String!
    city: String!
    postalCode: String!
  }

  type Order {
    _id: ID!
    userId: String!
    items: [OrderItem!]!
    totalAmount: Float!
    status: String!
    createdAt: String!
    shippingAddress: ShippingAddress!
  }

  input OrderItemInput {
    productId: String!
    name: String!
    price: Float!
    quantity: Int!
    image: String
  }

  input ShippingAddressInput {
    fullName: String!
    phone: String!
    address: String!
    city: String!
    postalCode: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  # Admin Notification
  # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  type AdminNotification {
    _id: ID!
    orderId: ID!
    message: String!
    read: Boolean!
    createdAt: String!
  }

  # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  # User Notification (New)
  # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  type UserNotification {
    _id: ID!
    userId: ID!
    orderId: ID!
    title: String!
    message: String!
    type: String!
    read: Boolean!
    createdAt: String!
  }

  # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  # Queries
  # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  type Query {
    hello: String
    me: User
    products: [Product!]!
    product(id: ID!): Product
    orders: [Order!]!
    order(id: ID!): Order
    users: [User!]!         # admin only
    user(id: ID!): User     # admin only
    adminNotifications: [AdminNotification!]!   
    getUserNotifications: [UserNotification!]!  
  }

  # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  # Mutations
  # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  type Mutation {
    signup(name: String!, email: String!, password: String!, role: String): AuthPayload
    login(email: String!, password: String!): AuthPayload
    createOrder(items: [OrderItemInput!]!, shippingAddress: ShippingAddressInput!): Order
    updateOrderStatus(id: ID!, status: String!): Order
    createProduct(input: ProductInput!, file: Upload): Product
    updateProduct(id: ID!, input: ProductInput!, file: Upload): Product
    deleteProduct(id: ID!): Boolean
    markAdminNotificationRead(id: ID!): AdminNotification!
    markUserNotificationRead(id: ID!): UserNotification!  
  }

  # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  # Subscriptions
  # ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  type NotificationPayload {
    title: String!
    message: String!
    type: String!
    orderId: String
  }

  type Subscription {
    orderNotification(userId: ID): NotificationPayload!
  }
`;
