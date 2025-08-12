# Whisper 实时语音转文字应用

基于 OpenAI Whisper 的现代化语音转文字 Web 应用，支持实时录音、文件夹管理、智能编辑和 RAG 问答功能。

## 🚀 功能特性

### 核心功能
- **实时语音录制**：支持高质量音频录制和实时转录
- **文件上传支持**：支持多种音频格式上传转录
- **智能文件夹管理**：按项目分类整理转录内容
- **富文本编辑器**：支持转录内容的编辑和格式化
- **多格式导出**：支持导出为 TXT、Markdown、SRT 字幕等格式
- **RAG 智能问答**：基于转录内容的智能对话功能

### 技术亮点
- **高性能**：使用 faster-whisper 优化的 Whisper 模型
- **实时处理**：WebSocket 实时音频流处理
- **云存储**：Cloudflare R2 音频文件存储
- **向量搜索**：基于 pgvector 的语义搜索
- **缓存优化**：Redis 缓存提升响应速度

## 🛠 技术栈

### 前端
- **框架**：Next.js 15 + React 18 + TypeScript
- **样式**：Tailwind CSS + shadcn/ui 组件库
- **认证**：Clerk 用户认证和管理
- **状态管理**：SWR 数据获取和缓存

### 后端
- **API**：Next.js API Routes + FastAPI (Whisper 服务)
- **数据库**：Supabase (PostgreSQL + pgvector)
- **文件存储**：Cloudflare R2 对象存储
- **缓存**：Upstash Redis
- **AI 服务**：OpenAI (GPT-4 + Embeddings + Whisper)

### 基础设施
- **部署**：Vercel (前端) + 自托管 (Whisper API)
- **监控**：内置错误处理和日志系统
- **安全**：行级安全 (RLS) + API 密钥管理

## 📋 环境要求

- Node.js 18+ 
- Python 3.8+ (用于 Whisper API)
- PostgreSQL 14+ (带 pgvector 扩展)
- Redis (推荐使用 Upstash)

## 🚀 快速开始

### 1. 克隆项目

\`\`\`bash
git clone <repository-url>
cd whisper-app
\`\`\`

### 2. 安装依赖

\`\`\`bash
# 安装前端依赖
npm install

# 安装 Python 依赖 (Whisper API)
cd app
pip install -r requirements.txt
\`\`\`

### 3. 环境配置

复制 \`.env.local.example\` 到 \`.env.local\` 并填入配置：

\`\`\`bash
cp .env.local .env.local.example
\`\`\`

### 4. 数据库初始化

\`\`\`bash
# 在 Supabase 控制台运行 database-init.sql
# 或使用 psql 执行：
psql -f database-init.sql
\`\`\`

### 5. 启动服务

\`\`\`bash
# 启动 Whisper API 服务
cd app
uvicorn main:app --reload --port 8000

# 启动 Next.js 前端 (新终端)
npm run dev
\`\`\`

访问 http://localhost:3000 开始使用！

## 📁 项目结构

\`\`\`
whisper-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 认证页面
│   │   ├── dashboard/         # 主面板页面
│   │   ├── api/               # API 路由
│   │   └── globals.css        # 全局样式
│   ├── components/            # React 组件
│   │   ├── ui/               # UI 基础组件
│   │   ├── VoiceRecorder.tsx # 录音组件
│   │   └── FolderManager.tsx # 文件夹管理
│   ├── lib/                  # 工具库
│   │   ├── supabase.ts      # 数据库配置
│   │   ├── openai.ts        # AI 服务
│   │   ├── r2.ts            # 文件存储
│   │   └── redis.ts         # 缓存服务
│   └── types/               # TypeScript 类型定义
├── app/                     # Python Whisper API
│   ├── main.py             # FastAPI 应用
│   └── requirements.txt    # Python 依赖
├── database-init.sql       # 数据库初始化脚本
└── package.json           # Node.js 依赖配置
\`\`\`

## 🔧 配置说明

### 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| \`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY\` | Clerk 公钥 | ✅ |
| \`CLERK_SECRET_KEY\` | Clerk 私钥 | ✅ |
| \`NEXT_PUBLIC_SUPABASE_URL\` | Supabase 项目 URL | ✅ |
| \`SUPABASE_SERVICE_ROLE_KEY\` | Supabase 服务密钥 | ✅ |
| \`OPENAI_API_KEY\` | OpenAI API 密钥 | ✅ |
| \`R2_ACCOUNT_ID\` | Cloudflare R2 账户 ID | ✅ |
| \`R2_ACCESS_KEY_ID\` | R2 访问密钥 ID | ✅ |
| \`R2_SECRET_ACCESS_KEY\` | R2 私有密钥 | ✅ |
| \`UPSTASH_REDIS_REST_URL\` | Redis REST URL | ✅ |
| \`WHISPER_API_URL\` | Whisper API 地址 | ✅ |

### 服务配置

#### Clerk 认证
1. 访问 [Clerk Dashboard](https://dashboard.clerk.com/)
2. 创建新应用，选择适当的认证方式
3. 配置 Webhook 端点：\`/api/webhooks/clerk\`

#### Supabase 数据库
1. 创建新的 Supabase 项目
2. 在 SQL 编辑器中运行 \`database-init.sql\`
3. 启用行级安全 (RLS)

#### Cloudflare R2
1. 创建 R2 存储桶
2. 配置 CORS 策略允许应用域名
3. 生成 API 令牌

#### OpenAI API
1. 获取 OpenAI API 密钥
2. 确保账户有足够余额用于 GPT-4 和 Embeddings

## 🚀 部署指南

### Vercel 部署 (推荐)

1. **连接 GitHub 仓库**
   \`\`\`bash
   git push origin main
   \`\`\`

2. **在 Vercel 导入项目**
   - 选择 Next.js 框架预设
   - 配置环境变量
   - 设置构建命令：\`npm run build\`

3. **配置域名和 HTTPS**

### Docker 部署

\`\`\`bash
# 构建镜像
docker build -t whisper-app .

# 运行容器
docker run -p 3000:3000 --env-file .env.local whisper-app
\`\`\`

### Whisper API 部署

推荐使用 GPU 服务器部署以获得更好性能：

\`\`\`bash
# 使用 Docker
docker run -p 8000:8000 -v ./app:/app python:3.9-slim
cd /app && pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
\`\`\`

## 📊 性能优化

### 前端优化
- 使用 React.memo 优化组件渲染
- 实现虚拟滚动处理大量数据
- 音频文件懒加载和预加载
- SWR 缓存策略优化

### 后端优化
- Redis 缓存频繁查询
- 数据库查询优化和索引
- 音频处理异步队列
- CDN 加速静态资源

### 数据库优化
- pgvector 索引优化向量搜索
- 分区表处理大量转录数据
- 连接池优化并发性能

## 🔒 安全考虑

- **数据隔离**：行级安全确保用户数据隔离
- **API 安全**：请求速率限制和身份验证
- **文件安全**：上传文件类型和大小限制
- **传输安全**：HTTPS 加密和 CORS 配置

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [OpenAI Whisper](https://github.com/openai/whisper) - 语音识别模型
- [faster-whisper](https://github.com/guillaumekln/faster-whisper) - 优化的 Whisper 实现
- [Next.js](https://nextjs.org/) - React 全栈框架
- [Supabase](https://supabase.com/) - 开源后端即服务平台
- [Clerk](https://clerk.com/) - 现代认证解决方案

## 📞 支持

如果您遇到问题或有功能建议，请：

1. 查看 [常见问题](docs/FAQ.md)
2. 搜索现有 [Issues](issues)
3. 创建新的 Issue 描述您的问题

---

**使用愉快！** 🎉