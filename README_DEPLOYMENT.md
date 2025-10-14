# Triển khai Create Image Studio lên Cloudflare Pages

## Hướng dẫn triển khai

### 1. Chuẩn bị
- Đã có tài khoản Cloudflare
- Source code của dự án đã được push lên GitHub repository

### 2. Cấu hình Environment Variables
1. Tạo file `.env.local` trong thư mục gốc của dự án:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

2. Lấy API key tại: https://makersuite.google.com/app/apikey

### 3. Triển khai lên Cloudflare Pages

#### Cách 1: Qua Dashboard
1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Chọn "Pages" từ menu bên trái
3. Nhấn "Create a project"
4. Kết nối với GitHub repository của bạn
5. Cấu hình build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Trong phần "Environment variables", thêm:
   - **Variable name**: `VITE_GEMINI_API_KEY`
   - **Value**: API key của bạn
7. Nhấn "Save and Deploy"

#### Cách 2: Qua Wrangler CLI (Khuyến khích)

Để có hướng dẫn chi tiết và đầy đủ hơn, xem file [WRANGLER_DEPLOYMENT_GUIDE.md](./WRANGLER_DEPLOYMENT_GUIDE.md)

**Cài đặt và cấu hình nhanh:**
```bash
# Cài đặt Wrangler CLI
npm install -g wrangler

# Đăng nhập vào Cloudflare
wrangler login

# Tạo project (chỉ lần đầu)
wrangler pages project create create-image-studio

# Triển khai dự án
npm run build
wrangler pages deploy dist --project-name=create-image-studio
```

**Sử dụng script tự động:**
```bash
# Cấp quyền thực thi cho script
chmod +x deploy.sh

# Deploy với shell script
npm run deploy:sh

# Hoặc sử dụng Node.js script (tương tác hơn)
npm run deploy
```

**Các lệnh deploy khác:**
```bash
# Deploy production
npm run deploy:prod

# Deploy preview
npm run deploy:preview
```

### 4. Cấu hình Environment Variables trên Cloudflare Pages
1. Vào trang dự án trên Cloudflare Pages
2. Chọn tab "Settings"
3. Trong phần "Environment variables", thêm:
   - **Variable name**: `VITE_GEMINI_API_KEY`
   - **Value**: API key của bạn
   - **Environment**: Production (và Preview nếu cần)

### 5. Xác nhận triển khai
- Kiểm tra URL được cung cấp bởi Cloudflare Pages
- Đảm bảo ứng dụng hoạt động bình thường
- Kiểm tra các chức năng tạo ảnh

## Lưu ý quan trọng
- File `public/_redirects` đã được cấu hình để hỗ trợ SPA routing
- Environment variable phải có prefix `VITE_` để được sử dụng trong client-side code
- API key sẽ được hiển thị trong client-side code, hãy đảm bảo bạn đã cấu hình đúng restrictions cho API key

## Gỡ lỗi
Nếu ứng dụng không hoạt động đúng:
1. Kiểm tra console của trình duyệt để xem lỗi
2. Đảm bảo API key được cấu hình đúng
3. Kiểm tra build logs trên Cloudflare Pages
4. Xác nhận tất cả các file cần thiết đã được deploy