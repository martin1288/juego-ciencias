<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.3.10/pixi.min.js"></script>
  <style>
    body {
      margin: 0;
      overflow: hidden;
    }
    #gameOverScreen {
      display: none;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    #scoreBoard, #livesBoard {
      position: absolute;
      top: 10px;
      left: 10px;
      color: white;
      font-size: 20px;
    }
    #livesBoard {
      left: auto;
      right: 10px;
    }
    #pauseButton {
      position: absolute;
      top: 50px;
      left: 10px;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="gameOverScreen">
    <img id="gameOverImage" src="reprobado.jpg" alt="Game Over">
  </div>
  <div id="scoreBoard">Score: 0</div>
  <div id="livesBoard">Lives: 3</div>
  <div id="pauseButton">Pause</div>
  <script>
    // Initialize PixiJS
    const app = new PIXI.Application({
      width: 800,
      height: 600,
      backgroundColor: 0x87CEEB, // Light blue background to simulate the sky
    });
    document.body.appendChild(app.view);

    // Game variables
    let score = 0;
    let lives = 3;
    let isPaused = false;

    // Create ground
    const ground = new PIXI.Graphics();
    ground.beginFill(0x654321); // Brown color
    ground.drawRect(0, 550, 800, 50); // Ground position and size
    ground.endFill();
    app.stage.addChild(ground);

    // Create platforms
    const platforms = [
      { x: 100, y: 450, width: 200, height: 20 },
      { x: 350, y: 350, width: 150, height: 20 },
      { x: 600, y: 250, width: 150, height: 20 },
    ];
    platforms.forEach(platform => {
      const platformGraphic = new PIXI.Graphics();
      platformGraphic.beginFill(0x8B4513); // SaddleBrown color
      platformGraphic.drawRect(platform.x, platform.y, platform.width, platform.height);
      platformGraphic.endFill();
      app.stage.addChild(platformGraphic);
      platform.y1 = platform.y; // Save y position for collision detection
      platform.x2 = platform.x + platform.width; // Save x2 position for collision detection
      platform.y2 = platform.y + platform.height; // Save y2 position for collision detection
    });

    // Load player image
    const playerTexture = PIXI.Texture.from('stickman.png');
    const player = new PIXI.Sprite(playerTexture);
    player.anchor.set(0.5);
    player.x = 50;
    player.y = 500; // Initial player position
    player.vx = 0; // Velocity X
    player.vy = 0; // Velocity Y
    app.stage.addChild(player);

    // Load obstacle image
    const obstacleTexture = PIXI.Texture.from('img.png');
    const obstacles = [];
    for (let i = 0; i < 3; i++) {
      const obstacle = new PIXI.Sprite(obstacleTexture);
      obstacle.anchor.set(0.5);
      obstacle.x = Math.random() * 700 + 50;
      obstacle.y = -Math.random() * 500;
      obstacle.speed = Math.random() * 2 + 1;
      obstacles.push(obstacle);
      app.stage.addChild(obstacle);
    }

    // Variables for jumping
    let isJumping = false;
    const gravity = 0.5;
    const jumpPower = -10;

    // Game over elements
    const gameOverScreen = document.getElementById('gameOverScreen');
    const gameOverImage = document.getElementById('gameOverImage');

    // Score and lives elements
    const scoreBoard = document.getElementById('scoreBoard');
    const livesBoard = document.getElementById('livesBoard');

    // Pause button
    const pauseButton = document.getElementById('pauseButton');
    pauseButton.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    });

    // Game loop
    app.ticker.add(() => {
      if (isPaused) return;

      // Apply gravity
      player.vy += gravity;
      player.y += player.vy;

      // Horizontal movement
      player.x += player.vx;

      // Check for collision with ground
      if (player.y > 500) {
        player.y = 500;
        player.vy = 0;
        isJumping = false;
      }

      // Check for collision with platforms
      platforms.forEach(platform => {
        if (player.y + player.height / 2 > platform.y1 &&
            player.y - player.height / 2 < platform.y2 &&
            player.x + player.width / 2 > platform.x &&
            player.x - player.width / 2 < platform.x2) {
          player.y = platform.y1 - player.height / 2;
          player.vy = 0;
          isJumping = false;
        }
      });

      // Move obstacles
      obstacles.forEach(obstacle => {
        obstacle.y += obstacle.speed;
        if (obstacle.y > app.screen.height) {
          obstacle.y = -Math.random() * 500;
          obstacle.x = Math.random() * 700 + 50;
          score += 10;
          scoreBoard.textContent = `Score: ${score}`;
        }

        // Check for collision with player
        if (
          player.x < obstacle.x + obstacle.width / 2 &&
          player.x + player.width / 2 > obstacle.x &&
          player.y < obstacle.y + obstacle.height / 2 &&
          player.y + player.height / 2 > obstacle.y
        ) {
          lives--;
          livesBoard.textContent = `Lives: ${lives}`;
          if (lives <= 0) {
            gameOverScreen.style.display = 'block';
            app.ticker.stop();
          }
          obstacle.y = -Math.random() * 500;
          obstacle.x = Math.random() * 700 + 50;
        }
      });

      // Limit movement to canvas boundaries
      if (player.x < 0) player.x = 0;
      if (player.x > app.screen.width) player.x = app.screen.width;
    });

    // Handle keyboard input
    const keys = {};
    window.addEventListener("keydown", e => {
      keys[e.key] = true;
      if (e.key === 'ArrowLeft') player.vx = -5;
      if (e.key === 'ArrowRight') player.vx = 5;
      if (e.key === ' ' && !isJumping) {
        player.vy = jumpPower;
        isJumping = true;
      }
    });
    window.addEventListener("keyup", e => {
      keys[e.key] = false;
      if (e.key === 'ArrowLeft' && !keys['ArrowRight']) player.vx = 0;
      if (e.key === 'ArrowRight' && !keys['ArrowLeft']) player.vx = 0;
    });
  </script>
</body>
</html>
