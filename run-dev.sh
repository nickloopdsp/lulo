#!/bin/bash

# Set environment variables for local development
export NODE_ENV=development
export DATABASE_URL="sqlite:lulo.db"
export SESSION_SECRET="lulo-local-dev-secret-key"

# AI API Keys - Set these in your environment or .env file
export OPENAI_API_KEY="${OPENAI_API_KEY:-your_openai_api_key_here}"
export GOOGLE_VISION_API_KEY="${GOOGLE_VISION_API_KEY:-your_google_vision_api_key_here}"

# Optional Replit variables (empty for local dev)
export REPLIT_DOMAINS=""
export ISSUER_URL=""
export REPL_ID=""

# Set port
export PORT=3001

echo "Starting Lulo development server..."
echo "Environment: $NODE_ENV"
echo "Database: $DATABASE_URL"
echo "Port: $PORT"
echo ""

# Run the development server
npm run dev 