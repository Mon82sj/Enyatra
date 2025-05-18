import React, { useEffect, useRef, useState } from 'react';
import { Container, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import confetti from 'react-confetti';

const TowerOfHanoi = () => {
  const [numDisks, setNumDisks] = useState(5);
  const [towers, setTowers] = useState([[], [], []]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [coins, setCoins] = useState(100);
  const [bestScores, setBestScores] = useState(() =>
    JSON.parse(localStorage.getItem('bestScores') || '{}')
  );
  const [gameStarted, setGameStarted] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (gameStarted) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameStarted]);

  const startGame = () => {
    setTowers([[...Array(numDisks).keys()].reverse(), [], []]);
    setMoves(0);
    setTimer(0);
    setAiResponse('');
    setGameStarted(true);
  };

  const resetGame = () => {
    if (window.confirm('Reset the game?')) startGame();
  };

  const goHome = () => {
    clearInterval(timerRef.current);
    setGameStarted(false);
    setAiResponse('');
  };

  const dragStart = (e, from, disk) => {
    const topDisk = towers[from][towers[from].length - 1];
    if (disk === topDisk) {
      e.dataTransfer.setData('from', from);
    } else {
      e.preventDefault();
    }
  };

  const dropDisk = (e, to) => {
    const from = parseInt(e.dataTransfer.getData('from'));
    const fromStack = [...towers[from]];
    const toStack = [...towers[to]];

    if (fromStack.length === 0) return;

    const movingDisk = fromStack[fromStack.length - 1];
    if (toStack.length === 0 || toStack[toStack.length - 1] > movingDisk) {
      fromStack.pop();
      toStack.push(movingDisk);

      const newTowers = [...towers];
      newTowers[from] = fromStack;
      newTowers[to] = toStack;

      setTowers(newTowers);
      setMoves((m) => m + 1);
      checkWin(newTowers);
    }
  };

  const checkWin = (currentTowers) => {
    if (
      currentTowers[1].length === numDisks ||
      currentTowers[2].length === numDisks
    ) {
      clearInterval(timerRef.current);
      launchConfetti();
      setTimeout(() => {
        alert(`🎉 You won in ${moves} moves and ${timer} seconds!`);
      }, 200);

      const best = bestScores[numDisks];
      if (!best || moves < best.moves) {
        const updated = {
          ...bestScores,
          [numDisks]: { moves, time: timer },
        };
        setBestScores(updated);
        localStorage.setItem('bestScores', JSON.stringify(updated));
      }

      setCoins((c) => c + 20);
    }
  };

  const hanoiStepsDynamic = (state, n, src, aux, dest, steps = []) => {
    if (n === 1) {
      steps.push([src, dest]);
    } else {
      hanoiStepsDynamic(state, n - 1, src, dest, aux, steps);
      steps.push([src, dest]);
      hanoiStepsDynamic(state, n - 1, aux, src, dest, steps);
    }
    return steps;
  };

  const askAI = () => {
    if (coins < 5) {
      alert('Not enough coins!');
      return;
    }

    setAiResponse('Thinking...');
    const allDisks = [...towers[0], ...towers[1], ...towers[2]].length;
    const steps = hanoiStepsDynamic([...towers], allDisks, 0, 1, 2);

    for (const [from, to] of steps) {
      if (
        towers[from].length > 0 &&
        (towers[to].length === 0 ||
          towers[to][towers[to].length - 1] > towers[from][towers[from].length - 1])
      ) {
        setAiResponse(`Move disk from Tower ${from + 1} to Tower ${to + 1}`);
        setCoins((c) => c - 5);
        return;
      }
    }

    setAiResponse('No valid moves found.');
  };

  const launchConfetti = () => {
    const duration = 2 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      confetti({
        ...defaults,
        particleCount: 50 * (timeLeft / duration),
        origin: { x: Math.random(), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  return (
    <Container className="text-center mt-5 text-white">
      <h1 className="mb-4">Tower of Hanoi</h1>

      {!gameStarted ? (
        <>
          <p>Select number of disks to start playing:</p>
          <Form.Select
            style={{ maxWidth: 200, margin: '0 auto' }}
            value={numDisks}
            onChange={(e) => setNumDisks(parseInt(e.target.value))}
          >
            {[5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Form.Select>
          <Button className="mt-3" onClick={startGame}>
            Start Game
          </Button>
        </>
      ) : (
        <>
          <Row className="mb-3">
            <Col>
              <Button onClick={resetGame}>Reset</Button>{' '}
              <Button variant="warning" onClick={askAI}>
                Hint (-5 coins)
              </Button>{' '}
              <Button variant="secondary" onClick={goHome}>
                Back to Home
              </Button>
            </Col>
          </Row>

          <div className="mb-3">
            <Alert variant="dark">
              Moves: {moves} | Time: {timer}s | Coins: {coins} | Best ({numDisks}):{' '}
              {bestScores[numDisks]
                ? `${bestScores[numDisks].moves} moves in ${bestScores[numDisks].time}s`
                : '—'}
            </Alert>
          </div>

          <div className="d-flex justify-content-center gap-5">
            {towers.map((tower, towerIdx) => (
              <div
                key={towerIdx}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => dropDisk(e, towerIdx)}
                style={{
                  width: 160,
                  height: 340,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 20,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  alignItems: 'center',
                  paddingBottom: 20,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 40,
                    width: 10,
                    height: 270,
                    background: '#bbb',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    borderRadius: 4,
                  }}
                ></div>
                {tower.map((disk, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={(e) => dragStart(e, towerIdx, disk)}
                    style={{
                      height: 26,
                      borderRadius: 13,
                      margin: 4,
                      width: `${60 + disk * 20}px`,
                      background: [
                        '#ff6f61',
                        '#f4d03f',
                        '#76d7c4',
                        '#5dade2',
                        '#af7ac5',
                        '#48c9b0',
                        '#ff9ff3',
                        '#00cec9',
                      ][disk % 8],
                      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    }}
                  ></div>
                ))}
              </div>
            ))}
          </div>

          {aiResponse && (
            <Alert className="mt-4" variant="info">
              {aiResponse}
            </Alert>
          )}
        </>
      )}
    </Container>
  );
};

export default TowerOfHanoi;
