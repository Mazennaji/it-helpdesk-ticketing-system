import axiosClient from "./axiosClient";

export async function fetchNotifications() {
  const { data } = await axiosClient.get("/notifications");
  return data;
}

export async function markNotificationRead(id) {
  await axiosClient.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await axiosClient.put("/notifications/read-all");
}