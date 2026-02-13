const canvas = document.getElementById('board')
const ctx = canvas.getContext('2d')
const scoreEl = document.getElementById('score')
const startBtn = document.getElementById('startBtn')
const resetBtn = document.getElementById('resetBtn')
const overlay = document.getElementById('overlay')
const overlayReset = document.getElementById('overlayReset')

const tile = 20
const cols = Math.floor(canvas.width / tile)
const rows = Math.floor(canvas.height / tile)
let loop = null
let speed = 120

let snake = []
let dir = { x: 1, y: 0 }
let nextDir = { x: 1, y: 0 }
let food = { x: 0, y: 0 }
let score = 0
let running = false
let ended = false

function rnd(n) {
  return Math.floor(Math.random() * n)
}

function placeFood() {
  let x = rnd(cols)
  let y = rnd(rows)
  while (snake.some(s => s.x === x && s.y === y)) {
    x = rnd(cols)
    y = rnd(rows)
  }
  food = { x, y }
}

function init() {
  snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }]
  dir = { x: 1, y: 0 }
  nextDir = { x: 1, y: 0 }
  score = 0
  scoreEl.textContent = score
  ended = false
  placeFood()
  draw()
}

function start() {
  if (running) return
  running = true
  overlay.classList.add('hidden')
  loop = setInterval(tick, speed)
}

function stop() {
  running = false
  if (loop) {
    clearInterval(loop)
    loop = null
  }
}

function reset() {
  stop()
  init()
}

function tick() {
  dir = nextDir
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
  if (hitWall(head) || hitSelf(head)) {
    end()
    return
  }
  snake.unshift(head)
  const eaten = head.x === food.x && head.y === food.y
  if (eaten) {
    score += 10
    scoreEl.textContent = score
    placeFood()
  } else {
    snake.pop()
  }
  draw()
}

function end() {
  ended = true
  stop()
  overlay.classList.remove('hidden')
}

function hitWall(h) {
  return h.x < 0 || h.y < 0 || h.x >= cols || h.y >= rows
}

function hitSelf(h) {
  for (let i = 0; i < snake.length; i++) {
    const s = snake[i]
    if (s.x === h.x && s.y === h.y) return true
  }
  return false
}

function drawCell(x, y, color) {
  const p = 2
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x * tile + p, y * tile + p, tile - p * 2, tile - p * 2, 6)
  ctx.fill()
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#0b1320'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 1
  for (let x = 0; x <= cols; x++) {
    ctx.beginPath()
    ctx.moveTo(x * tile, 0)
    ctx.lineTo(x * tile, canvas.height)
    ctx.stroke()
  }
  for (let y = 0; y <= rows; y++) {
    ctx.beginPath()
    ctx.moveTo(0, y * tile)
    ctx.lineTo(canvas.width, y * tile)
    ctx.stroke()
  }
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    const s = snake[i]
    const body = i === 0 ? '#5b9cf8' : '#3b82f6'
    drawCell(s.x, s.y, body)
  }
}

function drawFood() {
  const g = ctx.createRadialGradient(
    food.x * tile + tile / 2, food.y * tile + tile / 2, 2,
    food.x * tile + tile / 2, food.y * tile + tile / 2, tile / 2
  )
  g.addColorStop(0, '#39d353')
  g.addColorStop(1, '#1f8f3a')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(food.x * tile + tile / 2, food.y * tile + tile / 2, tile / 2 - 3, 0, Math.PI * 2)
  ctx.fill()
}

function draw() {
  drawGrid()
  drawFood()
  drawSnake()
  if (ended) drawEndText()
}

function drawEndText() {
  const t = 'Game Over'
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80)
  ctx.fillStyle = '#efefef'
  ctx.font = 'bold 28px Inter, system-ui'
  ctx.textAlign = 'center'
  ctx.fillText(t, canvas.width / 2, canvas.height / 2 + 10)
}

function handleKey(e) {
  if (e.key === 'ArrowUp' && dir.y !== 1) nextDir = { x: 0, y: -1 }
  else if (e.key === 'ArrowDown' && dir.y !== -1) nextDir = { x: 0, y: 1 }
  else if (e.key === 'ArrowLeft' && dir.x !== 1) nextDir = { x: -1, y: 0 }
  else if (e.key === 'ArrowRight' && dir.x !== -1) nextDir = { x: 1, y: 0 }
}

startBtn.addEventListener('click', () => {
  if (!running) start()
})
resetBtn.addEventListener('click', () => {
  reset()
})
overlayReset.addEventListener('click', () => {
  reset()
  start()
})
document.addEventListener('keydown', handleKey)

init()
