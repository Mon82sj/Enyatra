import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Container, Button, Card, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Image from "./image.jpg";

const App = () => {
  const [level, setLevel] = useState(1);
  const [puzzle, setPuzzle] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [selectedShape, setSelectedShape] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [levelTimeRecord, setLevelTimeRecord] = useState({});
  const [isLevelStarted, setIsLevelStarted] = useState(false);
  const [completedCells, setCompletedCells] = useState(0);
  const [totalCellsToFill, setTotalCellsToFill] = useState(0);
  const [points, setPoints] = useState(50);
  const [history, setHistory] = useState([]);
  const [initialPuzzle, setInitialPuzzle] = useState([]);

  const fetchPuzzle = () => {
    fetch(`http://localhost:5000/api/puzzle/${level}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setPuzzle(data.puzzle);
        setInitialPuzzle(JSON.parse(JSON.stringify(data.puzzle))); // Deep clone
        setShapes(data.shapes);
        setSelectedShape("");
        setIsLevelStarted(false);
        setShowResult(false);
        setTimeTaken(0);
        setCompletedCells(0);
  
        const total = data.puzzle.flat().filter((cell) => cell === null).length;
        setTotalCellsToFill(total);
      })
      .catch((err) => {
        console.error("Fetch failed:", err);
        alert("Failed to load puzzle. Check server logs.");
      });
  };
  

  useEffect(() => {
    fetchPuzzle();
  }, [level]);

  const isValidMove = (i, j, shape) => {
    const size = puzzle.length;
    for (let k = 0; k < size; k++) {
      if (puzzle[i][k] === shape || puzzle[k][j] === shape) return false;
    }
    if (i === j) for (let k = 0; k < size; k++) if (puzzle[k][k] === shape) return false;
    if (i + j === size - 1) for (let k = 0; k < size; k++) if (puzzle[k][size - 1 - k] === shape) return false;
    return true;
  };

  const handleCellClick = (i, j) => {
    if (!isLevelStarted || puzzle[i][j]) return;

    if (selectedShape && isValidMove(i, j, selectedShape)) {
      const updated = puzzle.map((row) => [...row]);
      updated[i][j] = selectedShape;
      setPuzzle(updated);
      setHistory([...history, { i, j, prev: puzzle[i][j] }]);
      setCompletedCells((c) => c + 1);

      if (completedCells + 1 === totalCellsToFill) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTimeTaken(elapsed);
        setLevelTimeRecord({ ...levelTimeRecord, [level]: elapsed });
        setPoints((prev) => prev + 10);
        setShowResult(true);
        setIsLevelStarted(false);
      }
    } else {
      alert("Invalid move! Try another shape.");
    }
  };

  const changeLevel = () => {
    if (level < 5) setLevel(level + 1);
    else setLevel(1);
  };

  const handleStart = () => {
    setStartTime(Date.now());
    setIsLevelStarted(true);
    setHistory([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    const updated = puzzle.map((row) => [...row]);
    updated[last.i][last.j] = null;
    setPuzzle(updated);
    setHistory(history.slice(0, -1));
    setCompletedCells((c) => c - 1);
  };

  const handleRetake = () => {
    setPuzzle(JSON.parse(JSON.stringify(initialPuzzle)));
    setHistory([]);
    setCompletedCells(0);
    setStartTime(Date.now());
    setShowResult(false);
    setIsLevelStarted(true);
  };

  const handleHint = () => {
    if (points < 5) return alert("Not enough points for a hint!");
    const emptyCells = [];
    puzzle.forEach((row, i) =>
      row.forEach((cell, j) => {
        if (cell === null) emptyCells.push({ i, j });
      })
    );
    for (let { i, j } of emptyCells) {
      for (let s of shapes) {
        if (isValidMove(i, j, s)) {
          const updated = puzzle.map((row) => [...row]);
          updated[i][j] = s;
          setPuzzle(updated);
          setPoints((prev) => prev - 5);
          setCompletedCells((c) => c + 1);
          return;
        }
      }
    }
  };

  return (
    <Container className="text-center mt-5">
      <h1 className="fw-bold mb-3">🧩 Sudoku - Level {level}</h1>
      <p className="lead">🏅 Points: {points}</p>

      {!isLevelStarted && !showResult && (
        <Button variant="primary" size="lg" onClick={handleStart}>
          ▶ Start Level
        </Button>
      )}

      {isLevelStarted && (
        <>
          <div className="d-flex justify-content-center flex-wrap mb-3">
            {shapes.map((s, i) => (
              <Button
                key={i}
                variant={selectedShape === s ? "outline-primary" : "outline-secondary"}
                className="m-1"
                onClick={() => setSelectedShape(s)}
                style={{ fontSize: "1.5rem" }}
              >
                {s}
              </Button>
            ))}
          </div>

          <div className="d-flex justify-content-center mb-3">
            <Button variant="warning" onClick={handleUndo} className="mx-2">
              ↩ Undo
            </Button>
            <Button variant="info" onClick={handleRetake} className="mx-2">
              🔄 Retake
            </Button>
            <Button variant="danger" onClick={handleHint} className="mx-2">
              💡 Hint (-5)
            </Button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${puzzle.length}, 60px)`,
              justifyContent: "center",
              gap: 6,
              marginBottom: 20,
            }}
          >
            {puzzle.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  onClick={() => handleCellClick(i, j)}
                  style={{
                    width: 60,
                    height: 60,
                    fontSize: 30,
                    textAlign: "center",
                    lineHeight: "60px",
                    border: "2px solid #333",
                    backgroundColor: cell ? "#e0e0e0" : "#fff",
                    cursor: cell ? "default" : "pointer",
                  }}
                >
                  {cell}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {showResult && (
        <>
          <Confetti width={window.innerWidth} height={window.innerHeight} />
          <Card className="p-4 text-center shadow-lg mt-4">
          <img
            src={Image}
            alt="Congratulations"
            className="mx-auto d-block"
            style={{ maxWidth: "300px", height: "auto", marginBottom: "1rem" }}
          />
            <h3 className="fw-bold">Level {level} Complete!</h3>
            <p>⏱ Time: {levelTimeRecord[level]} seconds</p>
            <p>🏆 Points: +10</p>
            <Button variant="success" onClick={changeLevel}>
              🚀 Next Level
            </Button>
          </Card>
        </>
      )}
    </Container>
  );
};

export default App;