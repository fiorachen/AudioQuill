import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Whisper 语音转文字',
  description: '基于 OpenAI Whisper 的实时语音转文字应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
          {children}
        </div>
      </body>
    </html>
  )
}