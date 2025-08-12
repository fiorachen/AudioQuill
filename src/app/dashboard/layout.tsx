// import { auth } from '@clerk/nextjs/server' // Temporarily disabled
// import { UserButton } from '@clerk/nextjs' // Temporarily disabled
// import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  FolderOpen, 
  FileText, 
  MessageSquare, 
  Home,
  Settings,
  Search
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporarily disabled authentication
  // const { userId } = await auth()
  // if (!userId) {
  //   redirect('/sign-in')
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Whisper App
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <Home className="w-4 h-4 inline mr-2" />
                  主页
                </Link>
                <Link 
                  href="/dashboard/folders" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FolderOpen className="w-4 h-4 inline mr-2" />
                  文件夹
                </Link>
                <Link 
                  href="/dashboard/transcriptions" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  转录记录
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索转录内容..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                设置
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar for mobile */}
      <div className="md:hidden">
        <div className="bg-white shadow-sm">
          <div className="px-4 py-2">
            <nav className="flex space-x-4 overflow-x-auto">
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
              >
                <Home className="w-4 h-4 inline mr-2" />
                主页
              </Link>
              <Link 
                href="/dashboard/folders" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
              >
                <FolderOpen className="w-4 h-4 inline mr-2" />
                文件夹
              </Link>
              <Link 
                href="/dashboard/transcriptions" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap"
              >
                <FileText className="w-4 h-4 inline mr-2" />
                转录记录
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}