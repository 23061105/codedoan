
import { useAuthStore } from "../store/useAuthStore";

function Notifications() {
  // Lấy danh sách thông báo và hàm remove từ store
  const { notifications, removeNotification } = useAuthStore();

  if (notifications.length === 0) return null; // Không có thông báo nào

  return (
    <div className="notification-container">
      {notifications.map((notif, index) => (
        <div className="notification-popup" key={index}>
          <span>{notif.message}</span>
          <button className="close-btn" onClick={() => removeNotification(index)}>×</button>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
