export default function HomePage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎤 Whisper 语音转文字应用</h1>
      <p>欢迎使用基于 OpenAI Whisper 的语音转录应用！</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>🚀 服务状态</h2>
        <p>✅ 前端服务：运行在 http://localhost:3000</p>
        <p>✅ Whisper API：运行在 <a href="http://localhost:8000/docs" target="_blank">http://localhost:8000</a></p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>🔧 下一步</h2>
        <ol>
          <li>配置 Clerk 认证服务</li>
          <li>配置 Supabase 数据库</li>
          <li><a href="/dashboard">访问应用面板</a></li>
        </ol>
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>🎯 核心功能</h3>
        <ul>
          <li>实时语音录制和转录</li>
          <li>智能文件夹管理</li>
          <li>多格式导出</li>
          <li>AI 智能问答（RAG）</li>
        </ul>
      </div>
    </div>
  )
}