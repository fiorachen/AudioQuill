import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { dbHelpers } from '@/lib/supabase'
import { CacheManager } from '@/lib/redis'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Try to get from cache first
    const cachedFolders = await CacheManager.getCachedUserFolders(userId)
    if (cachedFolders.length > 0) {
      return NextResponse.json({
        success: true,
        data: cachedFolders,
        cached: true,
      })
    }

    const folders = await dbHelpers.getUserFolders(userId)

    // Cache the result
    await CacheManager.cacheUserFolders(userId, folders)

    return NextResponse.json({
      success: true,
      data: folders,
    })

  } catch (error) {
    console.error('Get folders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, color } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'Folder name too long (max 100 characters)' }, { status: 400 })
    }

    const folder = await dbHelpers.createFolder(userId, {
      name: name.trim(),
      description: description?.trim(),
      color: color || '#3B82F6',
    })

    // Invalidate cache
    await CacheManager.invalidateUserCache(userId)

    return NextResponse.json({
      success: true,
      data: folder,
    })

  } catch (error) {
    console.error('Create folder error:', error)
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'A folder with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { id, name, description, color, isFavorite } = body

    if (!id) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 })
    }

    if (name && (name.trim().length === 0 || name.length > 100)) {
      return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 })
    }

    const { data: folder, error } = await dbHelpers.supabase
      .from('folders')
      .update({
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(color && { color }),
        ...(isFavorite !== undefined && { is_favorite: isFavorite }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Invalidate cache
    await CacheManager.invalidateUserCache(userId)

    return NextResponse.json({
      success: true,
      data: folder,
    })

  } catch (error) {
    console.error('Update folder error:', error)
    return NextResponse.json(
      { error: 'Failed to update folder' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const folderId = searchParams.get('id')

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 })
    }

    // Check if folder belongs to user and exists
    const { data: folder, error: fetchError } = await dbHelpers.supabase
      .from('folders')
      .select('id')
      .eq('id', folderId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Delete the folder (transcriptions will be set to null due to foreign key constraint)
    const { error: deleteError } = await dbHelpers.supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', userId)

    if (deleteError) {
      throw deleteError
    }

    // Invalidate cache
    await CacheManager.invalidateUserCache(userId)

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully',
    })

  } catch (error) {
    console.error('Delete folder error:', error)
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    )
  }
}