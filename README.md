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

## Quy trình sử dụng
1. Mở ứng dụng và chọn danh mục hoặc dùng thanh tìm kiếm để lọc các case.
2. Bấm vào một case để mở modal chi tiết.
3. Đọc prompt mô tả và lưu ý đặc biệt (nếu có) cho case đó.
4. Tải lên đủ số ảnh đầu vào được yêu cầu hoặc điền prompt nếu case chỉ cần văn bản.
5. Nhấn `Generate` để gửi yêu cầu. Ảnh kết quả và phản hồi sẽ xuất hiện ở bảng bên phải.
6. Có thể đóng modal để quay lại danh sách case và thử các ý tưởng khác.

## Chạy ứng dụng cục bộ
**Yêu cầu:** Node.js (phiên bản LTS khuyến nghị).

1. Cài đặt phụ thuộc:
   ```bash
   npm install
   ```
2. Tạo file `.env.local` và thiết lập biến môi trường:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```
3. Khởi chạy môi trường phát triển:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt tại địa chỉ được Vite cung cấp (mặc định `http://localhost:5173`).

## Cấu trúc và công nghệ
- **React + Vite** cho giao diện người dùng.
- **Tailwind CSS** để phối màu và tạo layout responsive.
- **Gemini API proxy** (`/api/gemini`) xử lý yêu cầu chỉnh sửa/tạo ảnh dựa trên prompt và ảnh đầu vào.
- **Dữ liệu case** được quản lý trong `constants.ts`, định nghĩa kiểu trong `types.ts`.

## Gợi ý tiếp theo
- Tùy chỉnh thêm các case hoặc thêm case mới bằng cách mở rộng `constants.ts`.
- Triển khai lên môi trường sản xuất bằng `npm run build` và sử dụng `deploy.sh` hoặc `deploy.js` theo nhu cầu hạ tầng của bạn.

