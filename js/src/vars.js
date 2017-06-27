let maze = document.getElementById('maze');
let maze_info = (localStorage.maze)? JSON.parse(localStorage.maze) : [];

const CELL_HEIGHT = 21;
const CELL_WIDTH = 35;
const CELL_SIZE = 34;
const RANDOM_CELL_COUNT = 20;
const TOTAL_HEIGHT = CELL_HEIGHT * CELL_SIZE;
const TOTAL_WIDTH = CELL_WIDTH * CELL_SIZE;
const WALL = 'wall';
const FLOOR = 'floor';
