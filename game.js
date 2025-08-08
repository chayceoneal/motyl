// Butterfly Game Logic and Instructions for Cursor

// --- GAME CONSTANTS ---
const GRID_SIZE = 16;
const NUM_FLOWERS = 8;
const NUM_BIRDS = 2;
const NUM_OBSTACLES = 10; // Trees and rocks
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
  ctx.clearRect(0, 0, 480, 480);

  // Detect if we're on mobile and set appropriate font size
  const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
  const fontSize = isMobile ? 48 : 24;
  ctx.font = `${fontSize}px Arial`;

  // Calculate position offset and cell size based on font size
  const offset = fontSize - 8;
  const cellSize = 480 / GRID_SIZE; // 30px per cell

  // Draw obstacles (trees and rocks)
  gameState.obstacles.forEach((obstacle, index) => {
    // Alternate between trees and rocks
    const emoji = index % 2 === 0 ? "🌳" : "🪨";
    ctx.fillText(emoji, obstacle.x * cellSize, obstacle.y * cellSize + offset);
  });

  // Draw butterfly
  ctx.fillText("🦋", gameState.butterfly.x * cellSize, gameState.butterfly.y * cellSize + offset);

  // Draw flowers
  gameState.flowers.forEach(f => ctx.fillText("🌸", f.x * cellSize, f.y * cellSize + offset));

  // Draw birds
  gameState.birds.forEach(b => ctx.fillText("🐦", b.x * cellSize, b.y * cellSize + offset));
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
  canvas.width = 480;
  canvas.height = 480;
  
  // Make canvas responsive and larger for better touch interface
  function resizeCanvas() {
    const maxWidth = Math.min(window.innerWidth - 20, 600);
    const maxHeight = Math.min(window.innerHeight * 0.7, 600);
    const scale = Math.min(maxWidth / 480, maxHeight / 480);
    
    canvas.style.width = (480 * scale) + 'px';
    canvas.style.height = (480 * scale) + 'px';
  }
  
  // Initial resize
  resizeCanvas();
  
  // Resize on window resize
  window.addEventListener('resize', resizeCanvas);
  
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
  
  // Add mobile controls
  console.log("Adding mobile controls...");
  addMobileControls(canvas);
  
  console.log("Game setup complete!");
});

// --- MOBILE CONTROLS ---
function addMobileControls(canvas) {
  let startX, startY, endX, endY;
  let isSwiping = false;
  
  // Touch events for swipe detection
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    isSwiping = true;
  }, { passive: false });
  
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });
  
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!isSwiping) return;
    
    const touch = e.changedTouches[0];
    endX = touch.clientX;
    endY = touch.clientY;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 30; // Minimum distance for a swipe
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        const direction = deltaX > 0 ? 'right' : 'left';
        console.log('Swipe detected:', direction);
        moveButterfly(direction);
        drawGame(canvas.getContext('2d'));
        
        if (gameState.gameOver) {
          alert("Game Over! Score: " + gameState.score);
        } else if (gameState.flowers.length === 0) {
          alert("You win! Score: " + gameState.score);
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        const direction = deltaY > 0 ? 'down' : 'up';
        console.log('Swipe detected:', direction);
        moveButterfly(direction);
        drawGame(canvas.getContext('2d'));
        
        if (gameState.gameOver) {
          alert("Game Over! Score: " + gameState.score);
        } else if (gameState.flowers.length === 0) {
          alert("You win! Score: " + gameState.score);
        }
      }
    }
    
    isSwiping = false;
  }, { passive: false });
  
  // Mouse events for testing on desktop
  canvas.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
    isSwiping = true;
  });
  
  canvas.addEventListener('mouseup', (e) => {
    if (!isSwiping) return;
    
    endX = e.clientX;
    endY = e.clientY;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        const direction = deltaX > 0 ? 'right' : 'left';
        console.log('Mouse swipe detected:', direction);
        moveButterfly(direction);
        drawGame(canvas.getContext('2d'));
        
        if (gameState.gameOver) {
          alert("Game Over! Score: " + gameState.score);
        } else if (gameState.flowers.length === 0) {
          alert("You win! Score: " + gameState.score);
        }
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        const direction = deltaY > 0 ? 'down' : 'up';
        console.log('Mouse swipe detected:', direction);
        moveButterfly(direction);
        drawGame(canvas.getContext('2d'));
        
        if (gameState.gameOver) {
          alert("Game Over! Score: " + gameState.score);
        } else if (gameState.flowers.length === 0) {
          alert("You win! Score: " + gameState.score);
        }
      }
    }
    
    isSwiping = false;
  });
}
