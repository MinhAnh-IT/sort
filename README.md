# Quick Sort Visualizer

Công cụ trực quan hoá thuật toán Quick Sort dành cho học viên khoá DSA. Hiển thị từng bước: pivot, con trỏ `i` / `j`, so sánh, hoán đổi, và vùng đã sắp xếp.

## Cấu trúc

```
.
├── index.html      # Markup
├── styles.css      # Style
├── script.js       # Logic visualize + sinh các bước từ thuật toán
├── vercel.json     # Cấu hình deploy (cache headers, security headers)
├── package.json    # Metadata + script chạy local
└── README.md
```

## Chạy local

Không cần build. Có thể mở trực tiếp `index.html` trong trình duyệt, hoặc chạy server tĩnh:

```bash
npx serve .
```

## Deploy lên Vercel

### Cách 1 — qua CLI

```bash
npm i -g vercel
vercel          # lần đầu — deploy preview
vercel --prod   # deploy lên production
```

### Cách 2 — qua GitHub

1. Push thư mục này lên 1 repo GitHub (ví dụ `quicksort-visualizer`).
2. Vào [vercel.com/new](https://vercel.com/new), import repo.
3. Giữ nguyên mặc định (Framework: **Other**, không build command). Nhấn **Deploy**.

Vercel sẽ tự nhận diện đây là static site và phục vụ `index.html`.

## Phím tắt

- `Space` hoặc `→`: Bước tiếp
- `N`: Mảng mới ngẫu nhiên
- `R`: Reset về đầu (giữ mảng)

## Bản quyền

Dùng cho mục đích giảng dạy / học tập.
