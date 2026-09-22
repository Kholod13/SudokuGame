import SudokuModel from './model/SudokuModel.js';
import SudokuView from './view/SudokuView.js';
import SudokuController from './controller/SudokuController.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  const model = new SudokuModel();
  const view = new SudokuView(root);
  const controller = new SudokuController(model, view);
  controller.init();
});
