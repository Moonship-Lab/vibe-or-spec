export const metadata = {
  title: "贪吃蛇",
  description: "简洁好看的 Canvas 贪吃蛇游戏",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-dvh text-slate-200">
        <div className="max-w-5xl mx-auto p-6 grid gap-4">
          {children}
        </div>
      </body>
    </html>
  )
}
