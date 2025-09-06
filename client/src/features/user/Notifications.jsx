import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Clock,
  CheckCircle,
  Circle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format, parseISO, isToday, isYesterday, isTomorrow } from "date-fns";
import { fetchNotifications, markNotificationAsRead } from "./notification.api";

// Function to group notifications by date
const groupNotificationsByDate = (notifications) => {
  const grouped = {};

  notifications.forEach((notification) => {
    const date = notification.date;
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(notification);
  });

  // Sort notifications within each date by time
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => {
      const timeA = a.message.match(/\((\d+:\d+)\)/)?.[1] || "00:00";
      const timeB = b.message.match(/\((\d+:\d+)\)/)?.[1] || "00:00";
      return timeA.localeCompare(timeB);
    });
  });

  return grouped;
};

// Function to format date for display
const formatDateDisplay = (dateString) => {
  const date = parseISO(dateString);

  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isTomorrow(date)) return "Tomorrow";

  return format(date, "EEEE, MMMM d");
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [groupedNotifications, setGroupedNotifications] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications only once on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        const data = await fetchNotifications();
        setNotifications(data);
        const grouped = groupNotificationsByDate(data);
        setGroupedNotifications(grouped);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []); // Empty dependency array to run only once

  const markAsRead = async (id) => {
    try {
      // Update locally first for immediate UI feedback
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Update the grouped notifications
      const updatedGrouped = groupNotificationsByDate(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setGroupedNotifications(updatedGrouped);

      // Send API request to update on server
      await markNotificationAsRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Revert on error
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: false }
            : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update locally first
      const updatedNotifications = notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
      setNotifications(updatedNotifications);
      setGroupedNotifications(groupNotificationsByDate(updatedNotifications));

      // Send API requests for all unread notifications
      const unreadIds = notifications
        .filter((n) => !n.isRead)
        .map((n) => n._id);
      await Promise.all(unreadIds.map((id) => markNotificationAsRead(id)));
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const getMealTypeColor = (mealType) => {
    switch (mealType) {
      case "breakfast":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "lunch":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "snack":
        return "bg-green-100 text-green-800 border-green-200";
      case "dinner":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getMealTypeIcon = (mealType) => {
    switch (mealType) {
      case "breakfast":
        return "☕";
      case "lunch":
        return "🌞";
      case "snack":
        return "🍎";
      case "dinner":
        return "🌙";
      default:
        return "⏰";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8 text-foreground" />
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            Mark all as read
          </Button>
        )}
      </div>

      {Object.keys(groupedNotifications).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              No notifications yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Your meal reminders will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications)
            .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
            .map(([date, dateNotifications]) => (
              <Card key={date}>
                <CardHeader className="pb-3 bg-muted">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {formatDateDisplay(date)}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {dateNotifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 flex items-start gap-4 ${
                          notification.isRead ? "opacity-70" : ""
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getMealTypeColor(
                              notification.mealType
                            )}`}
                          >
                            {getMealTypeIcon(notification.mealType)}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={getMealTypeColor(
                                notification.mealType
                              )}
                            >
                              {notification.mealType}
                            </Badge>
                            {!notification.isRead && (
                              <Badge
                                variant="secondary"
                                className="bg-primary text-primary-foreground"
                              >
                                New
                              </Badge>
                            )}
                          </div>

                          <p className="text-foreground font-medium mb-1">
                            {notification.message}
                          </p>

                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-1" />
                            {format(parseISO(notification.createdAt), "h:mm a")}
                          </div>
                        </div>

                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification._id)}
                            className="flex-shrink-0"
                            title="Mark as read"
                          >
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          </Button>
                        )}

                        {notification.isRead && (
                          <CheckCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
