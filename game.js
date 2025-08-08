// Butterfly Game Logic and Instructions for Cursor

// --- GAME CONSTANTS ---
const GRID_SIZE = 32;
const NUM_FLOWERS = 10;
const NUM_BIRDS = 5;
const NUM_OBSTACLES = 8; // Trees and rocks
const BUTTERFLY_SPEED = 1;
const BIRD_SPEED = 0.5; // birds move every 2 turns

// --- GAME STATE ---
let gameState = {
  butterfly: { x: 0, y: 0 },
  flowers: [],
  birds: [],
  obstacles: [],
  turnCount: 0,
  score: 0,
  gameOver: false
};

// --- INITIALIZATION ---
function getRandomPosition() {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE)
  };
}

function initializeGame() {
  gameState.butterfly = getRandomPosition();

  // Place flowers
  gameState.flowers = Array.from({ length: NUM_FLOWERS }, getRandomPosition);

  // Place birds
  gameState.birds = Array.from({ length: NUM_BIRDS }, getRandomPosition);

  // Place obstacles (trees and rocks)
  gameState.obstacles = Array.from({ length: NUM_OBSTACLES }, getRandomPosition);

  gameState.turnCount = 0;
  gameState.score = 0;
  gameState.gameOver = false;
}

// --- MOVEMENT LOGIC ---
function moveButterfly(direction) {
  if (gameState.gameOver) return;
  let { x, y } = gameState.butterfly;
  let newX = x, newY = y;
  
  if (direction === 'up') newY = Math.max(0, y - BUTTERFLY_SPEED);
  else if (direction === 'down') newY = Math.min(GRID_SIZE - 1, y + BUTTERFLY_SPEED);
  else if (direction === 'left') newX = Math.max(0, x - BUTTERFLY_SPEED);
  else if (direction === 'right') newX = Math.min(GRID_SIZE - 1, x + BUTTERFLY_SPEED);

  // Check if new position collides with obstacles
  const collidesWithObstacle = gameState.obstacles.some(obstacle => 
    obstacle.x === newX && obstacle.y === newY
  );

  // Only move if not colliding with obstacle
  if (!collidesWithObstacle) {
    gameState.butterfly = { x: newX, y: newY };
    gameState.turnCount++;

    checkFlowerCollision();
    if (gameState.turnCount % 2 === 0) moveBirds();
    checkBirdCollision();
  }
}

function moveBirds() {
  gameState.birds = gameState.birds.map(bird => {
    const dx = gameState.butterfly.x - bird.x;
    const dy = gameState.butterfly.y - bird.y;
    let moveX = dx === 0 ? 0 : dx / Math.abs(dx);
    let moveY = dy === 0 ? 0 : dy / Math.abs(dy);

    return {
      x: Math.min(GRID_SIZE - 1, Math.max(0, bird.x + moveX)),
      y: Math.min(GRID_SIZE - 1, Math.max(0, bird.y + moveY))
    };
  });
}

function checkFlowerCollision() {
  gameState.flowers = gameState.flowers.filter(flower => {
    if (flower.x === gameState.butterfly.x && flower.y === gameState.butterfly.y) {
      gameState.score++;
      return false;
    }
    return true;
  });
}

function checkBirdCollision() {
  for (let bird of gameState.birds) {
    if (bird.x === gameState.butterfly.x && bird.y === gameState.butterfly.y) {
      gameState.gameOver = true;
      break;
    }
  }
}

// --- UI HANDLER ---
function drawGame(ctx) {
  console.log("Drawing game with butterfly at:", gameState.butterfly);
  ctx.clearRect(0, 0, 640, 640);

  // Draw obstacles (trees and rocks)
  gameState.obstacles.forEach((obstacle, index) => {
    // Alternate between trees and rocks
    const emoji = index % 2 === 0 ? "🌳" : "🪨";
    ctx.fillText(emoji, obstacle.x * 20, obstacle.y * 20 + 16);
  });

  // Draw butterfly
  ctx.fillText("🦋", gameState.butterfly.x * 20, gameState.butterfly.y * 20 + 16);

  // Draw flowers
  gameState.flowers.forEach(f => ctx.fillText("🌸", f.x * 20, f.y * 20 + 16));

  // Draw birds
  gameState.birds.forEach(b => ctx.fillText("🐦", b.x * 20, b.y * 20 + 16));
}

function handleInput(e) {
  const keyMap = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right'
  };
  const direction = keyMap[e.key];
  if (direction) {
    moveButterfly(direction);
    drawGame(document.querySelector('canvas').getContext('2d'));

    if (gameState.gameOver) alert("Game Over! Score: " + gameState.score);
    else if (gameState.flowers.length === 0) alert("You win! Score: " + gameState.score);
  }
}

// --- PAGE SETUP ---
document.addEventListener("DOMContentLoaded", () => {
  console.log("Game.js loaded, initializing...");
  
  // Create canvas and add it to the page
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 640;
  canvas.style.border = '2px solid #333'; // Black border
  
  // Find the game-info div and insert canvas after it
  const gameInfo = document.querySelector('.game-info');
  if (gameInfo) {
    console.log("Found game-info div, inserting canvas after it");
    gameInfo.parentNode.insertBefore(canvas, gameInfo.nextSibling);
  } else {
    console.log("Game-info div not found, appending canvas to body");
    document.body.appendChild(canvas);
  }

  console.log("Initializing game...");
  initializeGame();
  console.log("Drawing game...");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    console.log("Canvas context created successfully");
    drawGame(ctx);
  } else {
    console.error("Failed to get canvas context");
  }
  console.log("Adding keyboard listener...");
  document.addEventListener("keydown", handleInput);
  console.log("Game setup complete!");
});
