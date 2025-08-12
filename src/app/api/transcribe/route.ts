import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { dbHelpers } from '@/lib/supabase'
import { CacheManager } from '@/lib/redis'
import R2Storage from '@/lib/r2'
import { generateUniqueId } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting check
    const rateLimitResult = await CacheManager.checkRateLimit(
      `transcribe:${userId}`,
      60000, // 1 minute window
      10 // 10 requests per minute
    )

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const formData = await req.formData()
    const audioFile = formData.get('file') as File
    const folderId = formData.get('folderId') as string | null
    const title = formData.get('title') as string || `录音 ${new Date().toLocaleString()}`

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Validate file size (max 25MB)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large (max 25MB)' }, { status: 400 })
    }

    // Validate file type
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an audio file.' }, { status: 400 })
    }

    // Convert File to Buffer for upload to R2
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    
    // Upload to R2 storage
    const { key: audioKey, url: audioUrl } = await R2Storage.uploadAudio(
      audioBuffer,
      audioFile.name,
      audioFile.type,
      userId
    )

    // Forward to existing Whisper API
    const whisperApiUrl = process.env.WHISPER_API_URL || 'http://localhost:8000'
    
    const whisperFormData = new FormData()
    whisperFormData.append('file', audioFile)

    const whisperResponse = await fetch(`${whisperApiUrl}/transcribe/`, {
      method: 'POST',
      body: whisperFormData,
    })

    if (!whisperResponse.ok) {
      // Clean up uploaded file if transcription fails
      await R2Storage.deleteAudio(audioKey)
      throw new Error(`Whisper API error: ${whisperResponse.statusText}`)
    }

    const transcriptionResult = await whisperResponse.json()

    // Save transcription to database
    const transcription = await dbHelpers.createTranscription(userId, {
      folderId,
      title,
      originalText: transcriptionResult.text,
      audioUrl,
      language: transcriptionResult.language,
      formatType: 'plain',
      metadata: {
        audioKey,
        originalFileName: audioFile.name,
        fileSize: audioFile.size,
        mimeType: audioFile.type,
        transcriptionTimestamp: new Date().toISOString(),
      },
    })

    // Cache the result
    await CacheManager.cacheTranscription(transcription.id, transcription, 3600)

    // TODO: Generate embeddings in background
    // This would typically be done in a background job
    // For now, we'll skip it to keep the response fast

    return NextResponse.json({
      success: true,
      data: {
        id: transcription.id,
        text: transcriptionResult.text,
        language: transcriptionResult.language,
        title: transcription.title,
        audioUrl: audioUrl,
        createdAt: transcription.created_at,
      },
    })

  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process transcription',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const folderId = searchParams.get('folderId')
    const search = searchParams.get('search')
    const isFavorite = searchParams.get('isFavorite') === 'true'

    const offset = (page - 1) * limit

    const transcriptions = await dbHelpers.getUserTranscriptions(userId, {
      folderId,
      search,
      isFavorite,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      data: transcriptions,
      pagination: {
        page,
        limit,
        total: transcriptions.length,
        hasMore: transcriptions.length === limit,
      },
    })

  } catch (error) {
    console.error('Get transcriptions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transcriptions' },
      { status: 500 }
    )
  }
}