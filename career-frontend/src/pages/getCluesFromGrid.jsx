export function getCluesFromGrid(grid) {
    const getLineClues = (line) => {
      const clues = [];
      let count = 0;
      for (let cell of line) {
        if (cell === 1) {
          count++;
        } else if (count > 0) {
          clues.push(count);
          count = 0;
        }
      }
      if (count > 0) clues.push(count);
      return clues.length ? clues : [0];
    };
  
    const rowClues = grid.map(getLineClues);
  
    const size = grid[0].length;
    const colClues = Array(size).fill().map((_, colIndex) => {
      const column = grid.map(row => row[colIndex]);
      return getLineClues(column);
    });
  
    return { rowClues, colClues };
  }
  