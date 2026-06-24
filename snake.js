const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status');
const controlsText = document.getElementById('controls');
const grid = 20;
const cols = canvas.width / grid;
const rows = canvas.height / grid;
let snake = [{x:10,y:10}];
let dir = {x:0,y:0};
const foodCount = 3;
let foods = [];
const baseSpeed = 120;
const minSpeed = 50;
const speedStep = 10;
const speedScoreStep = 5;
let speed = baseSpeed;
let timer = null;
let score = 0;
let highScore = Number(localStorage.getItem('snakeHighScore')) || 0;
let gameState = 'ready'; // 'ready', 'playing', 'paused', 'over'

document.addEventListener('keydown', e => {
  const k = e.key;
  if (k === 'ArrowUp' && dir.y !== 1) {
    dir = {x:0,y:-1};
    startGame();
  }
  if (k === 'ArrowDown' && dir.y !== -1) {
    dir = {x:0,y:1};
    startGame();
  }
  if (k === 'ArrowLeft' && dir.x !== 1) {
    dir = {x:-1,y:0};
    startGame();
  }
  if (k === 'ArrowRight' && dir.x !== -1) {
    dir = {x:1,y:0};
    startGame();
  }
  if (k === 'r' || k === 'R') reset();
  if (k === ' ' || k === 'Spacebar' || k === 'p' || k === 'P') togglePause();
  if (k === 'Enter' && gameState === 'ready') startGame();
});

function randomFood(){
  let p;
  do {
    p = {x: Math.floor(Math.random()*cols), y: Math.floor(Math.random()*rows)};
  } while (snake.some(s => s.x===p.x && s.y===p.y) || foods.some(f => f.x===p.x && f.y===p.y));
  return p;
}

function initFoods(){
  foods = [];
  while (foods.length < foodCount) {
    foods.push(randomFood());
  }
}

function updateSpeed(){
  const targetSpeed = Math.max(minSpeed, baseSpeed - Math.floor(score / speedScoreStep) * speedStep);
  if (targetSpeed !== speed) {
    speed = targetSpeed;
    if (timer) {
      clearInterval(timer);
      timer = setInterval(update, speed);
    }
  }
}

function startGame(){
  if (gameState === 'over') return;
  if (gameState === 'ready') {
    gameState = 'playing';
  }
  if (!timer) {
    timer = setInterval(update, speed);
  }
}

function togglePause(){
  if (gameState === 'playing') {
    gameState = 'paused';
  } else if (gameState === 'paused') {
    gameState = 'playing';
  }
  draw();
}

function update(){
  if (gameState === 'paused') {
    draw();
    return;
  }
  if (dir.x === 0 && dir.y === 0) {
    draw();
    return;
  }
  const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows || snake.some(s => s.x===head.x && s.y===head.y)) {
    return gameOver();
  }
  snake.unshift(head);
  const foodIndex = foods.findIndex(f => f.x===head.x && f.y===head.y);
  if (foodIndex !== -1) {
    score++;
    foods.splice(foodIndex, 1);
    foods.push(randomFood());
    updateSpeed();
  } else {
    snake.pop();
  }
  draw();
}

function draw(){
  ctx.fillStyle = '#111';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  drawGrid();
  ctx.fillStyle = 'lime';
  snake.forEach(s => {
    ctx.fillRect(s.x*grid, s.y*grid, grid-1, grid-1);
  });
  const colors = ['red', '#f39c12', '#9b59b6'];
  foods.forEach((f, i) => {
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(f.x*grid, f.y*grid, grid-1, grid-1);
  });
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.fillText('Score: '+score, 8, 14);
  ctx.fillText('High: '+highScore, 8, 30);
  ctx.fillText('Tick: '+speed+' ms', 8, 46);
  const status = gameState === 'ready'
    ? '按方向键开始'
    : gameState === 'paused'
      ? '已暂停：空格继续'
      : gameState === 'over'
        ? '游戏结束：按 R 重置'
        : '游戏进行中';
  ctx.fillText(status, 8, canvas.height - 10);
  if (statusText) statusText.textContent = status;
  if (controlsText) controlsText.textContent = '方向键移动 · 空格/P 暂停 · R 重置';
  if (gameState === 'paused') {
    drawOverlay('已暂停', '按 空格 继续');
  }
  if (gameState === 'over') {
    drawOverlay('游戏结束', '按 R 重置');
  }
}

function drawGrid(){
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawOverlay(title, subtitle){
  ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 10);
  ctx.font = '16px Arial';
  ctx.fillText(subtitle, canvas.width / 2, canvas.height / 2 + 20);
  ctx.textAlign = 'start';
}

function gameOver(){
  clearInterval(timer);
  timer = null;
  gameState = 'over';
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', highScore);
  }
  draw();
}

function reset(){
  snake = [{x:10,y:10}];
  dir = {x:0,y:0};
  score = 0;
  speed = baseSpeed;
  gameState = 'ready';
  clearInterval(timer);
  timer = null;
  initFoods();
  draw();
  loop();
}

function loop(){
  if (!timer) timer = setInterval(update, speed);
}

initFoods();
loop();
