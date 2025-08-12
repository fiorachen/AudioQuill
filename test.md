# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Whisper API service built with FastAPI that provides audio transcription capabilities using OpenAI's Whisper model via the faster-whisper library. The service accepts audio files and returns transcribed text.

## Architecture

- **Framework**: FastAPI web framework
- **AI Model**: faster-whisper (optimized Whisper implementation)
- **Model Size**: Uses "base" model with int8 quantization for performance
- **Concurrency**: ThreadPoolExecutor for non-blocking transcription
- **File Handling**: Async file operations with temporary file cleanup
- **Environment**: Python virtual environment in `whisper-env/`

## Development Commands

### Environment Setup
```bash
# Activate virtual environment
source whisper-env/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Running the Application
```bash
# Start the FastAPI server (development)
uvicorn app.main:app --reload

# Start with custom host/port
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### API Usage
- **Endpoint**: `POST /transcribe/`
- **Input**: Audio file upload (various formats supported)
- **Output**: JSON with detected language and transcribed text

## Code Structure

- `app/main.py`: Main FastAPI application with single transcription endpoint
- `requirements.txt`: Python dependencies including FastAPI, faster-whisper, aiofiles
- `whisper-env/`: Python virtual environment (excluded from version control)

## Key Implementation Details

- Uses async file handling to prevent blocking during uploads
- Transcription runs in background thread pool to avoid blocking main thread
- Automatic temporary file cleanup after processing
- Configurable Whisper model size and compute type
- Comprehensive error handling and logging
- Graceful shutdown with resource cleanup