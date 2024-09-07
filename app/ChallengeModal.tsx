import React, { useState } from 'react';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (duration: number) => void;
  timeLeft: number;
  challengeScore: number;
  isActive: boolean;
  isCompleted: boolean;  // New prop
  totalQuestions: number;  // New prop
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ 
  isOpen, onClose, onStart, timeLeft, challengeScore, isActive, isCompleted, totalQuestions 
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(60);

  if (!isOpen) return null;

  const handleStart = () => {
    onStart(selectedDuration);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Challenge Mode</h2>
        {!isActive && !isCompleted ? (
          <>
            <p>Select challenge duration:</p>
            <select value={selectedDuration} onChange={(e) => setSelectedDuration(Number(e.target.value))}>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
            </select>
            <p>Correct answers: +1 point</p>
            <p>Incorrect answers: -1 point</p>
            <button onClick={handleStart}>Start Challenge</button>
          </>
        ) : isActive ? (
          <>
            <p>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
            <p>Current Score: {challengeScore}</p>
          </>
        ) : (
          <>
            <h3>Challenge Completed!</h3>
            <p>Final Score: {challengeScore}</p>
            <p>Total Questions Attempted: {totalQuestions}</p>
            <p>Accuracy: {((challengeScore + totalQuestions) / (2 * totalQuestions) * 100).toFixed(2)}%</p>
            <button onClick={onClose}>Close</button>
          </>
        )}
        {!isCompleted && <button onClick={onClose}>Close</button>}
      </div>
    </div>
  );
};

export default ChallengeModal;
