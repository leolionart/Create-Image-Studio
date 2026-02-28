# Hướng dẫn quản lý hình ảnh — Create Image Studio

## Tổng quan cấu trúc

```
public/
├── card-previews/          ← Ảnh preview (output) cho mỗi template
│   ├── illustration-to-figure.png
│   ├── change-house-paint-color.png
│   └── ...  (126 files)
│
├── input-images/           ← Ảnh ví dụ đầu vào cho mỗi template
│   ├── case1-input1.png
│   ├── case114-input1.png
│   └── ...  (121 files)
│
└── community/              ← Ảnh do user submit (tự động, KHÔNG commit)

data/
└── built-in-templates.json ← Dữ liệu template (link tới ảnh)
```

---

## 1. Thay ảnh preview (output) cho template có sẵn

### Bước 1: Tìm template cần thay

Mở `data/built-in-templates.json`, tìm template theo `title` hoặc `id`:

```json
{
  "id": 111,
  "title": "Change House Paint Color",
  "outputImage": "/card-previews/change-house-paint-color.png",  ← tên file cần thay
  "inputImages": ["/input-images/case111-input1.png"],
  "inputsNeeded": 1
}
```

### Bước 2: Chuẩn bị ảnh mới

| Thuộc tính    | Yêu cầu                          |
|--------------|-----------------------------------|
| **Kích thước** | `640 × 640 px` (tỷ lệ 1:1 vuông) |
| **Định dạng**  | PNG                               |
| **Color mode** | RGB, 8-bit                        |
| **Dung lượng** | ~50KB – 800KB (trung bình 240KB)  |

> **Tại sao 640×640?** Gallery card dùng `object-cover` (crop vuông) ở trạng thái bình thường và `object-contain` (hiện đầy đủ) khi hover. Ảnh vuông 1:1 đảm bảo không bị crop mất nội dung.

### Bước 3: Ghi đè file

Copy ảnh mới vào `public/card-previews/`, **giữ nguyên tên file cũ**:

```bash
# Ví dụ thay ảnh preview cho template "Change House Paint Color"
cp ~/anh-moi.png public/card-previews/change-house-paint-color.png
```

### Bước 4: Kiểm tra local

```bash
npm run dev
# Mở http://localhost:5173, tìm template đã thay, xem ảnh mới hiển thị chưa
# Nếu browser cache ảnh cũ → Ctrl+Shift+R (hard reload)
```

---

## 2. Thay ảnh input (ảnh ví dụ đầu vào)

### Quy tắc đặt tên

```
case{TEMPLATE_ID}-input{SỐ_THỨ_TỰ}.png
```

Ví dụ template ID=114 cần 2 ảnh input:
- `public/input-images/case114-input1.png`
- `public/input-images/case114-input2.png`

### Thông số ảnh input

| Thuộc tính    | Yêu cầu                      |
|--------------|-------------------------------|
| **Định dạng**  | PNG                           |
| **Kích thước** | Tùy ý (sẽ hiện `object-cover` trong UI) |
| **Dung lượng** | ~40KB – 570KB (trung bình 220KB) |

### Số lượng input tương ứng `inputsNeeded`

| `inputsNeeded` | Số ảnh input cần | Mô tả |
|:-:|:-:|---|
| `0` | 0 | Template chỉ dùng text prompt, không cần ảnh |
| `1` | 1 | 1 ảnh đầu vào (phổ biến nhất — 84 templates) |
| `2` | 2 | 2 ảnh đầu vào (17 templates) |
| `3` | 3 | 3 ảnh đầu vào (1 template) |

---

## 3. Thêm template mới

### Bước 1: Xác định ID mới

ID tiếp theo = ID lớn nhất hiện tại + 1. Hiện tại ID cao nhất có thể xem ở cuối file `built-in-templates.json`.

### Bước 2: Chuẩn bị ảnh

- Preview: `public/card-previews/{ten-template-kebab-case}.png` (640×640)
- Input(s): `public/input-images/case{ID}-input1.png` (và input2, input3 nếu cần)

### Bước 3: Thêm vào JSON

Mở `data/built-in-templates.json`, thêm object mới vào cuối mảng (trước `]`):

```json
{
  "id": 116,
  "title": "Tên Template",
  "author": "Tên tác giả",
  "category": "Scene & Environment",
  "inputImages": [
    "/input-images/case116-input1.png"
  ],
  "outputImage": "/card-previews/ten-template.png",
  "prompt": "Nội dung prompt...",
  "inputsNeeded": 1,
  "note": "Ghi chú (tùy chọn)"
}
```

### Danh sách category hiện có

| Category | Số lượng |
|----------|:--------:|
| Art & Illustration | 16 |
| Character & Posing | 14 |
| Fun & Creative | 15 |
| Layout & Design | 19 |
| Photo & Realism | 9 |
| Products & Mockups | 21 |
| Scene & Environment | 21 |

> Có thể tạo category mới — UI tự hiển thị.

---

## 4. Xóa template

1. Xóa entry trong `data/built-in-templates.json`
2. (Tùy chọn) Xóa ảnh trong `public/card-previews/` và `public/input-images/`

---

## 5. Deploy lên production

Sau khi thay đổi ảnh:

```bash
# 1. Commit
git add public/card-previews/ public/input-images/ data/built-in-templates.json
git commit -m "feat: update preview images for template XXX"

# 2. Push
git push origin main

# 3. Tạo tag để trigger CI build Docker image
# Bump version trong package.json trước, rồi:
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3

# 4. CI tự build → push lên ghcr.io/leolionart/create-image-studio:latest
# 5. Vào Coolify → Redeploy container để pull image mới
```

### Lưu ý cache sau deploy

Khi thay ảnh **giữ nguyên tên file**, browser/CDN sẽ cache bản cũ:
- **Browser**: Ctrl+Shift+R hoặc mở Incognito để test
- **Cloudflare**: Vào dashboard → Caching → Purge Cache nếu dùng Cloudflare proxy

---

## 6. Tham chiếu nhanh

| Thao tác | File/Thư mục | Lưu ý |
|----------|-------------|-------|
| Thay ảnh preview | `public/card-previews/{tên}.png` | Giữ nguyên tên file, 640×640 PNG |
| Thay ảnh input | `public/input-images/case{id}-input{n}.png` | PNG, tùy kích thước |
| Sửa thông tin template | `data/built-in-templates.json` | JSON array |
| Ảnh community (tự động) | `public/community/` | Không commit, server tự quản lý |
