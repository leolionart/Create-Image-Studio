<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Create Image Studio

Create Image Studio là một phòng thí nghiệm hình ảnh giúp bạn khám phá hơn 110 use case mẫu và tạo ra hình ảnh mới với Gemini chỉ trong vài bước. Dự án được xây dựng bằng React + Vite, Tailwind CSS và một proxy API nhỏ để giao tiếp với Gemini.

## Mục tiêu dự án

- Giúp người dùng nhanh chóng hình dung các tình huống sử dụng Gemini trong thiết kế, sản phẩm và nội dung.
- Cung cấp giao diện trực quan để thử nghiệm chỉnh sửa hoặc tạo ảnh từ prompt.
- Hỗ trợ chia sẻ ý tưởng thông qua bộ sưu tập case được tuyển chọn sẵn.

Xem ứng dụng trên AI Studio: https://ai.studio/apps/drive/111CJF17kj7mSH6BdccOqayg1RoOoTekS

## Các chức năng chính

- **Bộ sưu tập case**: hơn 110 ví dụ được chia thành nhiều danh mục (Products & Mockups, Scene & Environment, Layout & Design, ...).
- **Lọc & tìm kiếm**: chọn danh mục hoặc nhập từ khóa để tìm case phù hợp.
- **Khung xem chi tiết**: xem prompt gốc, tác giả, ảnh đầu vào và ảnh kết quả minh họa.
- **Thử nghiệm nhanh**: tải ảnh đầu vào (nếu case yêu cầu), chỉnh sửa prompt và gửi yêu cầu tới Gemini để tạo kết quả mới.
- **Hiển thị kết quả**: xem ảnh render được trả về và bất kỳ phản hồi văn bản nào từ mô hình.

## Cấu trúc và công nghệ

- **React + Vite** cho giao diện người dùng.
- **Tailwind CSS** để phối màu và tạo layout responsive.
- **Express.js** (`server.js`) làm máy chủ sản xuất và proxy cho Gemini API.
- **Dữ liệu case** được quản lý trong `constants.ts`, định nghĩa kiểu trong `types.ts`.
- **Docker & Docker Compose** để đóng gói và triển khai ứng dụng.

## Hướng dẫn triển khai và sử dụng

### Bước 0: Cài đặt môi trường (Thực hiện một lần trên máy chủ mới)
**Quan trọng:** Máy chủ của bạn cần được cài đặt Docker và Docker Compose trước khi thực hiện các bước tiếp theo. Đây là yêu cầu bắt buộc.

-   Để xem hướng dẫn cài đặt Docker chính thức, vui lòng truy cập: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

Sau khi cài đặt xong, bạn có thể tiến hành các bước sau.

### Bước 1: Clone repository và cấu hình (Thực hiện một lần)
1.  **Clone repository về máy chủ của bạn:**
    ```bash
    git clone https://github.com/leolionart/Create-Image-Studio.git
    cd Create-Image-Studio
    ```

2.  **Tạo file môi trường `.env`:**
    Sao chép từ file mẫu và điền API key của bạn.
    ```bash
    cp .env.example .env
    ```
    Mở file `.env` và chỉnh sửa nội dung:
    ```env
    GEMINI_API_KEY=your_google_ai_studio_key_here
    ```

### Bước 2: Khởi chạy hoặc cập nhật ứng dụng
Để khởi chạy lần đầu hoặc cập nhật ứng dụng lên phiên bản mới nhất, bạn chỉ cần chạy một lệnh duy nhất sau đây trong thư mục dự án. Lệnh này sẽ tự động tải về code mới nhất, xóa mọi thay đổi cục bộ (trừ file `.env`) và build lại Docker image.

**Lưu ý:** Lệnh này sẽ xóa các thay đổi chưa commit trên máy chủ.

```bash
git fetch origin main && git reset --hard origin/main && git clean -fd && docker-compose up -d --build
```

### Bước 3: Truy cập ứng dụng
Sau khi hoàn tất, ứng dụng sẽ có thể truy cập tại `http://<your_server_ip>:8008`.

### Phát triển cục bộ (Không dùng Docker)

Nếu bạn muốn chạy ứng dụng trên máy local để phát triển:

1. **Yêu cầu:** Node.js 20+.
2. **Cài đặt phụ thuộc:**
   ```bash
   npm install
   ```
3. **Tạo file `.env`** và thiết lập API key như bước 2 ở trên.
4. **Khởi chạy server phát triển:**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại `http://localhost:5173`.
