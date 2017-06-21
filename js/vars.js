let maze = document.getElementById('maze');
let maze_info = JSON.parse(localStorage.maze);

// let Game = {};

const CELL_HEIGHT = 25;
const CELL_WIDTH = 51;
const CELL_SIZE = 25; // px
const RANDOM_CELL_COUNT = 20;
const TOTAL_HEIGHT = CELL_HEIGHT * CELL_SIZE;
const TOTAL_WIDTH = CELL_WIDTH * CELL_SIZE;
const WALL = 'wall';
const FLOOR = 'floor';
