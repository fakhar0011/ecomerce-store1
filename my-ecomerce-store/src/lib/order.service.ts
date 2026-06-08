import api from "./axios";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

// Create order
export const createOrderService = async (
  items: OrderItem[],
  shippingAddress: ShippingAddress,
) => {
  const response = await api.post("/orders", { items, shippingAddress });
  return response.data;
};

// Get my orders
export const getMyOrdersService = async () => {
  const response = await api.get("/orders/my-orders");
  return response.data;
};

// Get single order
export const getOrderService = async (id: string) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

// Get all orders — Admin (fixed endpoint)
export const getAllOrdersService = async () => {
  const response = await api.get("/orders/admin");
  return response.data;
};

// Update order status — Admin
export const updateOrderStatusService = async (id: string, status: string) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data;
};
