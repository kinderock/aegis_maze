var game = new Phaser.Game(TOTAL_WIDTH, TOTAL_HEIGHT, Phaser.AUTO, 'maze', {
	preload: function() {
		game.load.image('aegis', '/images/aegis.png');
		game.load.image('water', '/images/water2.jpg');
		game.load.image('ground', '/images/ground.jpg');
	},


	create: function() {
		let wallsGroup = this.game.add.physicsGroup(Phaser.Physics.BOX2D);
		let floorsGroup = this.game.add.group();
		let map = getMaze(false);

		this.walls = wallsGroup;
		wallsGroup.enableBody = true;

		this.game.physics.startSystem(Phaser.Physics.BOX2D);
		this.game.physics.box2d.setBoundsToWorld();

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


		this.aegis = game.add.sprite(0, 0, 'aegis');
		this.game.physics.box2d.enable(this.aegis);
		this.aegis.body.fixedRotation = true;
		// this.aegis.body.setCircle(AEGIS_SIZE);
		this.aegis.body.collideWorldBounds = true;
		// this.aegis.body.bounce.setTo(1, 1);
		// console.log(this.aegis);

		this.cursors = game.input.keyboard.createCursorKeys();
	},


	render: function () {
		this.game.debug.box2dWorld(); // For debug
	},


	update: function() {
		let speed = 200;

		this.aegis.body.setZeroVelocity();
		// this.aegis.body.velocity.x = 0;
		// this.aegis.body.velocity.y = 0;

		// if (this.cursors.left.isDown || this.cursors.right.isDown) this.aegis.body.velocity.y = 0;
		// if (this.cursors.up.isDown   || this.cursors.down.isDown)  this.aegis.body.velocity.x = 0;

		if (this.cursors.left.isDown){
			this.aegis.body.moveLeft(speed);
			// this.aegis.body.velocity.x = -speed;
		} else if (this.cursors.right.isDown) {
			this.aegis.body.moveRight(speed);
			// this.aegis.body.velocity.x = speed;
		}

		if (this.cursors.up.isDown) {
			this.aegis.body.moveUp(speed);
			// this.aegis.body.velocity.y = -speed;
		} else if (this.cursors.down.isDown) {
			this.aegis.body.moveDown(speed);
			// this.aegis.body.velocity.y = speed;
		}

		// console.log('velocity', {x:this.aegis.body.x, y: this.aegis.body.y});
		// this.game.physics.arcade.collide(this.aegis, this.walls);
	}
});



// https://github.com/TinkoffCreditSystems/holyjsgame-2017/blob/master/src/states/GameState.js
// https://phaser.io/examples/v2/p2-physics/tilemap
