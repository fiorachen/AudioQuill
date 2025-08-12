'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import VoiceRecorder from '@/components/VoiceRecorder'
import type { TranscriptionResult } from '@/types'
import { FileText, FolderOpen, MessageSquare, Plus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [latestTranscription, setLatestTranscription] = useState<TranscriptionResult | null>(null)
  const [showRecorder, setShowRecorder] = useState(false)

  const handleTranscriptionComplete = (result: TranscriptionResult) => {
    setLatestTranscription(result)
    // TODO: Save to database
    console.log('Transcription result:', result)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          欢迎使用 Whisper 语音转文字
        </h1>
        <p className="text-gray-600 mb-6">
          开始录音或上传音频文件来创建您的第一个转录记录
        </p>
        <Button 
          onClick={() => setShowRecorder(true)}
          size="lg"
          className="mb-8"
        >
          <Plus className="w-5 h-5 mr-2" />
          开始录音
        </Button>
      </div>

      {/* Voice Recorder */}
      {showRecorder && (
        <VoiceRecorder 
          onTranscriptionComplete={handleTranscriptionComplete}
          maxDuration={600}
          autoSave={true}
        />
      )}

      {/* Latest Transcription */}
      {latestTranscription && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">最新转录结果</CardTitle>
            <CardDescription>
              检测语言: {latestTranscription.language}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-gray-800 leading-relaxed">
                {latestTranscription.text}
              </p>
            </div>
            <div className="mt-4 flex space-x-2">
              <Button size="sm">保存到文件夹</Button>
              <Button variant="outline" size="sm">编辑</Button>
              <Button variant="outline" size="sm">导出</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">转录记录</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0 本月新增
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">文件夹</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0 本月新增
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI 对话</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              +0 本月新增
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/dashboard/folders">
            <CardHeader>
              <FolderOpen className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>管理文件夹</CardTitle>
              <CardDescription>
                创建和组织您的转录文件夹
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <Link href="/dashboard/transcriptions">
            <CardHeader>
              <FileText className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>查看转录记录</CardTitle>
              <CardDescription>
                浏览和编辑您的所有转录内容
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />
            <CardTitle>AI 智能问答</CardTitle>
            <CardDescription>
              基于转录内容进行智能对话
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>近期活动</CardTitle>
          <CardDescription>
            您最近的转录和文件夹活动
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无活动记录</p>
            <p className="text-sm">开始录音创建您的第一个转录记录</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}