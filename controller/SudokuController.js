export default class SudokuController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.timerInterval = null;
    this.seconds = 0;
    this.selected = null;
    this.mistakes = 0;
    this.maxMistakes = 3;
    this.gameOver = false;

    this.view.onCellSelect = (r, c) => this._selectCell(r, c);
    this.view.onNumberInput = (n) => this._inputNumber(n);
    this.view.onErase = () => this._eraseCell();
    this.view.onNewGame = () => this.startNewGame(this.view.getDifficulty());
    this.view.onCheck = () => this._checkBoard();
    this.view.onHint = () => this._giveHint();
  }

  init() {
    this.startNewGame(this.view.getDifficulty());
  }

  startNewGame(difficulty) {
    this.model.generate(difficulty);
    this.view.hideModal();
    this.view.clearErrorMarks();
    this.view.clearMessage();
    this.view.renderBoard(this.model);
    this.selected = null;
    this.mistakes = 0;
    this.gameOver = false;
    this.view.updateMistakes(0, this.maxMistakes);
    this._refreshNumberPad();
    this._resetTimer();
  }

  _selectCell(row, col) {
    if (this.gameOver) return;
    this.selected = [row, col];
    this.view.selectCell(row, col);
  }

  _inputNumber(num) {
    if (this.gameOver || !this.selected) return;
    const [r, c] = this.selected;
    if (this.model.isFixed(r, c)) return;

    const isCorrect = num === this.model.getCorrectValue(r, c);
    this.model.setCell(r, c, num);
    this.view.clearErrorMarks();
    this.view.renderBoard(this.model);
    this.view.selectCell(r, c);
    this.view.pulseCell(r, c);
    this._refreshNumberPad();

    if (!isCorrect) {
      this.mistakes++;
      this.view.updateMistakes(this.mistakes, this.maxMistakes);
      if (this.mistakes >= this.maxMistakes) {
        this._onLose();
        return;
      }
    }

    if (this.model.isSolved()) this._onWin();
  }

  _eraseCell() {
    if (this.gameOver || !this.selected) return;
    const [r, c] = this.selected;
    if (this.model.isFixed(r, c)) return;
    this.model.setCell(r, c, 0);
    this.view.clearErrorMarks();
    this.view.renderBoard(this.model);
    this.view.selectCell(r, c);
    this._refreshNumberPad();
  }

  _refreshNumberPad() {
    const completed = [];
    for (let n = 1; n <= 9; n++) {
      if (this.model.countCorrectPlacements(n) >= 9) completed.push(n);
    }
    this.view.updateNumberPad(completed);
  }

  _checkBoard() {
    if (this.gameOver) return;
    this.view.markErrors(this.model);
    if (this.model.isSolved()) {
      this._onWin();
    } else {
      this.view.showMessage('Keep going — wrong cells are outlined.', 'info');
    }
  }

  _giveHint() {
    if (this.gameOver) return;
    const target = this._findHintTarget();
    if (!target) {
      this.view.showMessage('Everything is already correct — no hint needed.', 'info');
      return;
    }
    const [r, c] = target;
    const correct = this.model.getCorrectValue(r, c);
    // Reveal the correct digit and lock the cell like a given clue.
    this.model.board[r][c] = correct;
    this.model.fixed[r][c] = true;

    this.view.clearErrorMarks();
    this.view.renderBoard(this.model);
    this.view.selectCell(r, c);
    this.view.pulseCell(r, c);
    this.view.showMessage('Here\'s a hint — one cell filled in for you.', 'info');
    this._refreshNumberPad();

    if (this.model.isSolved()) this._onWin();
  }

  _findHintTarget() {
    const [sr, sc] = this.selected || [];
    if (
      this.selected &&
      !this.model.isFixed(sr, sc) &&
      this.model.getValue(sr, sc) !== this.model.getCorrectValue(sr, sc)
    ) {
      return [sr, sc];
    }
    // Fall back to the first empty or incorrect cell on the board.
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.model.getValue(r, c);
        if (!this.model.isFixed(r, c) && val !== this.model.getCorrectValue(r, c)) {
          return [r, c];
        }
      }
    }
    return null;
  }

  _onWin() {
    this.gameOver = true;
    this._stopTimer();
    this.view.showMessage('🎉 Solved! Well done.', 'success');
    this.view.flashBoard('win');
    this.view.showEndModal(
      'win',
      'Well done!',
      `You solved the puzzle in ${this._formatTime(this.seconds)} with ${this.mistakes} mistake(s).`
    );
  }

  _onLose() {
    this.gameOver = true;
    this._stopTimer();
    this.view.showMessage('Out of attempts.', 'error');
    this.view.flashBoard('lose');
    this.view.showEndModal(
      'lose',
      'Unfortunately, you lost',
      `You made ${this.maxMistakes} mistakes. Time: ${this._formatTime(this.seconds)}.`
    );
  }

  _formatTime(seconds) {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  _resetTimer() {
    this._stopTimer();
    this.seconds = 0;
    this.view.updateTimer(0);
    this.timerInterval = setInterval(() => {
      this.seconds++;
      this.view.updateTimer(this.seconds);
    }, 1000);
  }

  _stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
