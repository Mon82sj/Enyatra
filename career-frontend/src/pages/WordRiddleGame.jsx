import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Confetti from 'react-confetti';
import { Sparkles } from 'lucide-react';

const CELL_SIZE = 50;

const WordRiddleGame = () => {
  const [grid, setGrid] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [foundPaths, setFoundPaths] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [level, setLevel] = useState(1);
  const [dragStart, setDragStart] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchRiddleData(level);
  }, [level]);

  const fetchRiddleData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/riddle');
      const data = await response.json();
      setQuestions(data.questions);
      setAnswers(data.answers.map(a => a.toLowerCase()));
      setGrid(data.grid);
      setFoundWords([]);
      setFoundPaths([]);
      setDragStart(null);
      setShowConfetti(false);
      clearCanvas();
    } catch (error) {
      console.error('Error fetching riddle data:', error);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleMouseDown = (row, col) => {
    setDragStart({ row, col });
  };

  const handleMouseUp = (row, col) => {
    if (!dragStart) return;
    const path = getPath(dragStart, { row, col });
    const word = path.map(cell => grid[cell.row][cell.col]).join('').toLowerCase();

    for (let answer of answers) {
      if (word === answer && !foundWords.includes(answer)) {
        setFoundWords(prev => [...prev, answer]);
        setFoundPaths(prev => [...prev, path]);
        drawLine(path);
        if (foundWords.length + 1 === answers.length) {
          setShowConfetti(true);
          setTimeout(() => setLevel(prev => prev + 1), 4000);
        }
        break;
      }
    }

    setDragStart(null);
  };

  const getPath = (start, end) => {
    const dx = end.col - start.col;
    const dy = end.row - start.row;
    const len = Math.max(Math.abs(dx), Math.abs(dy));

    const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
    const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

    const path = [];
    for (let i = 0; i <= len; i++) {
      const row = start.row + i * stepY;
      const col = start.col + i * stepX;
      if (row >= 0 && row < grid.length && col >= 0 && col < grid.length) {
        path.push({ row, col });
      }
    }
    return path;
  };

  const drawLine = (path) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    path.forEach((cell, index) => {
      const x = cell.col * CELL_SIZE + CELL_SIZE / 2;
      const y = cell.row * CELL_SIZE + CELL_SIZE / 2;
      index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  };

  const isMarked = (row, col) => {
    return foundPaths.some(path => path.some(cell => cell.row === row && cell.col === col));
  };

  return (
    <Container className="position-relative mt-4">
      {showConfetti && <Confetti />}
      <h2 className="mb-3">Career Clue Riddle Game <Sparkles size={24} className="text-warning" /></h2>

      <Row className="mb-4">
        <Col>
          <h5>Clues</h5>
          <ul>
            {questions.map((q, i) => (
              <li key={i} style={{ textDecoration: foundWords.includes(answers[i]) ? 'line-through' : 'none' }}>{q}</li>
            ))}
          </ul>
        </Col>

        <Col>
          <h5>Grid (Level {level})</h5>
          <div
            style={{
              position: 'relative',
              width: `${CELL_SIZE * grid.length}px`,
              height: `${CELL_SIZE * grid.length}px`,
              userSelect: 'none'
            }}
          >
            <canvas
              ref={canvasRef}
              width={CELL_SIZE * grid.length}
              height={CELL_SIZE * grid.length}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1,
                pointerEvents: 'none'
              }}
            />
            {grid.map((row, rowIdx) => (
              <Row key={rowIdx} className="m-0">
                {row.map((char, colIdx) => (
                  <Col
                    key={colIdx}
                    className="border text-center"
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      lineHeight: `${CELL_SIZE}px`,
                      cursor: 'pointer',
                      zIndex: 2,
                      userSelect: 'none',
                      fontWeight: 'bold',
                      textDecoration: isMarked(rowIdx, colIdx) ? 'line-through' : 'none'
                    }}
                    onMouseDown={() => handleMouseDown(rowIdx, colIdx)}
                    onMouseUp={() => handleMouseUp(rowIdx, colIdx)}
                  >
                    {char.toUpperCase()}
                  </Col>
                ))}
              </Row>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default WordRiddleGame;



// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import './WordRiddleGame.css';

// function WordRiddleGame() {
//   const [grid, setGrid] = useState([]);
//   const [questions, setQuestions] = useState([]);
//   const [answers, setAnswers] = useState([]);
//   const [selectedCells, setSelectedCells] = useState([]);
//   const [foundWords, setFoundWords] = useState([]);
//   const [startCell, setStartCell] = useState(null);
//   const isMouseDown = useRef(false);

//   useEffect(() => {
//     axios.get('http://localhost:3001/riddle').then((res) => {
//       setGrid(res.data.grid);
//       setQuestions(res.data.questions);
//       setAnswers(res.data.answers);
//     });
//   }, []);

//   const handleMouseDown = (row, col) => {
//     setStartCell({ row, col });
//     isMouseDown.current = true;
//     setSelectedCells([{ row, col }]);
//   };

//   const handleMouseEnter = (row, col) => {
//     if (isMouseDown.current && startCell) {
//       const newSelection = getCellsBetween(startCell, { row, col });
//       setSelectedCells(newSelection);
//     }
//   };

//   const handleMouseUp = () => {
//     isMouseDown.current = false;
//     if (!selectedCells.length) return;

//     const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
//     if (answers.includes(selectedWord)) {
//       setFoundWords(prev => [...prev, selectedWord]);
//     }
//     setStartCell(null);
//     setSelectedCells([]);
//   };

//   const getCellsBetween = (start, end) => {
//     const dx = end.col - start.col;
//     const dy = end.row - start.row;
//     const length = Math.max(Math.abs(dx), Math.abs(dy));
//     const stepX = dx !== 0 ? dx / Math.abs(dx) : 0;
//     const stepY = dy !== 0 ? dy / Math.abs(dy) : 0;

//     if (Math.abs(dx) !== 0 && Math.abs(dy) !== 0 && Math.abs(dx) !== Math.abs(dy)) {
//       return [];
//     }

//     const cells = [];
//     for (let i = 0; i <= length; i++) {
//       cells.push({ row: start.row + i * stepY, col: start.col + i * stepX });
//     }
//     return cells;
//   };

//   const isCellSelected = (row, col) => selectedCells.some(cell => cell.row === row && cell.col === col);
//   const isCellFound = (row, col) => {
//     return foundWords.some(word => {
//       const idx = word.indexOf(grid[row][col]);
//       if (idx === -1) return false;
//       return true;
//     });
//   };

//   return (
//     <div>
//       <h2>Word Riddle Game</h2>
//       <div className="grid" onMouseLeave={handleMouseUp}>
//         {grid.map((row, rowIndex) => (
//           <div key={rowIndex} className="row">
//             {row.map((letter, colIndex) => (
//               <div
//                 key={colIndex}
//                 className={`cell ${isCellSelected(rowIndex, colIndex) ? 'selected' : ''} ${isCellFound(rowIndex, colIndex) ? 'found' : ''}`}
//                 onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
//                 onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
//                 onMouseUp={handleMouseUp}
//               >
//                 {letter}
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//       <div className="questions">
//         <h3>Clues:</h3>
//         <ul>
//           {questions.map((q, i) => (
//             <li key={i}>{q}</li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

// export default WordRiddleGame;
