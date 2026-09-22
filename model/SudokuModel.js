export default class SudokuModel {
  constructor() {
    this.board = [];
    this.solution = [];
    this.fixed = [];
  }

  generate(difficulty = 'medium') {
    this.solution = this._generateSolvedBoard();
    this.board = this.solution.map((row) => row.slice());
    this.fixed = Array.from({ length: 9 }, () => Array(9).fill(true));
    const cellsToRemove = this._getRemovalCount(difficulty);
    this._removeCells(cellsToRemove);
  }

  _generateSolvedBoard() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    this._fillBoard(board);
    return board;
  }

  _fillBoard(board) {
    const empty = this._findEmpty(board);
    if (!empty) return true;
    const [row, col] = empty;
    const nums = this._shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const num of nums) {
      if (this._isValidPlacement(board, row, col, num)) {
        board[row][col] = num;
        if (this._fillBoard(board)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  }

  _findEmpty(board) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) return [r, c];
      }
    }
    return null;
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  _isValidPlacement(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) return false;
      if (board[i][col] === num) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (board[r][c] === num) return false;
      }
    }
    return true;
  }

  _getRemovalCount(difficulty) {
    const map = { easy: 36, medium: 46, hard: 54, expert: 58 };
    return map[difficulty] ?? 46;
  }

  _removeCells(count) {
    let removed = 0;
    let attempts = 0;
    const maxAttempts = count * 12;
    while (removed < count && attempts < maxAttempts) {
      attempts++;
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (this.board[row][col] === 0) continue;

      const backup = this.board[row][col];
      this.board[row][col] = 0;
      this.fixed[row][col] = false;

      const boardCopy = this.board.map((r) => r.slice());
      const solutions = this._countSolutions(boardCopy, 2);

      if (solutions !== 1) {
        this.board[row][col] = backup;
        this.fixed[row][col] = true;
      } else {
        removed++;
      }
    }
  }

  _countSolutions(board, limit) {
    let count = 0;
    const solve = (b) => {
      if (count >= limit) return;
      const empty = this._findEmpty(b);
      if (!empty) {
        count++;
        return;
      }
      const [row, col] = empty;
      for (let num = 1; num <= 9; num++) {
        if (this._isValidPlacement(b, row, col, num)) {
          b[row][col] = num;
          solve(b);
          b[row][col] = 0;
          if (count >= limit) return;
        }
      }
    };
    solve(board);
    return count;
  }

  setCell(row, col, value) {
    if (this.fixed[row][col]) return false;
    this.board[row][col] = value;
    return true;
  }

  isFixed(row, col) {
    return this.fixed[row][col];
  }

  getValue(row, col) {
    return this.board[row][col];
  }

  getCorrectValue(row, col) {
    return this.solution[row][col];
  }

  hasConflict(row, col) {
    const val = this.board[row][col];
    if (val === 0) return false;
    for (let i = 0; i < 9; i++) {
      if (i !== col && this.board[row][i] === val) return true;
      if (i !== row && this.board[i][col] === val) return true;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && this.board[r][c] === val) return true;
      }
    }
    return false;
  }

  isSolved() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.board[r][c] === 0) return false;
        if (this.board[r][c] !== this.solution[r][c]) return false;
      }
    }
    return true;
  }

  solveBoard() {
    this.board = this.solution.map((r) => r.slice());
  }
}
