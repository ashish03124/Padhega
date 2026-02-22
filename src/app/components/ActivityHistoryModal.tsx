import React from 'react';
import { ActivityLog } from '../lib/statsTypes';
import '../stats/stats.css';

interface ActivityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityLog[];
}

const ActivityHistoryModal: React.FC<ActivityHistoryModalProps> = ({
  isOpen,
  onClose,
  activities,
}) => {
  if (!isOpen) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Activity History</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="history-list">
          {activities.length === 0 ? (
            <div className="empty-state">
              <p>No study sessions yet!</p>
              <p className="empty-hint">Complete a Pomodoro session to see it here.</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="history-item">
                <div className="history-marker">
                  <span className="history-icon">{activity.icon}</span>
                </div>
                <div className="history-content">
                  <div className="history-time">{formatDate(activity.timestamp)}</div>
                  <div className="history-activity">
                    <span>{activity.activity}</span>
                    <span className="history-duration">
                      ({Math.round(activity.duration)} min)
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="close-modal-btn" onClick={onClose}>
          Close
        </button>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .history-modal-content {
          background: linear-gradient(135deg, rgba(6, 78, 59, 0.95), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(52, 211, 153, 0.3);
          border-radius: 12px;
          padding: 2rem;
          width: 90%;
          max-width: 700px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: #cbd5e1;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #f8fafc;
        }

        .history-list {
          flex: 1;
          overflow-y: auto;
          padding-right: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .history-list::-webkit-scrollbar {
          width: 8px;
        }

        .history-list::-webkit-scrollbar-track {
          background: rgba(6, 78, 59, 0.2);
          border-radius: 4px;
        }

        .history-list::-webkit-scrollbar-thumb {
          background: rgba(52, 211, 153, 0.4);
          border-radius: 4px;
        }

        .history-list::-webkit-scrollbar-thumb:hover {
          background: rgba(52, 211, 153, 0.6);
        }

        .history-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 1rem;
          background: rgba(6, 78, 59, 0.2);
          border-radius: 8px;
          border: 1px solid rgba(52, 211, 153, 0.15);
          transition: all 0.2s;
        }

        .history-item:hover {
          background: rgba(16, 185, 129, 0.25);
          transform: translateX(5px);
          border-color: rgba(52, 211, 153, 0.3);
        }

        .history-marker {
          flex-shrink: 0;
        }

        .history-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: linear-gradient(135deg, #10b981, #34d399);
          font-weight: 700;
          font-size: 1.25rem;
          color: white;
        }

        .history-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .history-time {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .history-activity {
          color: #f8fafc;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .history-duration {
          font-size: 0.875rem;
          color: #34d399;
          font-weight: 600;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
        }

        .empty-state p {
          font-size: 1.125rem;
          color: #cbd5e1;
          margin-bottom: 0.5rem;
        }

        .empty-hint {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .close-modal-btn {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #10b981, #34d399);
          border: none;
          border-radius: 8px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }

        .close-modal-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </div>
  );
};

export default ActivityHistoryModal;
