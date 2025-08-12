'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  FolderOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Star, 
  StarOff,
  Search,
  Grid,
  List
} from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { Folder } from '@/types'

interface FolderManagerProps {
  folders: Folder[]
  onCreateFolder: (folderData: { name: string; description?: string; color: string }) => Promise<void>
  onUpdateFolder: (id: string, updates: Partial<Folder>) => Promise<void>
  onDeleteFolder: (id: string) => Promise<void>
  onSelectFolder?: (folder: Folder) => void
  selectedFolderId?: string
  showCreateForm?: boolean
}

const FOLDER_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  '#6366F1', '#84CC16', '#06B6D4', '#D946EF'
]

export default function FolderManager({
  folders,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  onSelectFolder,
  selectedFolderId,
  showCreateForm = false
}: FolderManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showForm, setShowForm] = useState(showCreateForm)
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: FOLDER_COLORS[0]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (editingFolder) {
      setFormData({
        name: editingFolder.name,
        description: editingFolder.description || '',
        color: editingFolder.color
      })
      setShowForm(true)
    }
  }, [editingFolder])

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    folder.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const favoritesFolders = filteredFolders.filter(f => f.isFavorite)
  const regularFolders = filteredFolders.filter(f => !f.isFavorite)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      if (editingFolder) {
        await onUpdateFolder(editingFolder.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color
        })
      } else {
        await onCreateFolder({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color
        })
      }
      
      // Reset form
      setFormData({ name: '', description: '', color: FOLDER_COLORS[0] })
      setShowForm(false)
      setEditingFolder(null)
    } catch (error) {
      console.error('Error saving folder:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFavorite = async (folder: Folder) => {
    await onUpdateFolder(folder.id, { isFavorite: !folder.isFavorite })
  }

  const handleCancelEdit = () => {
    setShowForm(false)
    setEditingFolder(null)
    setFormData({ name: '', description: '', color: FOLDER_COLORS[0] })
  }

  const FolderCard = ({ folder }: { folder: Folder }) => (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        selectedFolderId === folder.id && "ring-2 ring-blue-500 shadow-md"
      )}
      onClick={() => onSelectFolder?.(folder)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: folder.color }}
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-medium truncate">
                {folder.name}
              </CardTitle>
              {folder.description && (
                <CardDescription className="mt-1 line-clamp-2">
                  {folder.description}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleToggleFavorite(folder)
              }}
            >
              {folder.isFavorite ? (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              ) : (
                <StarOff className="w-4 h-4 text-gray-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setEditingFolder(folder)
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm('确定要删除这个文件夹吗？')) {
                  onDeleteFolder(folder.id)
                }
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{folder.transcriptionCount || 0} 个转录</span>
          <span>{formatDate(folder.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )

  const FolderListItem = ({ folder }: { folder: Folder }) => (
    <div 
      className={cn(
        "flex items-center p-4 bg-white rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md",
        selectedFolderId === folder.id && "ring-2 ring-blue-500 shadow-md"
      )}
      onClick={() => onSelectFolder?.(folder)}
    >
      <div 
        className="w-4 h-4 rounded-full mr-4"
        style={{ backgroundColor: folder.color }}
      />
      <FolderOpen className="w-5 h-5 text-gray-400 mr-3" />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{folder.name}</h3>
        {folder.description && (
          <p className="text-sm text-gray-500 truncate">{folder.description}</p>
        )}
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <span>{folder.transcriptionCount || 0} 个转录</span>
        <span>{formatDate(folder.createdAt)}</span>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleToggleFavorite(folder)
            }}
          >
            {folder.isFavorite ? (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            ) : (
              <StarOff className="w-4 h-4 text-gray-400" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setEditingFolder(folder)
            }}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('确定要删除这个文件夹吗？')) {
                onDeleteFolder(folder.id)
              }
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">文件夹管理</h2>
          <p className="text-gray-600">管理您的转录文件夹</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          新建文件夹
        </Button>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="搜索文件夹..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex rounded-lg border">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="rounded-r-none"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-l-none"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingFolder ? '编辑文件夹' : '创建新文件夹'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  文件夹名称 *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="输入文件夹名称"
                  required
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  描述（可选）
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="输入文件夹描述"
                  maxLength={500}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  颜色
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOLDER_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        formData.color === color ? "border-gray-400 scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '保存中...' : (editingFolder ? '更新' : '创建')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancelEdit}
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Folders Display */}
      <div className="space-y-6">
        {/* Favorites */}
        {favoritesFolders.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2 fill-current" />
              收藏夹
            </h3>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoritesFolders.map(folder => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {favoritesFolders.map(folder => (
                  <FolderListItem key={folder.id} folder={folder} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Regular Folders */}
        {regularFolders.length > 0 && (
          <div>
            {favoritesFolders.length > 0 && (
              <h3 className="text-lg font-semibold mb-4">所有文件夹</h3>
            )}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularFolders.map(folder => (
                  <FolderCard key={folder.id} folder={folder} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {regularFolders.map(folder => (
                  <FolderListItem key={folder.id} folder={folder} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {filteredFolders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? '未找到匹配的文件夹' : '暂无文件夹'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery 
                  ? '尝试调整您的搜索条件' 
                  : '创建您的第一个文件夹来组织转录内容'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  创建文件夹
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}