#!/bin/bash

# PrivateDiploma - Setup Script
# Run: bash setup.sh

echo "🚀 Setting up PrivateDiploma..."
echo ""

# Check Node.js
echo "✓ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. Please install Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "  Found: $NODE_VERSION"
echo ""

# Check npm
echo "✓ Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "✗ npm not found. Please install Node.js"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "  Found: $NPM_VERSION"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "✗ Failed to install dependencies"
    exit 1
fi
echo ""

# Summary
echo "===========================================" 
echo "✓ Setup Complete!"
echo "==========================================="
echo ""
echo "Next steps:"
echo "  1. Start development server:"
echo "     npm run dev"
echo ""
echo "  2. Open in browser:"
echo "     http://localhost:3000"
echo ""
echo "  3. Choose a role:"
echo "     - 🎓 University: Issue diplomas"
echo "     - 👨‍🎓 Student: Manage credentials"  
echo "     - 🏢 Employer: Verify credentials"
echo ""
echo "✓ Happy Building! 🚀"
echo ""
