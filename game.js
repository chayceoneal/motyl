const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game state
let player = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  width: 40,
  height: 40,
  speed: 5,
  emoji: "🦋"
};

let hazards = [];
let score = 0;
let gameOver = false;
let gameSpeed = 2;

// Input handling
let keys = {};
let touchStartX = 0;
let isTouching = false;

// Event listeners
document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Touch controls
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  isTouching = true;
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!isTouching) return;
  
  const touch = e.touches[0];
  const deltaX = touch.clientX - touchStartX;
  
  if (deltaX > 50) {
    keys["ArrowRight"] = true;
    keys["ArrowLeft"] = false;
  } else if (deltaX < -50) {
    keys["ArrowLeft"] = true;
    keys["ArrowRight"] = false;
  } else {
    keys["ArrowLeft"] = false;
    keys["ArrowRight"] = false;
  }
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  isTouching = false;
  keys["ArrowLeft"] = false;
  keys["ArrowRight"] = false;
}, { passive: false });

// Mouse controls for desktop
canvas.addEventListener("mousedown", (e) => {
  touchStartX = e.clientX;
  isTouching = true;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isTouching) return;
  
  const deltaX = e.clientX - touchStartX;
  
  if (deltaX > 50) {
    keys["ArrowRight"] = true;
    keys["ArrowLeft"] = false;
  } else if (deltaX < -50) {
    keys["ArrowLeft"] = true;
    keys["ArrowRight"] = false;
  } else {
    keys["ArrowLeft"] = false;
    keys["ArrowRight"] = false;
  }
});

canvas.addEventListener("mouseup", (e) => {
  isTouching = false;
  keys["ArrowLeft"] = false;
  keys["ArrowRight"] = false;
});

// Hazard types
const hazardTypes = [
  { emoji: "🐦", type: "bird", speed: 3, follows: true },
  { emoji: "🐝", type: "bee", speed: 4, follows: true },
  { emoji: "🌲", type: "tree", speed: 2, follows: false },
  { emoji: "🪨", type: "rock", speed: 2, follows: false }
];

function spawnHazard() {
  const hazardType = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
  const x = Math.random() * canvas.width;
  
  hazards.push({
    x: x,
    y: -50,
    width: 30,
    height: 30,
    emoji: hazardType.emoji,
    type: hazardType.type,
    speed: hazardType.speed,
    follows: hazardType.follows,
    originalX: x
  });
}

function updatePlayer() {
  if (gameOver) return;
  
  // Move player left/right
  if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
    player.x -= player.speed;
  }
  if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
    player.x += player.speed;
  }
  
  // Keep player on screen
  player.x = Math.max(player.width/2, Math.min(canvas.width - player.width/2, player.x));
}

function updateHazards() {
  hazards = hazards.filter(hazard => {
    // Move hazard down
    hazard.y += gameSpeed;
    
    // If it's a following hazard (bird/bee), also move towards player
    if (hazard.follows) {
      const dx = player.x - hazard.x;
      hazard.x += dx * 0.02; // Gradual following
    }
    
    // Remove if off screen
    if (hazard.y > canvas.height + 50) {
      return false;
    }
    
    return true;
  });
  
  // Spawn new hazards
  if (Math.random() < 0.02) {
    spawnHazard();
  }
  
  // Increase game speed over time
  gameSpeed += 0.001;
}

function checkCollisions() {
  for (let hazard of hazards) {
    const dx = player.x - hazard.x;
    const dy = player.y - hazard.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < (player.width + hazard.width) / 2) {
      gameOver = true;
      return;
    }
  }
}

function update() {
  if (gameOver) return;
  
  updatePlayer();
  updateHazards();
  checkCollisions();
  
  score++;
}

function draw() {
  // Clear canvas
  ctx.fillStyle = "#e0f7fa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw player
  ctx.font = "32px serif";
  ctx.fillText(player.emoji, player.x - 16, player.y + 16);
  
  // Draw hazards
  hazards.forEach(hazard => {
    ctx.font = "24px serif";
    ctx.fillText(hazard.emoji, hazard.x - 12, hazard.y + 12);
  });
  
  // Draw score
  ctx.font = "24px sans-serif";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + Math.floor(score/10), 20, 40);
  
  // Draw game over screen
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = "48px sans-serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText("Final Score: " + Math.floor(score/10), canvas.width / 2, canvas.height / 2);
    ctx.fillText("Tap to restart", canvas.width / 2, canvas.height / 2 + 50);
    ctx.textAlign = "left";
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Handle window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  player.y = canvas.height - 100;
});

// Restart game on tap/click when game over
canvas.addEventListener("click", () => {
  if (gameOver) {
    // Reset game state
    player.x = canvas.width / 2;
    hazards = [];
    score = 0;
    gameOver = false;
    gameSpeed = 2;
    keys = {};
  }
});

canvas.addEventListener("touchend", () => {
  if (gameOver) {
    // Reset game state
    player.x = canvas.width / 2;
    hazards = [];
    score = 0;
    gameOver = false;
    gameSpeed = 2;
    keys = {};
  }
}, { passive: false });

// Start the game
gameLoop();
