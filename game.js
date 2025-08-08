const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  speed: 2,
  angle: 0,
  emoji: "🦋"
};

let flowers = [];
let hazards = [];
let score = 0;
let gameOver = false;

// Touch/swipe controls
let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;

// Spawn helpers
function spawnFlower() {
  flowers.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    emoji: "🌸"
  });
}

function spawnHazard() {
  const hazardEmojis = ["🐦", "🪨", "🌲"];
  hazards.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    emoji: hazardEmojis[Math.floor(Math.random() * hazardEmojis.length)]
  });
}

// Input handling
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") player.angle -= 0.2;
  if (e.key === "ArrowRight") player.angle += 0.2;
});

// Touch controls
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  isTouching = true;
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (!isTouching) return;
  
  const touch = e.touches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;
  
  // Calculate angle based on swipe direction
  if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
    player.angle = Math.atan2(deltaY, deltaX);
  }
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  e.preventDefault();
  isTouching = false;
}, { passive: false });

// Mouse controls for desktop
canvas.addEventListener("mousedown", (e) => {
  touchStartX = e.clientX;
  touchStartY = e.clientY;
  isTouching = true;
});

canvas.addEventListener("mousemove", (e) => {
  if (!isTouching) return;
  
  const deltaX = e.clientX - touchStartX;
  const deltaY = e.clientY - touchStartY;
  
  if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
    player.angle = Math.atan2(deltaY, deltaX);
  }
});

canvas.addEventListener("mouseup", (e) => {
  isTouching = false;
});

// Spawn initial objects
for (let i = 0; i < 5; i++) spawnFlower();
for (let i = 0; i < 3; i++) spawnHazard();

function drawEmoji(emoji, x, y) {
  ctx.font = "24px serif";
  ctx.fillText(emoji, x, y);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function update() {
  if (gameOver) return;

  // Move player
  player.x += Math.cos(player.angle) * player.speed;
  player.y += Math.sin(player.angle) * player.speed;

  // Wrap around screen
  if (player.x < 0) player.x = canvas.width;
  if (player.x > canvas.width) player.x = 0;
  if (player.y < 0) player.y = canvas.height;
  if (player.y > canvas.height) player.y = 0;

  // Collision with flowers
  flowers = flowers.filter(f => {
    if (distance(player, f) < 20) {
      score++;
      player.speed += 0.05; // Slight speed increase
      spawnFlower();
      return false;
    }
    return true;
  });

  // Collision with hazards
  for (let h of hazards) {
    if (distance(player, h) < 20) {
      gameOver = true;
      break;
    }
  }

  // Randomly add hazards
  if (Math.random() < 0.005) spawnHazard();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw flowers
  flowers.forEach(f => drawEmoji(f.emoji, f.x, f.y));

  // Draw hazards
  hazards.forEach(h => drawEmoji(h.emoji, h.x, h.y));

  // Draw player
  drawEmoji(player.emoji, player.x, player.y);

  // Score
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 10, 30);

  if (gameOver) {
    ctx.font = "48px sans-serif";
    ctx.fillText("Game Over! Final Score: " + score, canvas.width / 4, canvas.height / 2);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Handle window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

loop();
