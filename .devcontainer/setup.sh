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
sudo useradd --uid 1001 aaaaahhhhh
sudo chown aaaaahhhhh:aaaaahhhhh test/fixtures/content.txt
sudo chmod 644 test/fixtures/content.txt
(cd test/fixtures && tar -cvf BeeMovieScript.tar ./content.txt)
pnpm test -- --run

echo "✅ Devcontainer setup complete!"
echo "🙏 Thank you for contributing to eftar!"
