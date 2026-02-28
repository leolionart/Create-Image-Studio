<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Creative Image Studio

Khám phá hơn **110 prompt mẫu** cho Gemini AI — xem trước kết quả Before → After, copy prompt để dùng ngay, hoặc thử trực tiếp trong app.

**[Xem demo trên AI Studio](https://ai.studio/apps/drive/111CJF17kj7mSH6BdccOqayg1RoOoTekS)**

---

## Mục tiêu

- Giúp mọi người **khám phá khả năng** của Gemini trong thiết kế, sản phẩm và nội dung
- **Copy prompt** để paste vào Gemini hoặc bất kỳ AI tool nào
- **Thử trực tiếp** (Try It) để xem kết quả ngay trong app
- **Tự động cập nhật nội dung** qua REST API (tích hợp n8n, Make, Zapier...)

## Tính năng

| Tính năng | Mô tả |
|-----------|--------|
| Gallery Discovery | Grid cards Before → After với 110+ prompt mẫu |
| Filter & Search | Tìm kiếm theo từ khoá, lọc theo 7 danh mục |
| Detail View | Xem prompt đầy đủ, ảnh input/output, copy prompt |
| Try It | Upload ảnh + chỉnh prompt → generate trực tiếp |
| Download | Tải ảnh minh hoạ output |
| Custom API | Dùng API key cá nhân thay vì key server |
| Automation API | REST endpoint để thêm/xoá template từ bên ngoài |

---

## Bắt đầu nhanh

### Yêu cầu

- **Node.js 20+** (local dev)
- **Docker** (production)
- **Gemini API Key** — lấy tại [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone & cấu hình

```bash
git clone https://github.com/leolionart/Create-Image-Studio.git
cd Create-Image-Studio
cp .env.example .env
```

Mở `.env` và điền API key:

```env
GEMINI_API_KEY=your_google_ai_studio_key_here
```

### 2a. Chạy local (Development)

```bash
npm install
npm run dev
```

Truy cập `http://localhost:5173`. Vite dev server tự proxy `/api` tới Express server ở port 3001.

### 2b. Chạy Docker (Production)

```bash
docker-compose up -d --build
```

Truy cập `http://localhost:8008` (hoặc `http://<server-ip>:8008`).

### Cập nhật phiên bản mới

```bash
git fetch origin main && git reset --hard origin/main && git clean -fd && docker-compose up -d --build
```

> **Lưu ý:** Lệnh trên sẽ xoá thay đổi local chưa commit (file `.env` được giữ lại).

---

## Biến môi trường

| Biến | Bắt buộc | Mặc định | Mô tả |
|------|:--------:|----------|--------|
| `GEMINI_API_KEY` | Có* | — | API key từ Google AI Studio |
| `GOOGLE_GEMINI_BASE_URL` | Không | `https://generativelanguage.googleapis.com` | Custom base URL (proxy, VPN...) |
| `PORT` | Không | `3001` | Port cho Express server |

> *Không bắt buộc nếu user nhập API key riêng qua Settings trong app.

---

## Hướng dẫn sử dụng

### Khám phá Gallery

1. Mở app → trang chính hiển thị grid cards Before → After
2. Dùng **thanh tìm kiếm** để search theo từ khoá (prompt, category, author)
3. Click **chip danh mục** để lọc (Products & Mockups, Scene & Environment, Layout & Design...)

### Xem chi tiết & Copy Prompt

1. Click vào card bất kỳ → mở **Detail Dialog**
2. Xem ảnh Before/After ở kích thước lớn
3. Click **Copy Prompt** → prompt được copy vào clipboard
4. Paste vào [Gemini](https://gemini.google.com) hoặc AI tool khác

### Thử trực tiếp (Try It)

1. Trong Detail Dialog, click **Try It**
2. Upload ảnh đầu vào (nếu template yêu cầu)
3. Chỉnh sửa prompt nếu muốn
4. Click **Generate** (hoặc `Cmd/Ctrl + Enter`)
5. Xem kết quả ngay trong dialog

### Cấu hình API Key riêng

1. Click biểu tượng **Settings** (⚙) ở góc trên phải
2. Nhập **Gemini API Key** cá nhân
3. (Tuỳ chọn) Nhập **Custom Base URL** nếu dùng proxy
4. API key được lưu trong browser, không gửi về server

---

## Tự động hoá nội dung (n8n / Make / Zapier)

App cung cấp REST API để thêm/xoá template từ bên ngoài — phù hợp để tự động cập nhật nội dung qua n8n workflow, Make scenario, hoặc bất kỳ HTTP client nào.

### Thêm template mới

```
POST /api/templates
Content-Type: application/json
```

**Body:**

```json
{
  "title": "Chuyển ảnh thành anime",
  "author": "n8n-workflow",
  "category": "Style Transfer",
  "prompt": "Transform this photo into anime style artwork, maintaining the original composition and facial features",
  "inputsNeeded": 1,
  "inputImages": ["https://example.com/before.jpg"],
  "outputImage": "https://example.com/after.jpg",
  "note": "Hoạt động tốt nhất với ảnh chân dung"
}
```

**Các field:**

| Field | Bắt buộc | Type | Mô tả |
|-------|:--------:|------|--------|
| `title` | ✅ | string | Tên template |
| `prompt` | ✅ | string | Prompt gửi cho Gemini |
| `inputsNeeded` | ✅ | number | Số ảnh đầu vào cần upload (0 = text-to-image) |
| `author` | — | string | Tên tác giả (mặc định: `"n8n"`) |
| `category` | — | string | Danh mục (mặc định: `"Custom"`) |
| `inputImages` | — | string[] | URL ảnh minh hoạ đầu vào |
| `outputImage` | — | string | URL ảnh minh hoạ kết quả |
| `note` | — | string | Ghi chú hướng dẫn cho user |

**Response (201):**

```json
{
  "success": true,
  "template": {
    "id": 1001,
    "title": "Chuyển ảnh thành anime",
    "source": "custom",
    "..."
  }
}
```

### Xoá template

```
DELETE /api/templates/:id
```

Chỉ xoá được template `custom` (thêm qua API). Template `built-in` không thể xoá.

**Response (200):**

```json
{ "success": true }
```

### Ví dụ cấu hình n8n

1. **Tạo workflow mới** trong n8n
2. Thêm node **HTTP Request** với cấu hình:
   - Method: `POST`
   - URL: `http://<server-ip>:8008/api/templates`
   - Body Type: JSON
   - Body: điền các field theo bảng trên
3. Kết nối trigger (Schedule, Webhook, RSS...) để tự động thêm template
4. Template mới sẽ xuất hiện ngay khi user refresh trang

**Ví dụ workflow:** RSS Feed → Extract content → Generate prompt → POST template → Gallery tự cập nhật.

---

## API Reference

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/templates` | Lấy toàn bộ templates + categories |
| `POST` | `/api/templates` | Thêm template mới (custom) |
| `DELETE` | `/api/templates/:id` | Xoá template custom theo ID |
| `POST` | `/api/gemini` | Proxy request tới Gemini API |

### GET /api/templates

Trả về tất cả templates (built-in + custom) và danh sách categories.

```json
{
  "templates": [
    {
      "id": 1,
      "title": "Remove Background",
      "author": "studio",
      "category": "Products & Mockups",
      "inputImages": ["https://..."],
      "outputImage": "https://...",
      "prompt": "Remove the background...",
      "inputsNeeded": 1,
      "source": "built-in"
    }
  ],
  "categories": ["Layout & Design", "Products & Mockups", "..."]
}
```

### POST /api/gemini

Proxy request tới Gemini. Hỗ trợ 2 action:

**`edit`** — Chỉnh sửa ảnh (Gemini 2.5 Flash):
```json
{
  "action": "edit",
  "prompt": "Remove the background",
  "images": [
    { "base64": "...", "mimeType": "image/jpeg" }
  ]
}
```

**`generate`** — Tạo ảnh mới (Imagen 4.0):
```json
{
  "action": "generate",
  "prompt": "A cute cat sitting on a cloud"
}
```

**Response:**
```json
{
  "text": "Optional text from model",
  "imageBase64": "base64-encoded-image-data"
}
```

---

## Cấu trúc dự án

```
Create-Image-Studio/
├── src/
│   ├── server.js              # Express server + API proxy
│   ├── index.tsx               # React entry point
│   ├── App.tsx                 # Main app (gallery + dialogs)
│   ├── types.ts                # TypeScript interfaces
│   ├── services/
│   │   ├── geminiService.ts    # Gemini API client
│   │   └── templateService.ts  # Template fetch service
│   └── components/
│       ├── layout/             # GalleryShell, TopBar
│       ├── gallery/            # GalleryCard, GalleryGrid, FilterBar, Dialogs
│       ├── editor/             # PromptEditor, GenerateButton
│       └── result/             # ResultPanel, ResultActions
├── data/
│   ├── built-in-templates.json # 110 built-in templates
│   └── custom-templates.json   # Templates thêm qua API
├── public/                     # Static assets (inspiration images)
├── index.html                  # HTML + Tailwind config + M3 theme
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## Công nghệ

- **React 19** + **TypeScript** — UI components
- **Vite 6** — Build tool & dev server
- **Tailwind CSS** (CDN) — Material Design 3 dark theme
- **Express 5** — API server & Gemini proxy
- **Docker** — Production deployment
- **Gemini 2.5 Flash** — Image editing
- **Imagen 4.0** — Text-to-image generation

---

## License

MIT
