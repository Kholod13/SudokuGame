export default class SudokuView {
  constructor(root) {
    this.root = root;
    this.cells = [];
    this.selected = null;

    // Callbacks the controller attaches to
    this.onCellSelect = null;
    this.onNumberInput = null;
    this.onErase = null;
    this.onNewGame = null;
    this.onCheck = null;
    this.onHint = null;
    this.onDifficultyChange = null;

    this._buildLayout();
  }

  _buildLayout() {
    this.root.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'sudoku-container';

    container.appendChild(this._buildHeader());

    const board = document.createElement('div');
    board.className = 'sudoku-board';
    for (let r = 0; r < 9; r++) {
      const rowCells = [];
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        if (c % 3 === 0) cell.classList.add('border-left');
        if (r % 3 === 0) cell.classList.add('border-top');
        if (c === 8) cell.classList.add('border-right');
        if (r === 8) cell.classList.add('border-bottom');
        cell.addEventListener('click', () => {
          if (this.onCellSelect) this.onCellSelect(r, c);
        });
        board.appendChild(cell);
        rowCells.push(cell);
      }
      this.cells.push(rowCells);
    }
    container.appendChild(board);

    container.appendChild(this._buildNumberPad());
    container.appendChild(this._buildFooter());

    const message = document.createElement('div');
    message.className = 'message';
    this.messageEl = message;
    container.appendChild(message);

    this.root.appendChild(container);
    document.addEventListener('keydown', (e) => this._handleKeydown(e));
  }

  _buildHeader() {
    const header = document.createElement('div');
    header.className = 'sudoku-header';

    const title = document.createElement('h1');
    title.textContent = 'Sudoku';
    header.appendChild(title);

    const controls = document.createElement('div');
    controls.className = 'sudoku-controls';

    const difficultySelect = document.createElement('select');
    difficultySelect.className = 'difficulty-select';
    ['easy', 'medium', 'hard', 'expert'].forEach((d) => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d[0].toUpperCase() + d.slice(1);
      difficultySelect.appendChild(opt);
    });
    difficultySelect.value = 'medium';
    this.difficultySelect = difficultySelect;

    const newGameBtn = document.createElement('button');
    newGameBtn.textContent = 'New Game';
    newGameBtn.className = 'btn btn-primary';
    newGameBtn.addEventListener('click', () => {
      if (this.onNewGame) this.onNewGame();
    });

    const timer = document.createElement('div');
    timer.className = 'timer';
    timer.textContent = '00:00';
    this.timerEl = timer;

    controls.appendChild(difficultySelect);
    controls.appendChild(newGameBtn);
    controls.appendChild(timer);
    header.appendChild(controls);
    return header;
  }

  _buildNumberPad() {
    const pad = document.createElement('div');
    pad.className = 'number-pad';
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement('button');
      btn.className = 'pad-btn';
      btn.textContent = n;
      btn.addEventListener('click', () => {
        if (this.onNumberInput) this.onNumberInput(n);
      });
      pad.appendChild(btn);
    }
    const eraseBtn = document.createElement('button');
    eraseBtn.className = 'pad-btn erase-btn';
    eraseBtn.textContent = '⌫';
    eraseBtn.addEventListener('click', () => {
      if (this.onErase) this.onErase();
    });
    pad.appendChild(eraseBtn);
    return pad;
  }

  _buildFooter() {
    const footer = document.createElement('div');
    footer.className = 'sudoku-footer';

    const checkBtn = document.createElement('button');
    checkBtn.className = 'btn';
    checkBtn.textContent = 'Check';
    checkBtn.addEventListener('click', () => {
      if (this.onCheck) this.onCheck();
    });

    const hintBtn = document.createElement('button');
    hintBtn.className = 'btn';
    hintBtn.textContent = 'Hint';
    hintBtn.addEventListener('click', () => {
      if (this.onHint) this.onHint();
    });

    footer.appendChild(checkBtn);
    footer.appendChild(hintBtn);
    return footer;
  }

  _handleKeydown(e) {
    if (!this.selected) return;
    if (e.key >= '1' && e.key <= '9') {
      if (this.onNumberInput) this.onNumberInput(Number(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      if (this.onErase) this.onErase();
    } else if (e.key.startsWith('Arrow')) {
      this._moveSelection(e.key);
      e.preventDefault();
    }
  }

  _moveSelection(key) {
    let [r, c] = this.selected;
    if (key === 'ArrowUp') r = Math.max(0, r - 1);
    if (key === 'ArrowDown') r = Math.min(8, r + 1);
    if (key === 'ArrowLeft') c = Math.max(0, c - 1);
    if (key === 'ArrowRight') c = Math.min(8, c + 1);
    if (this.onCellSelect) this.onCellSelect(r, c);
  }

  selectCell(row, col) {
    this.selected = [row, col];
    this._updateHighlights();
  }

  _updateHighlights() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.cells[r][c].classList.remove('selected', 'peer', 'same-value');
      }
    }
    if (!this.selected) return;
    const [sr, sc] = this.selected;
    const selectedVal = this.cells[sr][sc].textContent;
    const boxRow = Math.floor(sr / 3);
    const boxCol = Math.floor(sc / 3);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const inSameBox = Math.floor(r / 3) === boxRow && Math.floor(c / 3) === boxCol;
        if (r === sr && c === sc) continue;
        if (r === sr || c === sc || inSameBox) this.cells[r][c].classList.add('peer');
        if (selectedVal && this.cells[r][c].textContent === selectedVal) {
          this.cells[r][c].classList.add('same-value');
        }
      }
    }
    this.cells[sr][sc].classList.add('selected');
  }

  renderBoard(model) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cellEl = this.cells[r][c];
        const val = model.getValue(r, c);
        cellEl.textContent = val === 0 ? '' : val;
        cellEl.classList.toggle('fixed', model.isFixed(r, c));
        cellEl.classList.toggle('error', val !== 0 && model.hasConflict(r, c));
      }
    }
    this._updateHighlights();
  }

  markErrors(model) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = model.getValue(r, c);
        const wrong = val !== 0 && !model.isFixed(r, c) && val !== model.getCorrectValue(r, c);
        this.cells[r][c].classList.toggle('wrong', wrong);
      }
    }
  }

  clearErrorMarks() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) this.cells[r][c].classList.remove('wrong');
    }
  }

  updateTimer(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    this.timerEl.textContent = `${m}:${s}`;
  }

  showMessage(text, type = 'info') {
    this.messageEl.textContent = text;
    this.messageEl.className = `message ${type}`;
  }

  clearMessage() {
    this.messageEl.textContent = '';
    this.messageEl.className = 'message';
  }

  getDifficulty() {
    return this.difficultySelect.value;
  }
}
