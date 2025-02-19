#!/bin/bash -i

set -eo pipefail
echo "🚀 Setting up r devcontainer..."

echo "📦 Installing repo dependencies..."
npm install --global corepack@latest
corepack install
corepack enable
pnpm install

echo "🏗️ Building..."
pnpm check
pnpm lint
pnpm circular
pnpm build

echo "🧪 Testing..."
(cd test/fixtures/ && tar -cvf BeeMovieScript.tar ./content.txt)
pnpm test -- --run

echo "✅ Devcontainer setup complete!"
echo "🙏 Thank you for contributing to eftar!"
