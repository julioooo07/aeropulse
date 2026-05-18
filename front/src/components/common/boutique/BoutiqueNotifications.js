import { Bell, CheckCircle } from "@phosphor-icons/react";
import BoutiqueDrawer from "./BoutiqueDrawer";
import { BQ_COLORS, BQ_FONTS, BQ_GEOMETRY, BQ_SHADOWS } from "./BoutiqueTheme";

export default function BoutiqueNotifications({
  isOpen,
  onClose,
  notifications = [],
  onNotificationClick,
  onMarkAllAsRead,
}) {
  const unreadCount = notifications.filter((notification) => notification.unread).length;

  return (
    <BoutiqueDrawer isOpen={isOpen} onClose={onClose} title="Notifications" side="right" width={BQ_GEOMETRY.cartWidth}>
      <div className="bq-notifications-panel">
        <div className="bq-notifications-summary">
          <div>
            <p className="bq-notifications-kicker">Recent activity</p>
            <h3 className="bq-notifications-title">{unreadCount > 0 ? `${unreadCount} unread updates` : "All caught up"}</h3>
          </div>
          {unreadCount > 0 && (
            <button type="button" className="bq-notifications-mark-all" onClick={onMarkAllAsRead}>
              <CheckCircle size={18} weight="bold" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="bq-notifications-list">
          {notifications.length === 0 ? (
            <div className="bq-notifications-empty">
              <div className="bq-notifications-empty-icon">
                <Bell size={24} weight="bold" />
              </div>
              <p>No notifications yet.</p>
              <span>Important updates will appear here.</span>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`bq-notification-item ${notification.unread ? "is-unread" : ""}`}
                onClick={() => onNotificationClick?.(notification.id)}
              >
                <div className="bq-notification-dot" aria-hidden="true" />
                <div className="bq-notification-body">
                  <div className="bq-notification-head">
                    <strong>{notification.title || "Notification"}</strong>
                    <span>{notification.time || "Just now"}</span>
                  </div>
                  <p>{notification.message || "You have a new update."}</p>
                </div>
                <div className="bq-notification-meta">
                  {notification.unread ? <span className="bq-notification-pill bq-notification-pill--unread">New</span> : <span className="bq-notification-pill">Read</span>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-notifications-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: linear-gradient(180deg, ${BQ_COLORS.surface} 0%, ${BQ_COLORS.bgAlt} 100%);
        }

        .bq-notifications-summary {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding: 24px 32px 20px;
          border-bottom: 1px solid ${BQ_COLORS.border};
          background: rgba(255, 255, 255, 0.86);
          backdrop-filter: blur(10px);
        }

        .bq-notifications-kicker {
          margin: 0 0 6px;
          font-family: ${BQ_FONTS.heading};
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: ${BQ_COLORS.inkMuted};
        }

        .bq-notifications-title {
          margin: 0;
          font-family: ${BQ_FONTS.heading};
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: ${BQ_COLORS.ink};
        }

        .bq-notifications-mark-all {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid ${BQ_COLORS.border};
          border-radius: ${BQ_GEOMETRY.radiusPill};
          padding: 10px 14px;
          background: ${BQ_COLORS.surface};
          color: ${BQ_COLORS.ink};
          font-family: ${BQ_FONTS.heading};
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: ${BQ_SHADOWS.soft};
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          white-space: nowrap;
        }

        .bq-notifications-mark-all:hover {
          transform: translateY(-1px);
          box-shadow: ${BQ_SHADOWS.float};
        }

        .bq-notifications-list {
          display: grid;
          gap: 12px;
          padding: 20px 24px 28px;
          overflow-y: auto;
        }

        .bq-notifications-empty {
          margin-top: 40px;
          padding: 36px 24px;
          border: 1px dashed ${BQ_COLORS.border};
          border-radius: ${BQ_GEOMETRY.radiusCard};
          background: rgba(255, 255, 255, 0.7);
          text-align: center;
          color: ${BQ_COLORS.inkMuted};
        }

        .bq-notifications-empty-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 16px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.04);
          color: ${BQ_COLORS.ink};
        }

        .bq-notifications-empty p {
          margin: 0 0 8px;
          font-family: ${BQ_FONTS.heading};
          font-size: 16px;
          font-weight: 800;
          color: ${BQ_COLORS.ink};
        }

        .bq-notifications-empty span {
          display: block;
          font-size: 13px;
          line-height: 1.6;
        }

        .bq-notification-item {
          display: grid;
          grid-template-columns: 12px minmax(0, 1fr) auto;
          gap: 14px;
          align-items: start;
          width: 100%;
          border: 1px solid ${BQ_COLORS.border};
          border-radius: ${BQ_GEOMETRY.radiusMd};
          padding: 16px;
          background: ${BQ_COLORS.surface};
          box-shadow: ${BQ_SHADOWS.soft};
          cursor: pointer;
          text-align: left;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }

        .bq-notification-item:hover {
          transform: translateY(-1px);
          box-shadow: ${BQ_SHADOWS.float};
        }

        .bq-notification-item.is-unread {
          border-color: rgba(37, 99, 235, 0.2);
          background: linear-gradient(180deg, rgba(37, 99, 235, 0.04), rgba(255, 255, 255, 1));
        }

        .bq-notification-dot {
          width: 10px;
          height: 10px;
          margin-top: 6px;
          border-radius: 999px;
          background: ${BQ_COLORS.inkFaint};
        }

        .bq-notification-item.is-unread .bq-notification-dot {
          background: ${BQ_COLORS.accent};
          box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.12);
        }

        .bq-notification-body {
          min-width: 0;
        }

        .bq-notification-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: baseline;
          margin-bottom: 6px;
        }

        .bq-notification-head strong {
          font-family: ${BQ_FONTS.heading};
          font-size: 14px;
          font-weight: 800;
          color: ${BQ_COLORS.ink};
        }

        .bq-notification-head span {
          flex-shrink: 0;
          font-size: 12px;
          color: ${BQ_COLORS.inkMuted};
          white-space: nowrap;
        }

        .bq-notification-body p {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          color: ${BQ_COLORS.inkMuted};
        }

        .bq-notification-meta {
          display: flex;
          align-items: flex-start;
        }

        .bq-notification-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 54px;
          padding: 6px 10px;
          border-radius: ${BQ_GEOMETRY.radiusPill};
          background: rgba(0, 0, 0, 0.04);
          font-family: ${BQ_FONTS.heading};
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${BQ_COLORS.inkMuted};
        }

        .bq-notification-pill--unread {
          background: rgba(37, 99, 235, 0.12);
          color: ${BQ_COLORS.accent};
        }

        @media (max-width: 480px) {
          .bq-notifications-summary {
            flex-direction: column;
          }

          .bq-notification-item {
            grid-template-columns: 12px minmax(0, 1fr);
          }

          .bq-notification-meta {
            grid-column: 2;
          }
        }
      `,
        }}
      />
    </BoutiqueDrawer>
  );
}
