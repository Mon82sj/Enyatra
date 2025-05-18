import React, { useEffect, useState } from 'react';
import { Button, Card, Container, Row, Col, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import { RefreshCcw, Play, Timer, Brain, Trophy, X, Paintbrush } from 'lucide-react';
import ReactConfetti from 'react-confetti';
import Grid from '../components/Grid';
import { generatePuzzleBatch } from './NonogramPuzzleGenerator';
import { getCluesFromGrid } from './getCluesFromGrid';
import { askAI } from './NonogramAi';

const LEVELS = [
  { label: 'Easy', size: 5 },
  { label: 'Medium', size: 8 },
  { label: 'Hard', size: 10 },
];
const TOTAL_TIME = 1 * 60; // 10 minutes

function Nonogram() {
  const [puzzles, setPuzzles] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [playerGrid, setPlayerGrid] = useState(null);
  const [result, setResult] = useState('');
  const [resetCount, setResetCount] = useState(0);
  const [mode, setMode] = useState('fill');
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [levelTransitioning, setLevelTransitioning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const load = async () => {
      const batch = await generatePuzzleBatch();
      if (!batch) return;
      const levels = ['easy', 'medium', 'hard'];
      const result = levels.map(key => ({
        solution: batch[key],
        clues: getCluesFromGrid(batch[key]),
      }));
      setPuzzles(result);
    };
    load();
  }, []);

  useEffect(() => {
    if (!timerStarted || gameOver) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted, gameOver]);

  useEffect(() => {
    if (gameOver) {
      generateAIFeedback();
    }
  }, [gameOver]);

  const generateAIFeedback = async () => {
    const message = `The player completed ${currentLevel} out of 3 levels. Give a friendly, short feedback in 2-3 lines only.`;
    const response = await askAI(message);
    setResult(response);
  };

  const formatTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  const getTimerVariant = () =>
    timeLeft <= 30 ? 'danger' : timeLeft <= 60 ? 'warning' : 'success';

  const startGame = () => setTimerStarted(true);

  const handleCheck = () => {
    const current = puzzles[currentLevel];
    const isCorrect = playerGrid.every((row, r) =>
      row.every((cell, c) => cell === (current.solution[r][c] === 1 ? 'filled' : null))
    );
    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => {
        if (currentLevel + 1 < puzzles.length) {
          setLevelTransitioning(true);
          setTimeout(() => {
            setCurrentLevel((l) => l + 1);
            setResetCount(0);
            setLevelTransitioning(false);
            setShowConfetti(false);
          }, 1000);
        } else {
          setGameOver(true);
        }
      }, 1000);
    } else {
      setShowConfetti(false);
    }
  };

  useEffect(() => {
    if (!playerGrid || !puzzles.length || gameOver) return;

    const current = puzzles[currentLevel];
    const isCorrect = playerGrid.every((row, r) =>
      row.every((cell, c) => cell === (current.solution[r][c] === 1 ? 'filled' : null))
    );

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => {
        if (currentLevel + 1 < puzzles.length) {
          setLevelTransitioning(true);
          setTimeout(() => {
            setCurrentLevel((l) => l + 1);
            setResetCount(0);
            setLevelTransitioning(false);
            setShowConfetti(false);
          }, 1000);
        } else {
          setGameOver(true);
        }
      }, 1000);
    }
  }, [playerGrid]);

  if (puzzles.length === 0) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading puzzles...</p>
      </Container>
    );
  }

  const { solution, clues } = puzzles[currentLevel];
  const size = LEVELS[currentLevel].size;

  if (gameOver) {
    return (
      <Container className="text-center my-5">
        <Card className="p-4 shadow-lg">
          <h1><Trophy className="text-success mb-2" size={48} /> Game Over!</h1>
          <Card.Body>
            <p><strong>Levels Completed:</strong> {currentLevel} / 3</p>
            <p><strong>Time Left:</strong> {formatTime(timeLeft)}</p>
            <Button variant="primary" className="mt-3" onClick={() => window.location.reload()}>
              <RefreshCcw className="me-2" /> Restart
            </Button>
            <Alert variant="info" className="mt-4">
              <h5><Brain className="me-2" /> AI Feedback</h5>
              <p>{result}</p>
            </Alert>
          </Card.Body>
          <ReactConfetti width={window.innerWidth} height={window.innerHeight} />
        </Card>
      </Container>
    );
  }

  return (
    <Container className={`my-5 ${levelTransitioning ? 'fade' : ''}`}>
      <Card className="p-4 shadow-lg">
        {!timerStarted ? (
          <div className="text-center">
            <h1 className="mb-3">Nonogram Challenge</h1>
            <p>Welcome to the ultimate Nonogram experience. Solve puzzles before time runs out!</p>
            <Row className="mb-3">
              {LEVELS.map((lvl, i) => (
                <Col key={i}><strong>{lvl.label}:</strong> {lvl.size}x{lvl.size}</Col>
              ))}
            </Row>
            <Button size="lg" variant="success" onClick={startGame}>
              <Play className="me-2" /> Start Game
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <Row className="align-items-center mb-3">
              <Col><h4>Level {currentLevel + 1} / 3 - {LEVELS[currentLevel].label}</h4></Col>
              <Col className="text-end">
                <Button
                  variant="outline-secondary"
                  className="me-2"
                  onClick={() => setResetCount(c => c + 1)}
                >
                  <RefreshCcw size={18} className="me-1" /> Reset
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => setMode(m => (m === 'fill' ? 'x' : 'fill'))}
                >
                  {mode === 'fill' ? <Paintbrush size={18} className="me-1" /> : <X size={18} className="me-1" />}
                  {mode === 'fill' ? 'Fill Mode' : 'X Mode'}
                </Button>
              </Col>
            </Row>

            {/* Timer */}
            <div className="d-flex align-items-center mb-4">
              <Timer size={20} className="me-2" />
              <ProgressBar now={(timeLeft / TOTAL_TIME) * 100} variant={getTimerVariant()} className="flex-grow-1" />
              <span className="ms-3 fw-bold">{formatTime(timeLeft)}</span>
            </div>

            {/* Game Grid */}
            <Grid
              size={size}
              initialGrid={solution}
              clues={clues}
              onGridChange={setPlayerGrid}
              resetTrigger={resetCount}
              mode={mode}
            />

            {showConfetti && <ReactConfetti width={window.innerWidth} height={window.innerHeight} />}

            {/* Progress */}
            <ProgressBar
              animated
              now={((currentLevel + 1) / 3) * 100}
              className="mt-4"
              variant="info"
              style={{ height: '8px' }}
            />
          </>
        )}
      </Card>
    </Container>
  );
}

export default Nonogram;
