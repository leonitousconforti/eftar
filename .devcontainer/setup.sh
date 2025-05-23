#!/bin/bash -i

set -eo pipefail
echo "🚀 Setting up eftar devcontainer..."

echo "📦 Installing repo dependencies..."
npm install --global corepack@latest
corepack install
corepack enable
pnpm install
pnpm clean

echo "🏗️ Building..."
pnpm check
pnpm lint
pnpm circular
pnpm build
pnpm docgen

echo "🧪 Testing..."
(cd test/fixtures/ && sudo chown $USER:$USER ./content.txt && tar -cf BeeMovieScript.tar ./content.txt)
pnpm coverage --run

echo "✅ Devcontainer setup complete!"
echo "🙏 Thank you for contributing to eftar!"
