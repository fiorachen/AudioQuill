#!/bin/bash

# Whisper App Setup Script
# This script helps you set up the development environment

set -e

echo "🚀 Setting up Whisper App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ Python $(python3 --version) detected"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Set up Python virtual environment for Whisper API
echo "🐍 Setting up Python environment for Whisper API..."
if [ ! -d "whisper-env" ]; then
    python3 -m venv whisper-env
fi

# Activate virtual environment and install Python dependencies
source whisper-env/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "📝 Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your actual configuration values:"
    echo "   - Clerk authentication keys"
    echo "   - Supabase database URL and keys"
    echo "   - OpenAI API key"
    echo "   - Cloudflare R2 credentials"
    echo "   - Upstash Redis credentials"
fi

echo "🗄️  Database setup reminder:"
echo "   1. Create a Supabase project"
echo "   2. Run the database-init.sql script in the SQL editor"
echo "   3. Update .env.local with your Supabase credentials"

echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Configure your environment variables in .env.local"
echo "2. Set up your database using database-init.sql"
echo "3. Start the Whisper API server:"
echo "   source whisper-env/bin/activate"
echo "   uvicorn app.main:app --reload --port 8000"
echo ""
echo "4. In a new terminal, start the Next.js development server:"
echo "   npm run dev"
echo ""
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed setup instructions, see README.md"