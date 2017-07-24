let maze = document.getElementById('maze');
let maze_info = (localStorage.maze)? JSON.parse(localStorage.maze) : [];

// Maze with cell 40*40
const CELL_HEIGHT = 17;
const CELL_WIDTH = 29;
const CELL_SIZE = 40;

// // Maze with cell 45*45
// const CELL_HEIGHT = 15;
// const CELL_WIDTH = 25;
// const CELL_SIZE = 45;
//
// // Maze with cell 34*34
// const CELL_HEIGHT = 21;
// const CELL_WIDTH = 35;
// const CELL_SIZE = 34;

const RANDOM_CELL_COUNT = 20;
const TOTAL_HEIGHT = CELL_HEIGHT * CELL_SIZE;
const TOTAL_WIDTH = CELL_WIDTH * CELL_SIZE;
const WALL = 'wall';
const FLOOR = 'floor';
const cell_num = (position) => Math.floor(position / CELL_SIZE);

// const valid = (a, b, map) => Array.isArray(map) && a < map.length && a >= 0 && b < map[0].length && b >= 0;
