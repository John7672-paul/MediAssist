import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { NotificationItem } from '../../components/common/NotificationItem';
import { Button } from '../../components/common/Button';
import { notificationService } from '../../services/api';
import { LoadingState } from '../../components/common/LoadingState';

export const PatientNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    fetchNotifs();
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Notification Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Updates on your appointment status and scheduling reminders</p>
        </div>
        <Button variant="ghost" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
          Mark All Read
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading notifications..." />
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};
