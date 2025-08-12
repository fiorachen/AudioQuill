export interface UserProfile {
  clerkUserId: string
  username?: string
  avatarUrl?: string
  storageUsed: number
  planType: 'free' | 'pro' | 'enterprise'
  createdAt: string
}

export interface Folder {
  id: string
  userId: string
  name: string
  description?: string
  color: string
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  transcriptionCount?: number
}

export interface Transcription {
  id: string
  userId: string
  folderId?: string
  title: string
  originalText: string
  editedText?: string
  audioUrl?: string
  audioDuration?: number
  language: string
  formatType: 'plain' | 'markdown' | 'meeting' | 'subtitle'
  metadata: Record<string, any>
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  folder?: Folder
}

export interface TranscriptionEmbedding {
  id: string
  transcriptionId: string
  chunkText: string
  embedding: number[]
  chunkIndex: number
  createdAt: string
}

export interface ChatSession {
  id: string
  userId: string
  folderId: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: TranscriptionSource[]
}

export interface TranscriptionSource {
  transcriptionId: string
  title: string
  excerpt: string
  similarity: number
}

export interface AudioRecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob?: Blob
  audioUrl?: string
}

export interface VoiceRecorderProps {
  onTranscriptionComplete: (result: TranscriptionResult) => void
  onRecordingStateChange?: (state: AudioRecordingState) => void
  maxDuration?: number
  autoSave?: boolean
  folderId?: string
}

export interface TranscriptionResult {
  language: string
  text: string
  confidence?: number
  segments?: TranscriptionSegment[]
}

export interface TranscriptionSegment {
  start: number
  end: number
  text: string
  confidence?: number
}

export interface FormatTemplate {
  id: string
  name: string
  description: string
  template: string
  variables: string[]
}

export interface ExportOptions {
  format: 'txt' | 'md' | 'docx' | 'srt' | 'vtt' | 'json'
  includeTimestamps: boolean
  includeMetadata: boolean
  customTemplate?: string
}

export interface SearchFilters {
  query?: string
  folderId?: string
  language?: string
  dateRange?: {
    start: Date
    end: Date
  }
  isFavorite?: boolean
  formatType?: string
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}