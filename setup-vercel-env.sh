#!/bin/bash

echo "🚀 Setting up Vercel environment variables..."

# Non-sensitive variables (already set)
echo "✅ NEXT_PUBLIC_SUPABASE_URL - already set"
echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY - already set"

# Add remaining non-sensitive variables
echo "📦 Adding application configuration..."
echo "https://whisper-mxf2zccng-fioras-projects-30b35c3a.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production

echo "https://close-boa-46307.upstash.io" | vercel env add UPSTASH_REDIS_REST_URL production

echo "recoridng" | vercel env add R2_BUCKET_NAME production

echo ""
echo "🔑 You need to manually add these sensitive environment variables:"
echo "Run these commands and provide the values when prompted:"
echo ""
echo "vercel env add SUPABASE_SERVICE_ROLE_KEY production"
echo "vercel env add CLERK_SECRET_KEY production" 
echo "vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production"
echo "vercel env add OPENAI_API_KEY production"
echo "vercel env add R2_ACCESS_KEY_ID production"
echo "vercel env add R2_SECRET_ACCESS_KEY production"
echo "vercel env add R2_ACCOUNT_ID production"
echo "vercel env add UPSTASH_REDIS_REST_TOKEN production"
echo "vercel env add WEBHOOK_SECRET production"
echo ""
echo "📝 Values can be found in your .env.local file"