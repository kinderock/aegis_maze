var game = new Phaser.Game(TOTAL_WIDTH, TOTAL_HEIGHT, Phaser.AUTO, 'maze', {
  preload: function() {
    game.load.image('aegis', '/images/aegis.png');
    game.load.image('water', '/images/water.jpg');
    game.load.image('ground', '/images/ground.jpg');
  },


  create: function() {
    let wallsGroup = this.game.add.group();
    let floorsGroup = this.game.add.group();
    let map = getMaze(false);

    this.walls = wallsGroup;
    wallsGroup.enableBody = true;


    for (let y = 0; y < CELL_HEIGHT; y++) {
      for (let x = 0; x < CELL_WIDTH; x++) {
        if (map[x][y] === WALL) {
          let wall = wallsGroup.create(x * CELL_SIZE, y * CELL_SIZE, "water");
          wall.body.immovable = true;
        } else {
          let floor = floorsGroup.create(x * CELL_SIZE, y * CELL_SIZE, "ground");

          this.game.physics.arcade.enable(floor);
          this.game.physics.arcade.overlap(floor, wallsGroup, function (floor, wall) {
            wall.destroy();
          });
        }
      }
    }



    this.aegis = game.add.sprite(0, 0, 'aegis');
    this.game.physics.arcade.enable(this.aegis);
    this.aegis.body.setSize(CELL_SIZE, CELL_SIZE);
    this.aegis.body.collideWorldBounds = true;
    // this.aegis.body.bounce.setTo(1, 1);

    this.cursors = game.input.keyboard.createCursorKeys();

  },


  update: function() {
    let speed = 100;

    // this.aegis.body.velocity.x = 0;
    // this.aegis.body.velocity.y = 0;

    // if (this.cursors.left.isDown || this.cursors.right.isDown) this.aegis.body.velocity.y = 0;
    // if (this.cursors.up.isDown   || this.cursors.down.isDown)  this.aegis.body.velocity.x = 0;

    if (this.cursors.left.isDown){
      this.aegis.body.velocity.x = -speed;
    } else if (this.cursors.right.isDown) {
      this.aegis.body.velocity.x = speed;
    }

    if (this.cursors.up.isDown) {
      this.aegis.body.velocity.y = -speed;
    } else if (this.cursors.down.isDown) {
      this.aegis.body.velocity.y = speed;
    }

    // console.log('velocity', {x:this.aegis.body.x, y: this.aegis.body.y});
    this.game.physics.arcade.collide(this.aegis, this.walls);
  }
});



// https://github.com/TinkoffCreditSystems/holyjsgame-2017/blob/master/src/states/GameState.js
// https://phaser.io/examples/v2/p2-physics/tilemap









// Game.init = function() {
//   let map = getMaze(false);
//   Game.drawMap(map);
// }
//
// Game.drawMap = function(map) {
//   console.log(map.length);
//   for (let i = 0; i < map.length; i++) {
//     console.log(maze);
//     let row = document.createElement('div');
//     row.className = 'row row'+i;
//
//     for (let j = 0; j < map[i].length; j++) {
//       row.innerHTML += '<div class="block '+map[i][j]+'"><div/>';
//     }
//     maze.appendChild(row)
//   }
// }
//
//
//
// document.addEventListener('DOMContentLoaded', () => {
//   // Game.init();
// });
