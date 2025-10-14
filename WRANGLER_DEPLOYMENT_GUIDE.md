# Hướng dẫn Deploy Create-Image-Studio lên Cloudflare Pages với Wrangler CLI

Hướng dẫn này sẽ chỉ bạn cách deploy dự án Create-Image-Studio lên Cloudflare Pages trực tiếp từ máy local sử dụng Wrangler CLI, thay vì sử dụng GitHub integration.

## 1. Cài đặt Wrangler CLI

### Cách 1: Cài đặt toàn cục (khuyến khích)
```bash
npm install -g wrangler
```

### Cách 2: Cài đặt cục bộ trong dự án
```bash
npm install --save-dev wrangler
# Hoặc
yarn add --dev wrangler
```

### Kiểm tra phiên bản Wrangler
```bash
wrangler --version
```

## 2. Đăng nhập vào Cloudflare Account

### Đăng nhập qua browser (khuyến khích)
```bash
wrangler login
```
Lệnh này sẽ mở trình duyệt để bạn đăng nhập vào tài khoản Cloudflare của mình.

### Đăng nhập với API Token
```bash
wrangler auth login
```
Bạn cần cung cấp API Token từ Cloudflare Dashboard.

### Kiểm tra đăng nhập
```bash
wrangler whoami
```

## 3. Tạo Project Pages mới hoặc liên kết với project hiện có

### Tạo project mới
```bash
wrangler pages project create create-image-studio
```

### Liên kết với project hiện có
```bash
wrangler pages project create create-image-studio --compatibility-date=2023-05-18
```

### Liệt kê các project hiện có
```bash
wrangler pages project list
```

## 4. Build và Deploy dự án

### Bước 1: Build dự án
```bash
npm run build
```

### Bước 2: Deploy lần đầu
```bash
wrangler pages deploy dist --project-name=create-image-studio
```

### Bước 3: Deploy các lần tiếp theo (production)
```bash
wrangler pages deploy dist --project-name=create-image-studio
```

### Deploy với custom domain
```bash
wrangler pages deploy dist --project-name=create-image-studio --commit-message="Update production"
```

### Deploy到预览环境
```bash
wrangler pages deploy dist --project-name=create-image-studio --preview
```

## 5. Cấu hình Environment Variables

### Cách 1: Qua Wrangler CLI
```bash
# Thêm biến môi trường cho production
wrangler pages secret put VITE_GEMINI_API_KEY

# Nhập giá trị của API key khi được nhắc
```

### Cách 2: Qua Cloudflare Dashboard
1. Truy cập [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Chọn project Pages của bạn
3. Vào tab "Settings" > "Environment variables"
4. Thêm biến môi trường:
   - **Variable name**: `VITE_GEMINI_API_KEY`
   - **Value**: API key của bạn
   - **Environment**: Production

### Xem danh sách biến môi trường
```bash
wrangler pages secret list
```

### Xóa biến môi trường
```bash
wrangler pages secret delete VITE_GEMINI_API_KEY
```

## 6. Kiểm tra kết quả deploy

### Xem lịch sử deploy
```bash
wrangler pages deployment list --project-name=create-image-studio
```

### Xem chi tiết một deployment cụ thể
```bash
wrangler pages deployment get <deployment-id> --project-name=create-image-studio
```

### Rollback về deployment trước đó
```bash
wrangler pages deployment rollback <deployment-id> --project-name=create-image-studio
```

## 7. Tạo file cấu hình Wrangler (wrangler.toml)

Tạo file `wrangler.toml` trong thư mục gốc của dự án:

```toml
name = "create-image-studio"
compatibility_date = "2023-05-18"

[env.production]
name = "create-image-studio"

[env.preview]
name = "create-image-studio-preview"
```

## 8. Script tự động hóa deploy

Tạo file `deploy.sh` trong thư mục gốc:

```bash
#!/bin/bash

# Deploy Script cho Create-Image-Studio
echo "Bắt đầu deploy Create-Image-Studio lên Cloudflare Pages..."

# Build dự án
echo "🔨 Building project..."
npm run build

# Kiểm tra xem build có thành công không
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting deployment."
    exit 1
fi

echo "✅ Build successful!"

# Deploy lên Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=create-image-studio --commit-message="Auto deploy $(date '+%Y-%m-%d %H:%M:%S')"

# Kiểm tra xem deploy có thành công không
if [ $? -eq 0 ]; then
    echo "✅ Deploy successful!"
    echo "🌐 Your site is now live at: https://create-image-studio.pages.dev"
else
    echo "❌ Deploy failed!"
    exit 1
fi
```

Cấp quyền thực thi cho script:
```bash
chmod +x deploy.sh
```

## 9. Deploy với Node.js Script

Tạo file `deploy.js`:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Bắt đầu deploy Create-Image-Studio...');

try {
    // Build dự án
    console.log('🔨 Building project...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // Kiểm tra thư mục dist có tồn tại không
    const distPath = path.join(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
        throw new Error('Thư mục dist không tồn tại sau khi build!');
    }
    
    console.log('✅ Build successful!');
    
    // Deploy lên Cloudflare Pages
    console.log('🌐 Deploying to Cloudflare Pages...');
    const deployCommand = 'wrangler pages deploy dist --project-name=create-image-studio';
    execSync(deployCommand, { stdio: 'inherit' });
    
    console.log('✅ Deploy successful!');
    console.log('🌐 Your site is now live at: https://create-image-studio.pages.dev');
    
} catch (error) {
    console.error('❌ Deploy failed:', error.message);
    process.exit(1);
}
```

Thêm script vào package.json:
```json
{
  "scripts": {
    "deploy": "node deploy.js",
    "deploy:sh": "./deploy.sh"
  }
}
```

## 10. Các lệnh hữu ích khác

### Xem logs
```bash
wrangler pages deployment tail --project-name=create-image-studio
```

### Xem thống kê
```bash
wrangler pages deployment list --project-name=create-image-studio --format=json
```

### Xóa project
```bash
wrangler pages project delete create-image-studio
```

## Lưu ý quan trọng

1. **Environment Variables**: Đảm bảo tất cả biến môi trường cần thiết đã được cấu hình đúng trên Cloudflare Pages.
2. **Build Output**: Thư mục build mặc định là `dist` cho Vite.
3. **Compatibility Date**: Sử dụng `2023-05-18` hoặc mới hơn để đảm bảo tính tương thích.
4. **API Key**: API key sẽ được lưu trữ an toàn trên Cloudflare và không bị lộ trong client-side code.
5. **Custom Domain**: Nếu bạn sử dụng custom domain, cần cấu hình DNS trong Cloudflare Dashboard.

## Gỡ lỗi thường gặp

### Lỗi "No such file or directory: dist"
```bash
# Đảm bảo chạy lệnh build trước khi deploy
npm run build
```

### Lỗi Authentication
```bash
# Đăng nhập lại
wrangler logout
wrangler login
```

### Lỗi Environment Variables
```bash
# Kiểm tra biến môi trường
wrangler pages secret list
```

### Lỗi Build
```bash
# Kiểm tra logs chi tiết
wrangler pages deploy dist --project-name=create-image-studio --verbose
```

## Tài liệu tham khảo

- [Wrangler CLI Documentation](https://developers.cloudflare.com/pages/wrangler-cli/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Environment Variables](https://developers.cloudflare.com/pages/platform/environment-variables/)