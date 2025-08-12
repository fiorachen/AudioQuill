# Claude Code Prompt: Whisper 实时语音转文字应用

## 项目概述
创建一个基于Whisper的实时语音转文字web应用，支持文件夹管理、转录编辑和RAG聊天功能。

## 技术栈
- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **认证**: Clerk
- **数据库**: Supabase (PostgreSQL + pgvector)
- **文件存储**: Cloudflare R2
- **AI服务**: OpenAI (Whisper + GPT-4 + Embeddings)
- **缓存**: Upstash Redis
- **部署**: Vercel

## 项目结构要求

```
whisper-app/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── dashboard/
│   │   ├── page.tsx                 # 主面板
│   │   ├── folders/
│   │   │   ├── page.tsx             # 文件夹列表
│   │   │   └── [id]/page.tsx        # 文件夹详情
│   │   ├── transcriptions/
│   │   │   ├── page.tsx             # 转录列表
│   │   │   └── [id]/page.tsx        # 转录详情
│   │   └── chat/
│   │       └── [folderId]/page.tsx  # RAG聊天界面
│   ├── api/
│   │   ├── transcribe/route.ts      # 音频转录API
│   │   ├── folders/route.ts         # 文件夹CRUD
│   │   ├── embeddings/route.ts      # 向量化处理
│   │   ├── chat/route.ts            # RAG聊天API
│   │   ├── upload/route.ts          # 文件上传到R2
│   │   └── webhooks/
│   │       └── clerk/route.ts       # Clerk webhooks
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                     # 登录页面
├── components/
│   ├── ui/                          # shadcn/ui组件
│   ├── VoiceRecorder.tsx           # 录音组件
│   ├── TranscriptionEditor.tsx      # 转录编辑器  
│   ├── FolderManager.tsx           # 文件夹管理
│   ├── ChatInterface.tsx           # 聊天界面
│   ├── FormatConverter.tsx         # 格式转换器
│   └── AudioWaveform.tsx           # 音频波形显示
├── lib/
│   ├── supabase.ts                 # Supabase配置
│   ├── r2.ts                       # Cloudflare R2配置
│   ├── redis.ts                    # Upstash Redis配置
│   ├── openai.ts                   # OpenAI配置
│   ├── embeddings.ts               # 向量化工具
│   └── utils.ts                    # 工具函数
├── types/
│   └── index.ts                    # TypeScript类型定义
├── middleware.ts                   # Clerk中间件
└── package.json
```

## 核心功能要求

### 1. 实时录音与转录
- [ ] 使用MediaRecorder API录制高质量音频
- [ ] 支持实时音频分段传输（每15-30秒一段）
- [ ] WebSocket连接实现实时转录结果显示
- [ ] 音频波形可视化显示
- [ ] 支持暂停/继续录制
- [ ] 自动检测静音并分段

### 2. 音频存储策略
- [ ] 录音文件自动上传到Cloudflare R2
- [ ] 生成预签名URL用于播放
- [ ] 设置文件生命周期（可选择保存时长）
- [ ] 支持音频文件下载
- [ ] 文件压缩优化存储成本

### 3. 数据库设计
```sql
-- 在初始化脚本中包含这些表结构

-- 用户扩展信息
CREATE TABLE user_profiles (
  clerk_user_id TEXT PRIMARY KEY,
  username TEXT,
  avatar_url TEXT,
  storage_used BIGINT DEFAULT 0,
  plan_type TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 文件夹表
CREATE TABLE folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 转录记录表
CREATE TABLE transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  original_text TEXT NOT NULL,
  edited_text TEXT,
  audio_url TEXT,
  audio_duration REAL,
  language TEXT DEFAULT 'zh',
  format_type TEXT DEFAULT 'plain',
  metadata JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 向量嵌入表（使用pgvector扩展）
CREATE TABLE transcription_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transcription_id UUID REFERENCES transcriptions(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding vector(1536),
  chunk_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 聊天历史表
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(clerk_user_id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_transcriptions_user_id ON transcriptions(user_id);
CREATE INDEX idx_transcriptions_folder_id ON transcriptions(folder_id);
CREATE INDEX idx_embeddings_transcription_id ON transcription_embeddings(transcription_id);
CREATE INDEX idx_chat_sessions_folder_id ON chat_sessions(folder_id);
```

### 4. 转录编辑功能
- [ ] 富文本编辑器（支持markdown）
- [ ] 实时保存编辑内容
- [ ] 支持添加时间戳标记
- [ ] 支持段落重新排序
- [ ] 撤销/重做功能
- [ ] 导出多种格式（TXT, MD, SRT, DOCX）

### 5. 文件夹管理系统
- [ ] 创建/编辑/删除文件夹
- [ ] 拖拽方式移动转录到文件夹
- [ ] 文件夹颜色标记
- [ ] 收藏夹功能
- [ ] 搜索和筛选功能
- [ ] 批量操作（移动、删除、导出）

### 6. RAG聊天功能
- [ ] 自动将转录文本向量化存储
- [ ] 基于文件夹的知识库构建
- [ ] 相似度搜索检索相关内容
- [ ] 上下文感知的对话功能
- [ ] 引用来源的回答
- [ ] 聊天历史保存

### 7. 格式转换器
- [ ] 纯文本 ↔ Markdown
- [ ] 会议纪要格式化
- [ ] 字幕文件生成(SRT/VTT)
- [ ] 自定义模板系统
- [ ] 批量格式转换

## 环境变量配置

```env
# Clerk认证
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEBHOOK_SECRET=
```

## 性能优化要求

### 前端优化
- [ ] 使用React.memo优化组件渲染
- [ ] 实现虚拟滚动处理大量转录记录
- [ ] 音频文件懒加载和预加载策略
- [ ] 使用SWR进行数据缓存和同步
- [ ] 图片和音频文件CDN优化

### 后端优化
- [ ] API响应缓存（Redis）
- [ ] 数据库查询优化和索引
- [ ] 音频处理异步队列
- [ ] 批量向量化处理
- [ ] Rate limiting防止滥用

## 用户体验要求

### 界面设计
- [ ] 响应式设计，支持移动端
- [ ] 深色/浅色主题切换
- [ ] 平滑的动画和过渡效果
- [ ] 无障碍访问支持
- [ ] 国际化支持（中英文）

### 交互体验
- [ ] 实时保存，防止数据丢失
- [ ] 离线模式支持（基础功能）
- [ ] 键盘快捷键支持
- [ ] 拖拽上传音频文件
- [ ] 进度指示和加载状态

## 安全要求
- [ ] API路由认证保护
- [ ] 文件上传类型和大小限制
- [ ] SQL注入防护
- [ ] XSS攻击防护
- [ ] 用户数据隔离
- [ ] 敏感信息加密存储

## 部署要求
- [ ] Docker容器化支持
- [ ] CI/CD pipeline配置
- [ ] 环境变量管理
- [ ] 健康检查端点
- [ ] 错误监控和日志系统
- [ ] 数据库迁移脚本

## 测试要求
- [ ] 单元测试覆盖核心功能
- [ ] API集成测试
- [ ] 端到端测试关键流程
- [ ] 音频处理功能测试
- [ ] 性能基准测试

## 监控和分析
- [ ] 用户行为分析
- [ ] API调用监控
- [ ] 错误追踪和报警
- [ ] 性能指标监控
- [ ] 成本分析和优化建议

## 第一阶段MVP功能（优先实现）
1. ✅ 用户认证和授权
2. ✅ 基础录音和转录功能
3. ✅ 转录结果显示和编辑
4. ✅ 简单的文件夹管理
5. ✅ 基础的文本格式转换

## 迭代计划
- **Phase 1**: 核心录音转录功能
- **Phase 2**: 文件夹管理和组织
- **Phase 3**: RAG聊天功能
- **Phase 4**: 高级编辑和格式化
- **Phase 5**: 性能优化和分析功能

请按照以上要求，使用现代化的开发实践，创建一个高质量、可扩展的语音转文字应用。重点关注代码质量、用户体验和系统性能。