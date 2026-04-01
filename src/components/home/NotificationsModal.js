function NotificationsModal({ isOpen, onClose, notifications }) {
  if (!isOpen) return null;

  return (
    <div className="notifications-modal">
      <div className="notifications-header">
        <h4>Notifications</h4>
        <button className="close-notif" onClick={onClose}>×</button>
      </div>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-cart">No notifications</div>
        ) : (
          notifications.map(notif => (
            <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
              <div className="notification-title">{notif.title}</div>
              <div className="notification-message">{notif.message}</div>
              <div className="notification-time">{notif.time}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsModal;