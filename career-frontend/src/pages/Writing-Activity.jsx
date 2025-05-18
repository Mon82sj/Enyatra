import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { Button, Form, Card, ProgressBar, Container, Row, Col } from 'react-bootstrap';
import { CheckCircle, XCircle, Edit, PlayCircle } from 'lucide-react';  // Lucide icons
import { useSpring, animated } from 'react-spring';  // for animations

const WritingActivity = () => {
  const [screen, setScreen] = useState('home');
  const [tasks, setTasks] = useState([]);
  const [storyStarter, setStoryStarter] = useState('');
  const [taskIndex, setTaskIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [userAnswers, setUserAnswers] = useState([]);
  const [level1Score, setLevel1Score] = useState(0);
  const [level2Input, setLevel2Input] = useState('');
  const [level2Score, setLevel2Score] = useState(0);
  const [timer, setTimer] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const totalScore = level1Score + level2Score;

  // Fetch tasks and story starter
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/fetchTasks');
      const data = await response.json();
      setTasks(data.tasks);
      setStoryStarter(data.storyStarter);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const startGame = () => {
    if (tasks.length === 0) {
      alert("Tasks are loading. Please wait!");
      return;
    }
    setScreen('level1');
    setTimer(300);
    setTimerRunning(true);
  };

  // Timer management
  useEffect(() => {
    let interval;
    if (timerRunning && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      handleTimeout();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timer]);

  const resetTimer = () => {
    setTimer(300);
  };

  const handleTimeout = async () => {
    if (screen === 'level1') {
      await evaluateLevel1();
      setScreen('level2');
      resetTimer();
      setTimerRunning(true);
    } else if (screen === 'level2') {
      await handleLevel2Submit();
    }
  };

  // Level 1 - Handling user selection
  const handleLevel1Submit = () => {
    if (selectedOption === '') return;
    setUserAnswers([...userAnswers, selectedOption]);
    setSelectedOption('');
    if (taskIndex === tasks.length - 1) {
      evaluateLevel1();
      setScreen('level2');
      resetTimer();
      setTimerRunning(true);
    } else {
      setTaskIndex(taskIndex + 1);
    }
  };

  // Level 1 - Evaluate answers
  const evaluateLevel1 = async () => {
    try {
      const answersData = tasks.map((task, idx) => ({
        question: task.question,
        correctAnswer: task.answer,
        userAnswer: userAnswers[idx] || "None",
      }));

      const response = await fetch('http://localhost:5000/api/evaluateLevel1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answersData }),
      });

      const result = await response.json();
      setLevel1Score(result.score || 0);
    } catch (error) {
      console.error('Error evaluating Level 1:', error);
      setLevel1Score(0);
    }
  };

  // Level 2 - Submit and evaluate
  const handleLevel2Submit = async () => {
    if (level2Input.trim() === '') return;
    await evaluateLevel2();
    setScreen('final');
    setTimerRunning(false);
    setShowConfetti(true);
  };

  const evaluateLevel2 = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/evaluateLevel2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level2Input }),
      });

      const result = await response.json();
      const total = Math.min(result.creativity + result.grammar + result.engagement, 25);
      setLevel2Score(total);
      setAiFeedback(result.feedback);
    } catch (error) {
      console.error('Error evaluating Level 2:', error);
      setLevel2Score(0);
      setAiFeedback("Couldn't evaluate writing. Try again later.");
    }
  };

  // Animated button for smooth transitions
  const animationProps = useSpring({
    opacity: loading ? 0 : 1,
    transform: loading ? 'scale(0.8)' : 'scale(1)',
  });

  return (
    <div className="App">
      {showConfetti && <Confetti />}
      
      {loading ? (
        <div className="screen">
          <h2>Loading tasks, please wait...</h2>
        </div>
      ) : screen === 'home' ? (
        <div className="screen">
          <h1 className="title">📝 Welcome to the Writing Challenge!</h1>
          <animated.div style={animationProps}>
            <Button variant="primary" onClick={startGame}>Start Game <PlayCircle size={20} /></Button>
          </animated.div>
        </div>
      ) : screen === 'level1' ? (
        <div className="screen">
          <h2>✍️ Level 1: Quick Questions</h2>
          <p><strong>Time Left:</strong> {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
          <ProgressBar now={(taskIndex + 1) / tasks.length * 100} label={`Question ${taskIndex + 1} of ${tasks.length}`} />

          {tasks.length > 0 && tasks[taskIndex] ? (
            <>
              <Card className="question-card">
                <Card.Body>
                  <Card.Title><strong>Question {taskIndex + 1}:</strong> {tasks[taskIndex].question}</Card.Title>
                  <div className="options">
                    {tasks[taskIndex].options.map((opt, idx) => (
                      <Card
                        key={idx}
                        className={`option-card ${selectedOption === String.fromCharCode(65 + idx) ? 'selected' : ''}`}
                        onClick={() => setSelectedOption(String.fromCharCode(65 + idx))}
                      >
                        <Card.Body>{String.fromCharCode(65 + idx)}. {opt}</Card.Body>
                      </Card>
                    ))}
                  </div>
                </Card.Body>
              </Card>
              <Button variant="success" onClick={handleLevel1Submit}>
                Submit <CheckCircle size={18} />
              </Button>
            </>
          ) : (
            <p>Loading questions...</p>
          )}
        </div>
      ) : screen === 'level2' ? (
        <div className="screen">
          <h2>🧠 Level 2: Creative Writing</h2>
          <p><em>Starter:</em> "{storyStarter}"</p>
          <textarea
            value={level2Input}
            onChange={e => setLevel2Input(e.target.value)}
            placeholder="Continue writing..."
            className="textarea"
          />
          <Button variant="primary" onClick={handleLevel2Submit}>
            Submit <Edit size={18} />
          </Button>
        </div>
      ) : (
        <div className="screen">
          <h2>🏆 Final Results</h2>
          <p><strong>Level 1 Score:</strong> {level1Score}/75</p>
          <p><strong>Level 2 Score:</strong> {level2Score}/25</p>
          <p><strong>Total Score:</strong> {totalScore}/100</p>
          <h3>{aiFeedback}</h3>
          <Button variant="secondary" onClick={() => window.location.reload()}>Play Again</Button>
        </div>
      )}
    </div>
  );
};

export default WritingActivity;
