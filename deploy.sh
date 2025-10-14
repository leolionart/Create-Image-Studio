#!/bin/bash

# Deploy Script cho Create-Image-Studio
echo "🚀 Bắt đầu deploy Create-Image-Studio lên Cloudflare Pages..."

# Kiểm tra xem wrangler đã được cài đặt chưa
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI chưa được cài đặt. Vui lòng cài đặt với: npm install -g wrangler"
    exit 1
fi

# Kiểm tra xem đã đăng nhập chưa
if ! wrangler whoami &> /dev/null; then
    echo "❌ Bạn chưa đăng nhập vào Cloudflare. Vui lòng chạy: wrangler login"
    exit 1
fi

# Build dự án
echo "🔨 Building project..."
npm run build

# Kiểm tra xem build có thành công không
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting deployment."
    exit 1
fi

echo "✅ Build successful!"

# Kiểm tra xem thư mục dist có tồn tại không
if [ ! -d "dist" ]; then
    echo "❌ Thư mục dist không tồn tại sau khi build!"
    exit 1
fi

# Deploy lên Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=create-image-studio --commit-message="Auto deploy $(date '+%Y-%m-%d %H:%M:%S')"

# Kiểm tra xem deploy có thành công không
if [ $? -eq 0 ]; then
    echo "✅ Deploy successful!"
    echo "🌐 Your site is now live at: https://create-image-studio.pages.dev"
    echo ""
    echo "📊 Xem lịch sử deploy:"
    echo "wrangler pages deployment list --project-name=create-image-studio"
else
    echo "❌ Deploy failed!"
    exit 1
fi