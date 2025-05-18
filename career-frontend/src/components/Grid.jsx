import React, { useState, useEffect } from 'react';
import './Grid.css';

const Grid = ({
  size = 5,
  initialGrid = null,
  clues = null,
  onGridChange,
  resetTrigger = 0,
  mode = 'fill'
}) => {
  const [grid, setGrid] = useState(
    Array(size).fill().map(() => Array(size).fill(null))
  );

  useEffect(() => {
    setGrid(Array(size).fill().map(() => Array(size).fill(null)));
  }, [resetTrigger, size]);

  useEffect(() => {
    if (onGridChange) {
      onGridChange(grid);
    }
  }, [grid, onGridChange]);

  const handleCellClick = (row, col) => {
    const newGrid = grid.map((r, i) =>
      r.map((cell, j) => {
        if (i === row && j === col) {
          if (mode === 'fill') {
            return cell === 'filled' ? null : 'filled';
          } else {
            return cell === 'x' ? null : 'x';
          }
        }
        return cell;
      })
    );
    setGrid(newGrid);
  };

  // Calculate maximum width and height needed
  const maxRowClues = Math.max(...(clues?.rowClues?.map(r => r.length) || [0]));
  const maxColClues = Math.max(...(clues?.colClues?.map(c => c.length) || [0]));

  const clueCellSize = 24; // Each clue number roughly needs 24px

  const leftClueWidth = Math.max(42, maxRowClues * clueCellSize);
  const topClueHeight = Math.max(42, maxColClues * clueCellSize);

  return (
    <div className="nonogram-container">
      <div
        className="nonogram-grid"
        style={{
          gridTemplateColumns: `${leftClueWidth}px repeat(${size}, 42px)`,
          gridTemplateRows: `${topClueHeight}px repeat(${size}, 42px)`
        }}
      >
        {/* Empty corner */}
        <div style={{ width: leftClueWidth, height: topClueHeight }}></div>

        {/* Column clues */}
        {clues?.colClues?.map((colClue, colIndex) => (
          <div
            key={`col-${colIndex}`}
            className="clue-cell col-clue"
            style={{ height: topClueHeight }}
          >
            {colClue.map((num, numIndex) => (
              <span key={numIndex}>{num}</span>
            ))}
          </div>
        ))}

        {/* Row clues + grid */}
        {grid.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {/* Row clue */}
            <div
              className="clue-cell row-clue horizontal-clue"
              style={{ width: leftClueWidth }}
            >
              {clues?.rowClues?.[rowIndex]?.map((num, numIndex) => (
                <span key={numIndex}>{num}</span>
              ))}
            </div>

            {/* Cells */}
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell ${cell === 'filled' ? 'filled' : ''} ${cell === 'x' ? 'x-mark' : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell === 'x' ? 'X' : ''}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Grid;
