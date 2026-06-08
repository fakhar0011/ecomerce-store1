import api from "./axios";

export const getAdminNotifications = async () => {
  const response = await api.get("/orders/admin/notifications");
  return response.data;
};

export const markAdminNotificationRead = async (id: string) => {
  const response = await api.put(`/orders/admin/notifications/${id}/read`);
  return response.data;
};
