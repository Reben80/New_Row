'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import Matrix from './Matrix';
import { generateRandomMatrix, applyRandomRowOperation, generateOptions } from './utils';
import ChallengeModal from './ChallengeModal';

type Tab = 'game' | 'instructions';

const App: React.FC = () => {
  const [matrixA, setMatrixA] = useState<number[][]>([]);
  const [matrixB, setMatrixB] = useState<number[][]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [correctOption, setCorrectOption] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('Choose an operation to transform Matrix A to Matrix B');
  const [challengeScore, setChallengeScore] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState<{ correct: number, incorrect: number }>({ correct: 0, incorrect: 0 });
  const [practiceScore, setPracticeScore] = useState<{ correct: number, incorrect: number }>({ correct: 0, incorrect: 0 });
  const [hasMounted, setHasMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('game');
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [feedbackAnimation, setFeedbackAnimation] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
  const [isChallengeModeActive, setIsChallengeModeActive] = useState<boolean>(false);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState<boolean>(false);
  const [totalQuestionsInChallenge, setTotalQuestionsInChallenge] = useState<number>(0);
  const [challengeDuration, setChallengeDuration] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);

  const playSound = (isCorrect: boolean) => {
    if (!isMuted) {
      const audio = new Audio(isCorrect ? '/correct.mp3' : '/incorrect.mp3');
      audio.volume = 0.5; // Adjust volume as needed
      audio.play().catch(error => console.error('Error playing sound:', error));
    }
  };

  useEffect(() => {
    setHasMounted(true);
    generateNewChallenge(); // Generate initial challenge when component mounts
  }, []);

  useEffect(() => {
    if (hasMounted) {
      const savedScore = localStorage.getItem('matrixGameScore');
      if (savedScore) {
        const parsedScore = JSON.parse(savedScore);
        setCurrentScore(parsedScore);
        setPracticeScore(parsedScore);
      }
    }
  }, [hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      // Save score to localStorage whenever it changes
      localStorage.setItem('matrixGameScore', JSON.stringify(currentScore));
    }
  }, [currentScore, hasMounted]);

  const resetGame = () => {
    setCurrentScore({ correct: 0, incorrect: 0 });
    setPracticeScore({ correct: 0, incorrect: 0 });
    setChallengeScore(0);
    setTimeLeft(60);
    setIsChallengeModeActive(false);
    setIsChallengeCompleted(false);
    setIsChallengeModalOpen(false);
    generateNewChallenge();
    localStorage.removeItem('matrixGameScore'); // Clear saved score
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isChallengeModeActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isChallengeModeActive) {
      endChallengeMode();
    }
    return () => clearTimeout(timer);
  }, [isChallengeModeActive, timeLeft]);

  const startChallengeMode = (duration: number) => {
    setPracticeScore(currentScore);
    setCurrentScore({ correct: 0, incorrect: 0 });
    setChallengeDuration(duration);
    setTimeLeft(duration);
    setChallengeScore(0);
    setIsChallengeModeActive(true);
    setTotalQuestionsInChallenge(0);
    generateNewChallenge();
  };

  const endChallengeMode = () => {
    setIsChallengeModeActive(false);
    setIsChallengeCompleted(true);
    setIsChallengeModalOpen(true);
  };

  const generateNewChallenge = () => {
    const newMatrixA = generateRandomMatrix();
    const { newMatrix: newMatrixB, operation } = applyRandomRowOperation(newMatrixA);
    setMatrixA(newMatrixA);
    setMatrixB(newMatrixB);
    const newOptions = generateOptions(operation, newMatrixA, newMatrixB);
    setOptions(newOptions);
    setCorrectOption(operation);
    setFeedback('Choose an operation to transform Matrix A to Matrix B');
    setIsAnswered(false);
  };

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;

    setIsAnswered(true);

    if (option === correctOption) {
      setFeedback('Correct! Well done!');
      setFeedbackAnimation('feedback-animation-correct');
      if (isChallengeModeActive) {
        setChallengeScore(prevScore => prevScore + 1);
      } else {
        setCurrentScore(prevScore => ({ ...prevScore, correct: prevScore.correct + 1 }));
      }
      playSound(true);
    } else {
      setFeedback(`Incorrect. The correct answer was: ${correctOption}. Keep trying!`);
      setFeedbackAnimation('feedback-animation-incorrect');
      if (isChallengeModeActive) {
        setChallengeScore(prevScore => prevScore - 1);
      } else {
        setCurrentScore(prevScore => ({ ...prevScore, incorrect: prevScore.incorrect + 1 }));
      }
      playSound(false);
    }

    if (isChallengeModeActive) {
      setTotalQuestionsInChallenge(prev => prev + 1);
    }

    setTimeout(() => {
      generateNewChallenge();
      setIsAnswered(false);
      setFeedbackAnimation('');
    }, isChallengeModeActive ? 1000 : 2000);
  };

  const stopChallengeMode = () => {
    if (window.confirm("Are you sure you want to stop the challenge? Your current progress will be lost.")) {
      endChallengeMode();
    }
  };

  if (!hasMounted) {
    // Render nothing until the client has mounted
    return null;
  }

  return (
    <div className="App">
      <header>
        <h1>Row <span className="highlight">Operations</span> Challenge</h1>
        <h2>Elementary Row Operations Challenge</h2>
      </header>
      <div className="tab-container">
        <button 
          className={`tab ${activeTab === 'game' ? 'active' : ''}`} 
          onClick={() => setActiveTab('game')}
        >
          Game
        </button>
        <button 
          className={`tab ${activeTab === 'instructions' ? 'active' : ''}`} 
          onClick={() => setActiveTab('instructions')}
        >
          Instructions
        </button>
      </div>
      {activeTab === 'game' && (
        <>
          <div className="scoreboard">
            {!isChallengeModeActive ? (
              <>
                <div className="score-item">
                  <span className="score-label">Correct:</span>
                  <span className="score-value correct">{currentScore.correct}</span>
                </div>
                <div className="score-item">
                  <span className="score-label">Incorrect:</span>
                  <span className="score-value incorrect">{currentScore.incorrect}</span>
                </div>
              </>
            ) : (
              <div className="score-item">
                <span className="score-label">Challenge Score:</span>
                <span className="score-value">{challengeScore}</span>
              </div>
            )}
          </div>
          {isChallengeModeActive && (
            <div className="timer">
              <span className="timer-label">Time Left:</span>
              <span className="timer-value">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          )}
          <div className="game-controls">
            {!isChallengeModeActive ? (
              <button className="challenge-mode-button" onClick={() => setIsChallengeModalOpen(true)}>Challenge Mode</button>
            ) : (
              <button className="stop-challenge-button" onClick={stopChallengeMode}>Stop Challenge</button>
            )}
            <button className="new-challenge-button" onClick={generateNewChallenge}>New Challenge</button>
            <button className="reset-button" onClick={resetGame}>Reset Game</button>
          </div>
          <div className={`game-area ${feedbackAnimation}`}>
            <div className="matrices">
              <div>
                <h2>Matrix A</h2>
                <Matrix data={matrixA} />
              </div>
              <div>
                <h2>Matrix B</h2>
                <Matrix data={matrixB} />
              </div>
            </div>
            <div className="options">
              {options.map((option, index) => (
                <button 
                  key={index} 
                  onClick={() => handleOptionClick(option)}
                  disabled={isAnswered}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <ChallengeModal 
            isOpen={isChallengeModalOpen}
            onClose={() => {
              setIsChallengeModalOpen(false);
              setIsChallengeCompleted(false);
            }}
            onStart={startChallengeMode}
            timeLeft={timeLeft}
            challengeScore={challengeScore}
            isActive={isChallengeModeActive}
            isCompleted={isChallengeCompleted}
            totalQuestions={totalQuestionsInChallenge}
          />
        </>
      )}
      {activeTab === 'instructions' && (
        <div className="info-section">
          <h3>Row Operations of Matrices</h3>
          <p>Elementary row operations are used to simplify matrices and solve systems of linear equations. The three types of operations are:</p>
          <ol>
            <li>
              <strong>Swapping two rows:</strong> R<sub>i</sub> ↔ R<sub>j</sub>
              <p>Example: R<sub>1</sub> ↔ R<sub>2</sub> swaps the first and second rows</p>
              <div className="example-matrix">
                <Matrix data={[[1, 2, 3], [4, 5, 6], [7, 8, 9]]} />
                <div className="operation-arrow">
                  <span className="operation-text">R<sub>1</sub> ↔ R<sub>2</sub></span>
                </div>
                <Matrix data={[[4, 5, 6], [1, 2, 3], [7, 8, 9]]} />
              </div>
            </li>
            <li>
              <strong>Multiplying a row by a non-zero scalar:</strong> R<sub>i</sub> → cR<sub>i</sub>
              <p>Example: R<sub>2</sub> → 2R<sub>2</sub> multiplies the second row by 2</p>
              <div className="example-matrix">
                <Matrix data={[[1, 2, 3], [4, 5, 6], [7, 8, 9]]} />
                <div className="operation-arrow">
                  <span className="operation-text">R<sub>2</sub> → 2R<sub>2</sub></span>
                </div>
                <Matrix data={[[1, 2, 3], [8, 10, 12], [7, 8, 9]]} />
              </div>
            </li>
            <li>
              <strong>Adding a multiple of one row to another row:</strong> R<sub>i</sub> → R<sub>i</sub> + cR<sub>j</sub>
              <p>Example: R<sub>3</sub> → R<sub>3</sub> + 2R<sub>1</sub> adds twice the first row to the third row</p>
              <div className="example-matrix">
                <Matrix data={[[1, 2, 3], [4, 5, 6], [7, 8, 9]]} />
                <div className="operation-arrow">
                  <span className="operation-text">R<sub>3</sub> → R<sub>3</sub> + 2R<sub>1</sub></span>
                </div>
                <Matrix data={[[1, 2, 3], [4, 5, 6], [9, 12, 15]]} />
              </div>
            </li>
          </ol>
          <p>In this game, you'll be presented with two matrices (A and B) and asked to identify which operation transforms A into B.</p>
        </div>
      )}
      <footer>
        <div className="footer-content">
          <span>Created by Rebin</span>
          <a href="https://twitter.com/rebin3" target="_blank" rel="noopener noreferrer">@rebin3</a>
          <a href="https://rebinmuhammad.com" target="_blank" rel="noopener noreferrer">rebinmuhammad.com</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
