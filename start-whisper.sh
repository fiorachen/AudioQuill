#!/bin/bash

echo "🎤 启动 Whisper API 服务..."

# 激活虚拟环境
source whisper-env/bin/activate

# 启动 FastAPI 服务
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0