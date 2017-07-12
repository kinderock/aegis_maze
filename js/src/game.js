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

	preload: function() {
		this.game.load.image('aegis', '/images/aegis_26.png');
		this.game.load.image('enemy', '/images/enemy_26.png');
		this.game.load.image('water', '/images/water_34.jpg');
		this.game.load.image('ground', '/images/ground_34.jpg');
		this.game.load.image('bounty_rune', '/images/bounty_rune_32.png');
		this.game.load.image('haste_rune', '/images/haste_rune_32.png');
	},


	create: function() {
		// Получаем данные для лабиринта
		this.map = getMaze(false);


		// Создаем группы под пол и воду
		let wallsGroup = this.game.add.physicsGroup(Phaser.Physics.BOX2D);
		let floorsGroup = this.game.add.group();


		// Заводим физику
		this.game.physics.startSystem(Phaser.Physics.BOX2D);
		this.game.physics.box2d.setBoundsToWorld();

		this.walls = wallsGroup;
		wallsGroup.enableBody = true;


		// Заводим в группы стены и пол
		for (let y = 0; y < CELL_HEIGHT; y++) {
			for (let x = 0; x < CELL_WIDTH; x++) {
				if (this.map[x][y] === WALL) {
					let wall = wallsGroup.create(x * CELL_SIZE+CELL_SIZE/2, y * CELL_SIZE+CELL_SIZE/2, "water");
					wall.body.static = true;
				} else {
					let floor = floorsGroup.create(x * CELL_SIZE, y * CELL_SIZE, "ground");
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
		this.aegis.body.setCircle(CELL_SIZE/2 - 1);
		this.aegis.body.collideWorldBounds = true;
		this.aegis.start_position = {
			x: this.start_cell.position.x + CELL_SIZE / 2,
			y: this.start_cell.position.y + CELL_SIZE / 2
		};


		// Создаем баунти руну
		this.drawRunes('bounty_rune');

		// Создаем хаст руну
		this.drawRunes('haste_rune');

		// Создаем хаст руну
		this.drawEnemy();


		// Создаем отслеживание нажатий на клавиатуру
		this.cursors = this.game.input.keyboard.createCursorKeys();
	},


	render: function () {
		// this.game.debug.box2dWorld(); // For debug
	},


	update: function() {
		let speed = (this.aegis_haste) ? this.basic_speed * 2 : this.basic_speed;
		let _game = this;

		this.aegis.body.setZeroVelocity();

		if (this.cursors.left.isDown){
			this.aegis.body.moveLeft(speed);
		} else if (this.cursors.right.isDown) {
			this.aegis.body.moveRight(speed);
		}

		if (this.cursors.up.isDown) {
			this.aegis.body.moveUp(speed);
		} else if (this.cursors.down.isDown) {
			this.aegis.body.moveDown(speed);
		}

		if (!this.start_game && (this.aegis.position.x !== this.aegis.start_position.x || this.aegis.position.y !== this.aegis.start_position.y)) {
			this.start_game = true;
			this.startTimer();
		}

		if (this.start_game) {
			this.enemies.forEach((enemy) => {
				_game.enemyMove(enemy, _game.enemyGetPossibleWay(enemy));
			});
		}

	},


	startTimer: function() {
		let _game = this,
				passed_time = 0,
				time_to_scores = _game.time_to_scores;

		clearInterval(_game.game_timer);
		_game = setInterval(function() {
			passed_time++;

			let mlseconds = passed_time % 100;
			let seconds   = Math.floor((passed_time / 100) % 60);
			let minutes   = Math.floor(passed_time / 6000);

			if (passed_time % (time_to_scores*100) == 0) game_settings.handlerUpdateScores(false);

			if (mlseconds < 10) {mlseconds = "0" + mlseconds;}
			if (seconds   < 10) {seconds   = "0" + seconds;}
			if (minutes   < 10) {minutes   = "0" + minutes;}

			document.getElementById('timer').innerHTML = minutes + ':' + seconds + ':' + mlseconds;
		}, 10);
	},


	getRandomFloor: function(floors) {
		return floors.children[Math.floor(Math.random()*floors.children.length)];
	},


	drawRunes: function(rune) {
		let _game = this;

		let rune_obj = null,
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


	drawEnemy: function() {
		// https://github.com/bxia/Javascript-Pacman/blob/master/Ghost.js
		let _game = this;

		let enemy = null,
				enemy_callback = _game.detectEnemy,
				enemy_cell = this.getRandomFloor(_game.floors);

		enemy = this.game.add.sprite(enemy_cell.position.x + CELL_SIZE / 2, enemy_cell.position.y + CELL_SIZE / 2, 'enemy');
		_game.game.physics.box2d.enable(enemy);
		enemy.body.fixedRotation = true;
		enemy.body.setCircle(CELL_SIZE/2 - 1);
		enemy.body.collideWorldBounds = true;
		enemy.move_direction = null;
		_game.aegis.body.setBodyContactCallback(enemy, enemy_callback, this);

		_game.enemies.push(enemy);
	},


	detectEnemy: function() {
		console.log('ssss dddd');
	},


	enemyGetPossibleWay: function(unit) {
		let	nearby_cells = {},
				possible_way = [],
				cell_x = Math.floor(unit.position.x / CELL_SIZE),
				cell_y = Math.floor(unit.position.y / CELL_SIZE);
				console.log('cell_x', cell_x);
				console.log('cell_y', cell_y);
		nearby_cells['left']   = this.map[cell_x - 1][cell_y];
		nearby_cells['right']  = this.map[cell_x + 1][cell_y];
		nearby_cells['top']    = this.map[cell_x][cell_y - 1];
		nearby_cells['bottom'] = this.map[cell_x][cell_y + 1];

		for (var cell in nearby_cells) {
			if (nearby_cells[cell] === 'floor') possible_way.push(cell);
		}

		return possible_way
	},


	enemyMove: function(unit, possible_way) {
		let direction = unit.move_direction || null;
		console.log('possible_way ->', possible_way);

		if (!direction) {
			direction = possible_way[Math.floor(Math.random() * possible_way.length)];
			unit.move_direction = direction;
		} else {
			if (possible_way.filter((way) => { return way === direction}).length == 0) {
				unit.move_direction = null;
			}
		}

		console.log('direction --', direction);

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
	},


	collectBountyRune: function(body1, body2, fixture1, fixture2, begin) {
		if (!begin) return;

		let _game = this;

		this.handlerUpdateScores(true);
		body2.sprite.destroy();

		setTimeout(function() {
			_game.drawRunes('bounty_rune');
		}, 5000);
	},


	collectHasteRune: function(body1, body2, fixture1, fixture2, begin) {
		if (!begin) return;

		this.handlerSetHaste();
		body2.sprite.destroy();
	},


	handlerUpdateScores: function(bounty) {
		let score_value = (bounty) ? 5 : 1;

		this.total_scores += score_value;
		document.getElementById('scores').innerHTML = this.total_scores;
	},


	handlerSetHaste: function(bounty) {
		let _game = this;

		this.aegis_haste = true;
		setTimeout(function(){
			_game.aegis_haste = false;

			setTimeout(function() {
				_game.drawRunes('haste_rune');
			}, 5000);
		}, this.haste_time * 1000);
	},


};


var game = new Phaser.Game(TOTAL_WIDTH, TOTAL_HEIGHT, Phaser.AUTO, 'maze', game_settings);


// http://www.html5gamedevs.com/topic/14971-hide-portions-of-tilemap-fog-of-war/ -- fog of war
// http://perplexingtech.weebly.com/game-dev-blog/using-states-in-phaserjs-javascript-game-developement -- states
