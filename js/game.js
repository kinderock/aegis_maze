'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var maze = document.getElementById('maze');
var maze_info = localStorage.maze ? JSON.parse(localStorage.maze) : [];

// Maze with cell 40*40
var CELL_HEIGHT = 17;
var CELL_WIDTH = 29;
var CELL_SIZE = 40;

// // Maze with cell 45*45
// const CELL_HEIGHT = 15;
// const CELL_WIDTH = 25;
// const CELL_SIZE = 45;
//
// // Maze with cell 34*34
// const CELL_HEIGHT = 21;
// const CELL_WIDTH = 35;
// const CELL_SIZE = 34;

var RANDOM_CELL_COUNT = 20;
var TOTAL_HEIGHT = CELL_HEIGHT * CELL_SIZE;
var TOTAL_WIDTH = CELL_WIDTH * CELL_SIZE;
var WALL = 'wall';
var FLOOR = 'floor';
var cell_num = function cell_num(position) {
	return Math.floor(position / CELL_SIZE);
};

// const valid = (a, b, map) => Array.isArray(map) && a < map.length && a >= 0 && b < map[0].length && b >= 0;

var game_settings = {
	aegis_haste: false,
	start_game: false,
	start_cell: null,
	game_timer: null,
	total_scores: 0,
	time_to_scores: 10,
	haste_time: 10,
	floors: null,
	map: null,
	basic_speed: 200,
	enemies: [],
	ground_codes: {
		'right_bottom': 0,
		'right_top': 1,
		'left_top': 2,
		'left_bottom': 3,
		'right_top_bottom': 4,
		'left_right_top': 5,
		'left_right_bottom': 6,
		'left_top_bottom': 7,
		'right': 8,
		'top': 9,
		'bottom': 10,
		'left': 11,
		'left_right': 12,
		'top_bottom': 13,
		'left_right_top_bottom': 14
	},
	// ways_opposites: {
	// 	left: 'right',
	// 	right: 'left',
	// 	top: 'bottom',
	// 	bottom: 'top'
	// },

	preload: function preload() {
		this.game.load.image('aegis', '/images/aegis_38.png');
		this.game.load.image('enemy', '/images/enemy_38.png');

		this.game.load.spritesheet('ground', '/images/ground.png', CELL_SIZE, CELL_SIZE, 15);
		this.game.load.spritesheet('aegis', '/images/aegis.png', CELL_SIZE - 2, CELL_SIZE - 2, 10);
		this.game.load.image('water', '/images/water.png');
		this.game.load.image('bounty_rune', '/images/bounty_rune_38.png');
		this.game.load.image('haste_rune', '/images/haste_rune_38.png');
	},

	create: function create() {
		// Получаем данные для лабиринта
		this.map = getMaze(false);

		// Создаем группы под пол и воду
		var wallsGroup = this.game.add.physicsGroup(Phaser.Physics.BOX2D);
		var floorsGroup = this.game.add.group();
		var enemiesGroup = this.game.add.physicsGroup(Phaser.Physics.BOX2D);
		enemiesGroup.filter.groupIndex = -8;

		// Заводим физику
		this.game.physics.startSystem(Phaser.Physics.BOX2D);
		this.game.physics.box2d.setBoundsToWorld();

		this.walls = wallsGroup;
		wallsGroup.enableBody = true;

		// Заводим в группы стены и пол
		for (var y = 0; y < CELL_HEIGHT; y++) {
			for (var x = 0; x < CELL_WIDTH; x++) {
				if (this.map[x][y] === WALL) {
					var wall = wallsGroup.create(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, "water");
					wall.body.static = true;
				} else {
					var floor = floorsGroup.create(x * CELL_SIZE, y * CELL_SIZE, "ground");
					floor.frame = this.getGroundSprite(x, y);
				}
			}
		}

		this.floors = floorsGroup;

		// Берем рандомную ячейку с полом, чтобы отрисовать на ней Аегис
		this.start_cell = this.getRandomFloor(this.floors);

		// Создаем и описываем Аегис
		this.aegis = this.game.add.sprite(this.start_cell.position.x + CELL_SIZE / 2, this.start_cell.position.y + CELL_SIZE / 2, 'aegis');
		this.game.physics.box2d.enable(this.aegis);
		this.aegis.body.fixedRotation = true;
		this.aegis.body.setCircle(CELL_SIZE / 2 - 1);
		this.aegis.body.collideWorldBounds = true;
		this.aegis.start_position = {
			x: this.start_cell.position.x + CELL_SIZE / 2,
			y: this.start_cell.position.y + CELL_SIZE / 2
		};

		// Создаем баунти руну
		this.drawRunes('bounty_rune');

		// Создаем хаст руну
		this.drawRunes('haste_rune');

		// Создаем врагов
		// for (let i = 0; i < 6; i++) {
		this.drawEnemy(enemiesGroup);
		// }
		// enemiesGroup.z = -1;
		console.log('enemiesGroup', enemiesGroup);

		this.enemies.forEach(function (enemy) {
			game_settings.enemyGetPossibleWay(enemy);
			// _game.enemyMove(enemy, _game.enemyGetPossibleWay(enemy));
		});

		// Создаем отслеживание нажатий на клавиатуру
		this.cursors = this.game.input.keyboard.createCursorKeys();
	},

	render: function render() {
		this.game.debug.box2dWorld(); // For debug
	},

	update: function update() {
		var _this = this;

		var getAegisFrame = function getAegisFrame(frame) {
			return !_this.aegis_haste ? frame : frame + 5;
		};

		var speed = this.aegis_haste ? this.basic_speed * 2 : this.basic_speed;
		var _game = this;

		if (this.aegis_haste) {
			document.getElementById('maze').classList.add('invisible');
		} else {
			document.getElementById('maze').classList.remove('invisible');
		}

		this.aegis.body.setZeroVelocity();
		this.aegis.frame = getAegisFrame(0);

		if (this.cursors.left.isDown) {
			this.aegis.body.moveLeft(speed);
			this.aegis.frame = getAegisFrame(1);
		} else if (this.cursors.right.isDown) {
			this.aegis.body.moveRight(speed);
			this.aegis.frame = getAegisFrame(2);
		}

		if (this.cursors.up.isDown) {
			this.aegis.body.moveUp(speed);
			this.aegis.frame = getAegisFrame(3);
		} else if (this.cursors.down.isDown) {
			this.aegis.body.moveDown(speed);
			this.aegis.frame = getAegisFrame(4);
		}

		if (!this.start_game && (this.aegis.position.x !== this.aegis.start_position.x || this.aegis.position.y !== this.aegis.start_position.y)) {
			this.start_game = true;
			this.startTimer();
		}

		// if (this.start_game) {
		// 	this.enemies.forEach((enemy) => {
		// 		_game.enemyMove(enemy, _game.enemyGetPossibleWay(enemy));
		// 	});
		// }
	},

	startTimer: function startTimer() {
		var _game = this,
		    passed_time = 0,
		    time_to_scores = _game.time_to_scores;

		clearInterval(_game.game_timer);
		_game = setInterval(function () {
			passed_time++;

			var mlseconds = passed_time % 100;
			var seconds = Math.floor(passed_time / 100 % 60);
			var minutes = Math.floor(passed_time / 6000);

			if (passed_time % (time_to_scores * 100) == 0) game_settings.handlerUpdateScores(false);

			if (mlseconds < 10) {
				mlseconds = "0" + mlseconds;
			}
			if (seconds < 10) {
				seconds = "0" + seconds;
			}
			if (minutes < 10) {
				minutes = "0" + minutes;
			}

			document.getElementById('timer').innerHTML = minutes + ':' + seconds + ':' + mlseconds;
		}, 10);
	},

	getGroundSprite: function getGroundSprite(mapX, mapY) {
		var neighbours = {};
		var cell_code = '';
		var ground_frame = 0;

		neighbours['left'] = mapX - 1 >= 0 && this.map[mapX - 1][mapY] === 'floor' ? true : false;
		neighbours['right'] = mapX + 1 < this.map.length && this.map[mapX + 1][mapY] === 'floor' ? true : false;
		neighbours['top'] = mapY - 1 >= 0 && this.map[mapX][mapY - 1] === 'floor' ? true : false;
		neighbours['bottom'] = mapY + 1 < this.map[0].length && this.map[mapX][mapY + 1] === 'floor' ? true : false;

		for (var direction in neighbours) {
			if (neighbours[direction]) {
				cell_code += direction + '_';
			}
		}
		cell_code = cell_code.slice(0, -1);

		return this.ground_codes[cell_code] || 0;
	},

	getRandomFloor: function getRandomFloor(floors) {
		return floors.children[Math.floor(Math.random() * floors.children.length)];
	},

	checkValidCell: function checkValidCell(a, b) {
		return a < this.map.length && a >= 0 && b < this.map[0].length && b >= 0;
	},

	drawRunes: function drawRunes(rune) {
		var _game = this;

		var rune_obj = null,
		    rune_type = '',
		    rune_callback = null,
		    rune_cell = this.getRandomFloor(_game.floors);

		switch (rune) {
			case 'bounty_rune':
				rune_type = rune;
				rune_callback = _game.collectBountyRune;
				break;
			case 'haste_rune':
				rune_type = rune;
				rune_callback = _game.collectHasteRune;
				break;
		}

		rune_obj = this.game.add.sprite(rune_cell.position.x + CELL_SIZE / 2, rune_cell.position.y + CELL_SIZE / 2, rune_type);
		_game.game.physics.box2d.enable(rune_obj);
		rune_obj.body.fixedRotation = true;
		_game.aegis.body.setBodyContactCallback(rune_obj, rune_callback, this);
	},

	drawEnemy: function drawEnemy(enemiesGroup) {
		// https://github.com/bxia/Javascript-Pacman/blob/master/Ghost.js
		var _game = this;

		var enemy = null,
		    enemy_callback = _game.detectEnemy,
		    enemy_cell = this.getRandomFloor(_game.floors);

		enemy = enemiesGroup.create(enemy_cell.position.x + CELL_SIZE / 2, enemy_cell.position.y + CELL_SIZE / 2, 'enemy');
		_game.game.physics.box2d.enable(enemy);
		// enemy.body.bodyDef.filter.categoryBits = 0x0002;
		// console.log('enemiesGroup', enemiesGroup);
		// console.log('enemiesGroup', enemiesGroup.filter);
		// console.log('enemy', enemy);
		enemy.body.fixedRotation = true;
		enemy.body.setCircle(CELL_SIZE / 2 - 1);
		// enemy.body.collideWorldBounds = true;
		enemy.move_direction = null;
		enemy.previous_cell = null;
		enemy.possible_ways = null;
		// enemy.filter.maskBits = 0x0002;
		// _game.aegis.body.setBodyContactCallback(enemy, enemy_callback, this);

		_game.enemies.push(enemy);
	},

	detectEnemy: function detectEnemy() {
		console.log('ssss dddd');
		console.log('ssss dddd');
		console.log('ssss dddd');
		console.log('ssss dddd');
		console.log('ssss dddd');
		console.log('ssss dddd');
	},

	enemyGetPossibleWay: function enemyGetPossibleWay(unit) {
		var maze = this.map;
		var valid = function valid(a, b) {
			return a < maze.length && a >= 0 && b < maze[0].length && b >= 0;
		};
		var key = function key(x, y) {
			return x + '-' + y;
		};
		var paths = {};
		var notVisited = [];
		var distances = {};

		var nearby_cells = {},
		    possible_way = [],
		    unitX = cell_num(unit.position.x),
		    unitY = cell_num(unit.position.y),
		    aegis_position = { x: cell_num(this.aegis.position.x), y: cell_num(this.aegis.position.y) };

		paths[key(unitX, unitY)] = [[unitX, unitY]];

		for (var x = 0; x < maze.length; x++) {
			for (var y = 0; y < maze[0].length; y++) {
				distances[key(x, y)] = Infinity;
				notVisited.push([x, y]);
			}
		}

		console.log('unitX', unitX);
		console.log('unitY', unitY);
		console.log('this aegis_position', aegis_position);
		console.log('paths', paths);
		console.log('distances', distances);
		console.log('notVisited', notVisited);
		console.log('===========STEP 2 ===========');

		distances[key(unitX, unitY)] = 0;

		function update(currX, currY, nextX, nextY) {
			console.log('aaa');
			if (!valid(currX, currY) || !valid(nextX, nextY)) {
				return;
			}
			console.log('bbb');

			var currentDistance = !maze[currX][currY] && !maze[nextX][nextY] ? 1 : Infinity;
			console.log('currentDistance', currentDistance);
			if (distances[key(nextX, nextY)] > currentDistance + distances[key(currX, currY)]) {
				console.log(currX, currY, nextX, nextY);
				paths[key(nextX, nextY)] = paths[key(currX, currY)].concat([[nextX, nextY]]);
				distances[key(nextX, nextY)] = distances[key(currX, currY)] + currentDistance;
			}
		}

		while (notVisited.length) {
			notVisited.sort(function (_ref, _ref2) {
				var _ref4 = _slicedToArray(_ref, 2),
				    x1 = _ref4[0],
				    y1 = _ref4[1];

				var _ref3 = _slicedToArray(_ref2, 2),
				    x2 = _ref3[0],
				    y2 = _ref3[1];

				return distances[key(x1, y1)] - distances[key(x2, y2)] || 0;
			});

			var _notVisited$shift = notVisited.shift(),
			    _notVisited$shift2 = _slicedToArray(_notVisited$shift, 2),
			    currX = _notVisited$shift2[0],
			    currY = _notVisited$shift2[1];

			console.log('[currX, currY]', currX, currY);
			update(currX, currY, currX + 1, currY);
			update(currX, currY, currX - 1, currY);
			update(currX, currY, currX, currY + 1);
			update(currX, currY, currX, currY - 1);
		}

		var resultPath = paths[key(aegis_position.x, aegis_position.y)];
		var finalCommands = [];

		console.log('paths', paths);
		console.log('distances', distances);
		console.log('notVisited', notVisited);
		console.log('resultPath', resultPath);

		// nearby_cells['left']   = (cell_x - 1 >= 0) ? this.map[cell_x - 1][cell_y] : 'end';
		// nearby_cells['right']  = (cell_x + 1 < this.map.length) ? this.map[cell_x + 1][cell_y] : 'end';
		// nearby_cells['top']    = this.map[cell_x][cell_y - 1];
		// nearby_cells['bottom'] = this.map[cell_x][cell_y + 1];
		//
		// for (let cell in nearby_cells) {
		// 	if (nearby_cells[cell] === 'floor') possible_way.push(cell);
		// }
		//
		// return possible_way
	},

	enemyMove: function enemyMove(unit, possible_way) {
		console.log('======================');
		// https://github.com/kinderock/holyjsgame-2017/blob/master/stage/strategies/tinkoff_strelnikov.js
		/**
  let direction = unit.move_direction || null;
  		// if (possible_way.length > 1 && unit.previous_cell && possible_way.indexOf(unit.previous_cell) !== -1) {
  // 	possible_way.splice(possible_way.indexOf(unit.previous_cell), 1)
  // }
  console.log('possible_way ->', possible_way);
  console.log('unit saved way --', unit.possible_ways);
  // if (!direction || unit.possible_ways !== possible_way) {
  // 	unit.possible_ways = possible_way;
  // }
  		if (!direction) {
  	direction = possible_way[Math.floor(Math.random() * possible_way.length)];
  	unit.move_direction = direction;
  	unit.possible_ways = possible_way;
  } else {
  	if (possible_way.filter((way) => { return way === direction}).length == 0) {
  		unit.move_direction = null;
  	}
  	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!');
  	console.log('><><><><><><><><><><><><><');
  	console.log(JSON.stringify(possible_way) !==  JSON.stringify(unit.possible_ways));
  	console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!');
  			if (JSON.stringify(possible_way) !==  JSON.stringify(unit.possible_ways)) {
  		console.log('CHANGED!!!!!');
  		console.log('CHANGED!!!!!');
  		console.log('CHANGED!!!!!');
  		unit.possible_ways = possible_way;
  	}
  }
  		console.log('direction --', direction);
  console.log('===============');
  		switch (direction) {
  	case 'left':
  		unit.body.moveLeft(this.basic_speed);
  		break;
  	case 'right':
  		unit.body.moveRight(this.basic_speed);
  		break;
  	case 'top':
  		unit.body.moveUp(this.basic_speed);
  		break;
  	case 'bottom':
  		unit.body.moveDown(this.basic_speed);
  		break;
  }
  		// unit.previous_cell = this.ways_opposites[direction];
  **/
	},

	collectBountyRune: function collectBountyRune(body1, body2, fixture1, fixture2, begin) {
		if (!begin) return;

		var _game = this;

		this.handlerUpdateScores(true);
		body2.sprite.destroy();

		setTimeout(function () {
			_game.drawRunes('bounty_rune');
		}, 5000);
	},

	collectHasteRune: function collectHasteRune(body1, body2, fixture1, fixture2, begin) {
		if (!begin) return;

		this.handlerSetHaste();
		body2.sprite.destroy();
	},

	handlerUpdateScores: function handlerUpdateScores(bounty) {
		var score_value = bounty ? 5 : 1;

		this.total_scores += score_value;
		document.getElementById('scores').innerHTML = this.total_scores;
	},

	handlerSetHaste: function handlerSetHaste(bounty) {
		var _game = this;

		this.aegis_haste = true;
		setTimeout(function () {
			_game.aegis_haste = false;

			setTimeout(function () {
				_game.drawRunes('haste_rune');
			}, 5000);
		}, this.haste_time * 1000);
	}

};

var game = new Phaser.Game(TOTAL_WIDTH, TOTAL_HEIGHT, Phaser.AUTO, 'maze', game_settings);

// http://www.html5gamedevs.com/topic/14971-hide-portions-of-tilemap-fog-of-war/ -- fog of war
// http://perplexingtech.weebly.com/game-dev-blog/using-states-in-phaserjs-javascript-game-developement -- states