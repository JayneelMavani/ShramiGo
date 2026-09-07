import { apiRequest } from "./api";

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notif_type: string;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<Notification[]> {
  return apiRequest<Notification[]>("/api/notifications");
}

export async function getUnreadCount(): Promise<number> {
  const data = await apiRequest<{ unread_count: number }>(
    "/api/notifications/unread-count"
  );
  return data.unread_count;
}

export async function markRead(
  notificationId: number
): Promise<Notification> {
  return apiRequest<Notification>(
    `/api/notifications/${notificationId}/read`,
    { method: "PUT" }
  );
}

export async function markAllRead(): Promise<void> {
  await apiRequest("/api/notifications/read-all", {
    method: "PUT",
  });
}
