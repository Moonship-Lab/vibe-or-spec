"use client"

import { useEffect, useRef, useState } from "react"

const tile = 20
const width = 600
const height = 400
const speed = 120

type Pt = { x: number; y: number }

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(false)
  const [ended, setEnded] = useState(false)

  const snakeRef = useRef<Pt[]>([])
  const dirRef = useRef<Pt>({ x: 1, y: 0 })
  const nextRef = useRef<Pt>({ x: 1, y: 0 })
  const foodRef = useRef<Pt>({ x: 0, y: 0 })
  const loopRef = useRef<number | null>(null)
  const cols = Math.floor(width / tile)
  const rows = Math.floor(height / tile)

  function rnd(n: number) {
    return Math.floor(Math.random() * n)
  }
  function placeFood() {
    let x = rnd(cols), y = rnd(rows)
    while (snakeRef.current.some(s => s.x === x && s.y === y)) {
      x = rnd(cols); y = rnd(rows)
    }
    foodRef.current = { x, y }
  }
  function initGame() {
    snakeRef.current = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }]
    dirRef.current = { x: 1, y: 0 }
    nextRef.current = { x: 1, y: 0 }
    setScore(0)
    setEnded(false)
    placeFood()
    draw()
  }
  function start() {
    if (running) return
    setRunning(true)
    loopRef.current = window.setInterval(tick, speed)
  }
  function stop() {
    setRunning(false)
    if (loopRef.current) {
      window.clearInterval(loopRef.current)
      loopRef.current = null
    }
  }
  function reset() {
    stop()
    initGame()
  }
  function end() {
    setEnded(true)
    stop()
    draw() // ensure overlay drawn state
  }
  function hitWall(h: Pt) {
    return h.x < 0 || h.y < 0 || h.x >= cols || h.y >= rows
  }
  function hitSelf(h: Pt) {
    for (let i = 0; i < snakeRef.current.length; i++) {
      const s = snakeRef.current[i]
      if (s.x === h.x && s.y === h.y) return true
    }
    return false
  }
  function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    const p = 2
    ctx.fillStyle = color
    // @ts-expect-error roundRect exists in modern canvas
    ctx.roundRect(x * tile + p, y * tile + p, tile - p * 2, tile - p * 2, 6)
    ctx.fill()
  }
  function drawGrid(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = "#0b1320"
    ctx.fillRect(0, 0, width, height)
    ctx.strokeStyle = "rgba(255,255,255,0.05)"
    ctx.lineWidth = 1
    const colsCount = Math.floor(width / tile), rowsCount = Math.floor(height / tile)
    for (let x = 0; x <= colsCount; x++) {
      ctx.beginPath(); ctx.moveTo(x * tile, 0); ctx.lineTo(x * tile, height); ctx.stroke()
    }
    for (let y = 0; y <= rowsCount; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * tile); ctx.lineTo(width, y * tile); ctx.stroke()
    }
  }
  function drawFood(ctx: CanvasRenderingContext2D) {
    const f = foodRef.current
    const g = ctx.createRadialGradient(
      f.x * tile + tile / 2, f.y * tile + tile / 2, 2,
      f.x * tile + tile / 2, f.y * tile + tile / 2, tile / 2
    )
    g.addColorStop(0, "#39d353")
    g.addColorStop(1, "#1f8f3a")
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(f.x * tile + tile / 2, f.y * tile + tile / 2, tile / 2 - 3, 0, Math.PI * 2)
    ctx.fill()
  }
  function drawSnake(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < snakeRef.current.length; i++) {
      const s = snakeRef.current[i]
      const body = i === 0 ? "#5b9cf8" : "#3b82f6"
      drawCell(ctx, s.x, s.y, body)
    }
  }
  function drawEndText(ctx: CanvasRenderingContext2D) {
    const t = "Game Over"
    ctx.fillStyle = "rgba(0,0,0,0.45)"
    ctx.fillRect(0, height / 2 - 40, width, 80)
    ctx.fillStyle = "#efefef"
    ctx.font = "bold 28px Inter, system-ui"
    ctx.textAlign = "center"
    ctx.fillText(t, width / 2, height / 2 + 10)
  }
  function draw() {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    drawGrid(ctx)
    drawFood(ctx)
    drawSnake(ctx)
    if (ended) drawEndText(ctx)
  }
  function tick() {
    dirRef.current = nextRef.current
    const head = { x: snakeRef.current[0].x + dirRef.current.x, y: snakeRef.current[0].y + dirRef.current.y }
    if (hitWall(head) || hitSelf(head)) {
      end()
      return
    }
    snakeRef.current.unshift(head)
    const eaten = head.x === foodRef.current.x && head.y === foodRef.current.y
    if (eaten) {
      setScore(s => s + 10)
      placeFood()
    } else {
      snakeRef.current.pop()
    }
    draw()
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const d = dirRef.current
      if (e.key === "ArrowUp" && d.y !== 1) nextRef.current = { x: 0, y: -1 }
      else if (e.key === "ArrowDown" && d.y !== -1) nextRef.current = { x: 0, y: 1 }
      else if (e.key === "ArrowLeft" && d.x !== 1) nextRef.current = { x: -1, y: 0 }
      else if (e.key === "ArrowRight" && d.x !== -1) nextRef.current = { x: 1, y: 0 }
    }
    window.addEventListener("keydown", onKey)
    initGame()
    return () => {
      window.removeEventListener("keydown", onKey)
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="grid gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">贪吃蛇</h1>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => !running && start()}>开始</button>
          <button className="btn" onClick={() => reset()}>重新开始</button>
        </div>
      </header>
      <main className="card p-4 rounded-xl relative">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <span>分数</span>
          <strong className="text-slate-100 text-lg">{score}</strong>
        </div>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-auto rounded-xl outline outline-1 outline-white/10"
        />
      </main>
      <footer className="text-center text-slate-400 text-sm">
        方向键控制：↑ ↓ ← →
      </footer>
    </div>
  )
}
