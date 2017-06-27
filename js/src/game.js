var game_settings = {
	start_game: false,
	start_cell: null,
	game_timer: null,
	total_scores: 0,
	time_to_scores: 10,

	preload: function() {
		this.game.load.image('aegis', '/images/aegis_26.png');
		this.game.load.image('water', '/images/water_34.jpg');
		this.game.load.image('ground', '/images/ground_34.jpg');

	},


	create: function() {
		// Получаем данные для лабиринта
		let map = getMaze(false);

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
				if (map[x][y] === WALL) {
					let wall = wallsGroup.create(x * CELL_SIZE+CELL_SIZE/2, y * CELL_SIZE+CELL_SIZE/2, "water");
					wall.body.static = true;
				} else {
					let floor = floorsGroup.create(x * CELL_SIZE, y * CELL_SIZE, "ground");
				}
			}
		}

		// Берем рандомную ячейку с полом, чтобы отрисовать на ней Аегис
		this.start_cell = floorsGroup.children[Math.floor(Math.random()*floorsGroup.children.length)];

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

		// Создаем отслеживание нажатий на клавиатуру
		this.cursors = this.game.input.keyboard.createCursorKeys();
	},


	render: function () {
		// this.game.debug.box2dWorld(); // For debug
	},


	update: function() {
		let speed = 200;

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
	},


	updateScores: function(bounty) {
		let score_value = (bounty) ? 5 : 1;

		this.total_scores += score_value;
		document.getElementById('scores').innerHTML = this.total_scores;
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

			if (passed_time % (time_to_scores*100) == 0) game_settings.updateScores(false);

			if (mlseconds < 10) {mlseconds = "0" + mlseconds;}
			if (seconds   < 10) {seconds   = "0" + seconds;}
			if (minutes   < 10) {minutes   = "0" + minutes;}

			document.getElementById('timer').innerHTML = minutes + ':' + seconds + ':' + mlseconds;
		}, 10);
	}
};


var game = new Phaser.Game(TOTAL_WIDTH, TOTAL_HEIGHT, Phaser.AUTO, 'maze', game_settings);



// http://www.html5gamedevs.com/topic/14971-hide-portions-of-tilemap-fog-of-war/ -- fog of war
// http://perplexingtech.weebly.com/game-dev-blog/using-states-in-phaserjs-javascript-game-developement -- states
