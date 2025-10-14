# Hướng dẫn Deploy Create Image Studio (Cập nhật sau khi fix lỗi Wrangler)

## Mục lục
1. [Giới thiệu về dự án](#1-giới-thiệu-về-dự-án)
2. [Nguyên nhân lỗi deployment trước đây](#2-nguyên-nhân-lỗi-deployment-trước-đây)
3. [Cấu hình đã được cập nhật trong wrangler.toml](#3-cấu-hình-đã-được-cập-nhật-trong-wranglertoml)
4. [Hướng dẫn deploy cho Production](#4-hướng-dẫn-deploy-cho-production)
5. [Hướng dẫn deploy cho Preview](#5-hướng-dẫn-deploy-cho-preview)
6. [So sánh giữa các phương án deploy](#6-so-sánh-giữa-các-phương-án-deploy)
7. [Kiểm tra và xác minh deployment](#7-kiểm-tra-và-xác-minh-deployment)
8. [Các lỗi thường gặp và cách khắc phục](#8-các-lỗi-thường-gặp-và-cách-khắc-phục)

---

## 1. Giới thiệu về dự án

Create Image Studio là một ứng dụng **React Single Page Application (SPA)** được xây dựng với:
- **Framework**: React 19.2.0 với TypeScript
- **Build Tool**: Vite 6.2.0
- **API**: Google Gemini AI API để tạo ảnh
- **Platform**: Cloudflare Pages
- **Deployment Tool**: Wrangler CLI v4.43.0

### Đặc điểm quan trọng của dự án:
- Là ứng dụng client-side rendering (CSR)
- Sử dụng environment variables với prefix `VITE_`
- Cần xử lý routing cho SPA với file `_redirects`
- Build output được tạo trong thư mục `dist`

---

## 2. Nguyên nhân lỗi deployment trước đây

### Vấn đề chính:
1. **Sai lệnh deploy**: Sử dụng lệnh `wrangler deploy` thay vì `wrangler pages deploy`
   - `wrangler deploy` dùng cho Cloudflare Workers
   - `wrangler pages deploy` mới là lệnh đúng cho Cloudflare Pages

2. **Cấu hình wrangler.toml không phù hợp**:
   - Thiếu các section cần thiết cho Pages deployment
   - Không cấu hình đúng build và assets directory

3. **Environment variables không được xử lý đúng**:
   - API key không được truyền đúng cách qua environment variables
   - Thiếu cấu hình cho việc xử lý biến môi trường trên Cloudflare Pages

4. **Routing cho SPA không được cấu hình**:
   - File `_redirects` cần thiết để xử lý routing cho React SPA

### Hậu quả:
- Build thành công nhưng deployment thất bại
- Lỗi "No such file or directory" khi deploy
- Application không hoạt động đúng sau khi deploy

---

## 3. Cấu hình đã được cập nhật trong wrangler.toml

File `wrangler.toml` hiện tại đã được cấu hình lại như sau:

```toml
name = "create-image-studio"
compatibility_date = "2023-05-18"

# Production environment
[env.production]
name = "create-image-studio"

# Preview environment
[env.preview]
name = "create-image-studio-preview"

# Custom build configuration
[build]
command = "npm run build"
cwd = "."
watch_dir = "src/"

# Pages configuration
[pages]
project_name = "create-image-studio"

# Assets configuration
[assets]
directory = "./dist"
```

### Các thay đổi quan trọng:
1. **Thêm section [build]**: Cấu hình lệnh build và thư mục làm việc
2. **Thêm section [pages]**: Cấu hình tên project cho Cloudflare Pages
3. **Thêm section [assets]**: Chỉ định thư mục chứa assets sau build
4. **Cấu hình môi trường**: Phân biệt giữa production và preview

---

## 4. Hướng dẫn deploy cho Production

### Bước 1: Chuẩn bị môi trường

1. **Cài đặt Wrangler CLI** (nếu chưa cài):
```bash
npm install -g wrangler
```

2. **Đăng nhập vào Cloudflare**:
```bash
wrangler login
```

3. **Kiểm tra đăng nhập**:
```bash
wrangler whoami
```

### Bước 2: Cấu hình Environment Variables

1. **Đặt API key cho production**:
```bash
wrangler pages secret put VITE_GEMINI_API_KEY
```

2. **Nhập API key của bạn khi được nhắc**

### Bước 3: Build và Deploy

1. **Build dự án**:
```bash
npm run build
```

2. **Deploy lên production** (sử dụng lệnh đúng):
```bash
wrangler pages deploy dist --project-name=create-image-studio
```

3. **Hoặc sử dụng script đã được cấu hình**:
```bash
npm run deploy:prod
```

### Bước 4: Xác minh deployment

1. **Kiểm tra deployment history**:
```bash
wrangler pages deployment list --project-name=create-image-studio
```

2. **Truy cập ứng dụng** tại: `https://create-image-studio.pages.dev`

---

## 5. Hướng dẫn deploy cho Preview

### Bước 1: Chuẩn bị

Sử dụng lại môi trường đã chuẩn bị ở phần Production

### Bước 2: Deploy lên Preview

1. **Deploy với flag --preview**:
```bash
wrangler pages deploy dist --project-name=create-image-studio --preview
```

2. **Hoặc sử dụng script đã được cấu hình**:
```bash
npm run deploy:preview
```

### Bước 3: Xác minh

1. **Lấy URL preview** từ output của lệnh deploy
2. **Kiểm tra functionality** trên môi trường preview

---

## 6. So sánh giữa các phương án deploy

### Phương án 1: Wrangler CLI (Khuyến khích)

**Ưu điểm:**
- Kontrol đầy đủ quá trình deploy
- Nhanh chóng, không cần qua GitHub
- Dễ dàng tạo preview environments
- Scriptable và có thể tự động hóa

**Nhược điểm:**
- Cần cài đặt Wrangler CLI
- Phải quản lý authentication local

**Lệnh:** `wrangler pages deploy dist --project-name=create-image-studio`

### Phương án 2: GitHub Integration

**Ưu điểm:**
- Tự động deploy khi push code
- Quản lý centralized qua Cloudflare Dashboard
- History tracking tốt hơn
- Không cần cài đặt local tools

**Nhược điểm:**
- Phải push code trước khi deploy
- Kém linh hoạt hơn cho preview deployments
- Phụ thuộc vào GitHub actions

### Phương án 3: Script tự động

**Ưu điểm:**
- Tự động hóa hoàn toàn
- Có thể thêm logic tùy chỉnh
- Dễ dàng tích hợp vào CI/CD

**Nhược điểm:**
- Cần维护 script
- Phải xử lý errors manually

**Sử dụng:** `npm run deploy` hoặc `npm run deploy:sh`

---

## 7. Kiểm tra và xác minh deployment

### Kiểm tra cơ bản:

1. **Kiểm tra URL**:
   - Production: `https://create-image-studio.pages.dev`
   - Preview: URL được cung cấp sau khi deploy preview

2. **Kiểm tra functionality**:
   - Navigation giữa các trang
   - Upload ảnh
   - Tạo ảnh với Gemini API
   - Responsive design

3. **Kiểm tra browser console**:
   - Không có JavaScript errors
   - API calls thành công
   - Network requests không bị block

### Kiểm tra với Wrangler CLI:

1. **Xem deployment history**:
```bash
wrangler pages deployment list --project-name=create-image-studio
```

2. **Xem chi tiết deployment**:
```bash
wrangler pages deployment get <deployment-id> --project-name=create-image-studio
```

3. **Xem logs (nếu có)**:
```bash
wrangler pages deployment tail --project-name=create-image-studio
```

### Kiểm tra Environment Variables:

1. **Kiểm tra danh sách variables**:
```bash
wrangler pages secret list
```

2. **Kiểm tra API key trong browser**:
   - Mở Developer Tools
   - Kiểm tra console.log hoặc network tab
   - Xác nhận API key được truyền đúng

---

## 8. Các lỗi thường gặp và cách khắc phục

### Lỗi 1: "No such file or directory: dist"

**Nguyên nhân:** Chưa build dự án trước khi deploy

**Khắc phục:**
```bash
npm run build
wrangler pages deploy dist --project-name=create-image-studio
```

### Lỗi 2: "Authentication failed"

**Nguyên nhân:** Chưa đăng nhập hoặc token hết hạn

**Khắc phục:**
```bash
wrangler logout
wrangler login
```

### Lỗi 3: Environment variables không hoạt động

**Nguyên nhân:** API key không được đặt đúng trên Cloudflare

**Khắc phục:**
```bash
# Đặt lại API key
wrangler pages secret put VITE_GEMINI_API_KEY

# Hoặc kiểm tra qua dashboard
wrangler pages secret list
```

### Lỗi 4: Build failed

**Nguyên nhân:** Lỗi trong code hoặc dependencies

**Khắc phục:**
```bash
# Kiểm tra logs chi tiết
npm run build

# Hoặc clean và rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Lỗi 5: SPA routing không hoạt động

**Nguyên nhân:** File `_redirects` không được deploy đúng

**Khắc phục:**
1. Kiểm tra file `public/_redirects` tồn tại
2. Nội dung file nên là:
```
/*    /index.html   200
```
3. Build lại và deploy lại

### Lỗi 6: API calls failed

**Nguyên nhân:** API key không đúng hoặc bị restricted

**Khắc phục:**
1. Kiểm tra API key có hợp lệ không
2. Kiểm tra restrictions trên Google AI Studio
3. Đảm bảo API key được đặt đúng trên Cloudflare

### Lỗi 7: Deploy slow hoặc timeout

**Nguyên nhân:** File quá lớn hoặc network issues

**Khắc phục:**
1. Kiểm tra kích thước thư mục `dist`
2. Sử dụng `--compatibility-date` mới hơn
3. Thử lại với kết nối mạng tốt hơn

---

## Best Practices

1. **Luôn build locally trước khi deploy** để catch errors sớm
2. **Sử dụng preview environment** để test trước khi production
3. **Giữ API key an toàn** - không bao giờ commit vào repository
4. **Monitor deployment history** để track changes
5. **Sử dụng script tự động** để giảm human errors
6. **Kiểm tra responsive design** trên multiple devices
7. **Test API functionality** thoroughly sau mỗi deploy

---

## Script tự động hoàn chỉnh

Để sử dụng, tạo file `deploy.sh` với nội dung:

```bash
#!/bin/bash

# Deploy Script cho Create-Image-Studio
set -e  # Exit on any error

echo "🚀 Bắt đầu deploy Create-Image-Studio..."

# Check if user is logged in
if ! wrangler whoami > /dev/null 2>&1; then
    echo "🔐 Bạn chưa đăng nhập vào Cloudflare. Đang mở browser..."
    wrangler login
fi

# Build dự án
echo "🔨 Building project..."
npm run build

# Deploy lên Production (default) hoặc Preview nếu có flag --preview
if [[ "$1" == "--preview" ]]; then
    echo "🌐 Deploying to Preview environment..."
    wrangler pages deploy dist --project-name=create-image-studio --preview
    echo "✅ Preview deploy successful!"
else
    echo "🌐 Deploying to Production environment..."
    wrangler pages deploy dist --project-name=create-image-studio
    echo "✅ Production deploy successful!"
    echo "🌐 Your site is now live at: https://create-image-studio.pages.dev"
fi
```

Cấp quyền thực thi:
```bash
chmod +x deploy.sh
```

Sử dụng:
```bash
# Deploy production
./deploy.sh

# Deploy preview
./deploy.sh --preview