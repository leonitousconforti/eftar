#!/bin/bash -i

set -eo pipefail
echo "🚀 Setting up r devcontainer..."

echo "📦 Installing repo dependencies..."
npm install -g corepack@latest
corepack install
corepack enable
pnpm install

echo "🏗️ Building..."
pnpm build

echo "🧪 Testing..."
pnpm test -- --run

echo "✅ Devcontainer setup complete!"
echo "🙏 Thank you for contributing to eftar!"
