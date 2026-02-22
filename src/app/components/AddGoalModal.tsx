import React, { useState } from 'react';
import '../stats/stats.css';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: {
    name: string;
    targetValue: number;
    unit: 'hours' | 'minutes' | 'days' | 'percentage';
    timeFrame: 'daily' | 'weekly' | 'monthly';
    deadline?: number;
  }) => void;
}

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState<'hours' | 'minutes' | 'days' | 'percentage'>('hours');
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !targetValue) return;

    onSave({
      name,
      targetValue: parseFloat(targetValue),
      unit,
      timeFrame,
    });

    // Reset form
    setName('');
    setTargetValue('');
    setUnit('hours');
    setTimeFrame('weekly');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Goal</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-group">
            <label htmlFor="goalName">Goal Name</label>
            <input
              id="goalName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Daily Study Target"
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="targetValue">Target</label>
              <input
                id="targetValue"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="4"
                className="form-input"
                step="0.5"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="form-select"
              >
                <option value="hours">Hours</option>
                <option value="minutes">Minutes</option>
                <option value="days">Days</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="timeFrame">Time Frame</label>
            <select
              id="timeFrame"
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value as any)}
              className="form-select"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add Goal
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 2rem;
          width: 90%;
          max-width: 500px;
          box-shadow: var(--glass-shadow);
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
          color: var(--text-primary);
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          color: var(--text-secondary);
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
          background: var(--bg-overlay-light);
          color: var(--text-primary);
        }

        .goal-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input,
        .form-select {
          padding: 0.75rem 1rem;
          background: var(--input-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: var(--primary);
          background: var(--card-bg-hover);
          box-shadow: 0 0 0 3px rgba(48, 82, 41, 0.1);
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .btn-secondary,
        .btn-primary {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-secondary {
          background: var(--bg-overlay-light);
          color: var(--text-secondary);
          border: 1px solid var(--glass-border);
        }

        .btn-secondary:hover {
          background: var(--bg-overlay-medium);
          color: var(--text-primary);
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          box-shadow: 0 4px 15px rgba(48, 82, 41, 0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(48, 82, 41, 0.4);
        }
      `}</style>
    </div>
  );
};

export default AddGoalModal;
