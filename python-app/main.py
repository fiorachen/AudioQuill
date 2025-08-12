# app/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from faster_whisper import WhisperModel
import aiofiles
import os
import asyncio
import tempfile
import uuid
from concurrent.futures import ThreadPoolExecutor
import logging

app = FastAPI()

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载模型（small 模型，可换 tiny / base / medium / large）
model = WhisperModel("base", compute_type="int8")  # int8可加速
logger.info("Whisper model loaded successfully")

# 创建线程池用于后台转录
executor = ThreadPoolExecutor(max_workers=2)

def transcribe_sync(audio_path: str):
    """同步转录函数，在后台线程中运行"""
    try:
        segments, info = model.transcribe(audio_path)
        result_text = ""
        for segment in segments:
            result_text += segment.text + " "
        return {
            "language": info.language,
            "text": result_text.strip()
        }
    except Exception as e:
        logger.error(f"Transcription error: {e}")
        raise e

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # 生成唯一临时文件名
    temp_audio_path = None
    try:
        # 创建临时文件
        file_extension = os.path.splitext(file.filename)[1] or ".wav"
        temp_audio_path = os.path.join(tempfile.gettempdir(), f"whisper_{uuid.uuid4()}{file_extension}")
        
        # 使用 aiofiles 异步写入文件
        async with aiofiles.open(temp_audio_path, "wb") as buffer:
            content = await file.read()
            await buffer.write(content)
        
        logger.info(f"File saved to {temp_audio_path}")
        
        # 在后台线程中进行语音识别，避免阻塞主线程
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(executor, transcribe_sync, temp_audio_path)
        
        logger.info("Transcription completed successfully")
        return result
        
    except Exception as e:
        logger.error(f"Error processing audio file: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing audio file: {str(e)}")
    finally:
        # 清理临时文件
        if temp_audio_path and os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
                logger.info(f"Temporary file {temp_audio_path} cleaned up")
            except Exception as e:
                logger.warning(f"Failed to clean up temporary file {temp_audio_path}: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭时清理资源"""
    executor.shutdown(wait=True)
    logger.info("Application shutdown completed")
