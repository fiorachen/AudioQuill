#!/bin/bash

echo "🔍 Whisper App Status Check"
echo "========================="

# Check Whisper API
if curl -s http://localhost:8000/docs > /dev/null; then
    echo "✅ Whisper API: Running on http://localhost:8000"
    echo "   📄 API Docs: http://localhost:8000/docs"
else
    echo "❌ Whisper API: Not running"
fi

# Check Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: Running on http://localhost:3000"
else
    echo "❌ Frontend: Not running"
fi

# Check processes
echo ""
echo "📊 Running Processes:"
ps aux | grep -E "(uvicorn|next)" | grep -v grep | awk '{print "   " $2 " - " $11 " " $12 " " $13 " " $14}'

echo ""
echo "🌐 Access your application at: http://localhost:3000"