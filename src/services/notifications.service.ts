import { apiClient } from '../api/client';
import { Notification, NotificationsResponse } from '../types/api.types';

export const notificationsService = {
  /**
   * Get all notifications with pagination
   */
  async getNotifications(page: number = 1, limit: number = 10): Promise<NotificationsResponse> {
    const response = await apiClient.get<NotificationsResponse>('/api/v1/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<number>('/api/v1/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.put<Notification>(`/api/v1/notifications/${id}/mark-as-read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ count: number }> {
    const response = await apiClient.put<{ count: number }>('/api/v1/notifications/mark-all-as-read');
    return response.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/notifications/${id}`);
  },

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<{ count: number }> {
    const response = await apiClient.delete<{ count: number }>('/api/v1/notifications');
    return response.data;
  },
};
