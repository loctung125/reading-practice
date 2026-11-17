# Reading Lab – B2 Reading Practice

Website luyện Reading chạy **local hoặc trên GitHub Pages**, không cần tài khoản hay cơ sở dữ liệu. Khi dùng bản trực tuyến, cần Internet để tải trang và ngân hàng câu hỏi; lịch sử được lưu riêng trong trình duyệt.

## Triển khai lên GitHub Pages

Dự án đã có workflow tại `.github/workflows/deploy-pages.yml`.

1. Đưa dự án lên repository GitHub, nhánh `main`.
2. Trong repository, mở **Settings → Pages → Build and deployment → Source**, chọn **GitHub Actions**.
3. Mở **Actions → Deploy Reading Lab to GitHub Pages → Run workflow**, chọn nhánh `main` rồi chạy. Những lần đẩy mã tiếp theo lên `main` sẽ tự triển khai.
4. Sau khi workflow hoàn tất, mở địa chỉ website trong **Settings → Pages** hoặc mục **github-pages** của lần chạy.

Địa chỉ thông thường: `https://<ten-tai-khoan>.github.io/<ten-repository>/`.

Workflow chỉ xuất bản `index.html`, `style.css`, `app.js` và `data/questions.json`. Website dùng đường dẫn tương đối nên có thể chạy trong thư mục con của GitHub Pages. Bản PDF gốc và script Python không nằm trong gói website.

## Cách chạy trong VS Code

1. Giải nén thư mục `reading-practice`.
2. Mở VS Code → **File → Open Folder** → chọn thư mục `reading-practice`.
3. Cài tiện ích **Live Server** trong VS Code nếu chưa có.
4. Nhấp phải vào `index.html` → **Open with Live Server**. Website sẽ mở trong trình duyệt.

**Cách khác (không cần Live Server):** mở Terminal tại thư mục và chạy:

```bash
python -m http.server 5500
```

Sau đó truy cập <http://localhost:5500>. Nếu Windows chỉ có `py`, dùng `py -m http.server 5500`.

> Không nhấp đúp để mở `index.html` bằng đường dẫn `file://` vì trình duyệt thường chặn việc tải ngân hàng JSON trong chế độ này.

## Các chức năng

- 23 bài đọc được trích từ file PDF đã cung cấp, tổng cộng 160 câu hỏi.
- Mỗi lượt chọn **ngẫu nhiên một bài**, không lặp lại bài vừa làm ngay lập tức.
- Các kiểu câu hỏi: điền từ, chọn một đáp án, chọn hai đáp án, TRUE/FALSE/NOT GIVEN, YES/NO/NOT GIVEN và nối tiêu đề.
- Chấm ngay khi nộp; câu đúng/sai được đánh dấu kèm đáp án chính xác.
- Đồng hồ đếm thời gian, tiến độ trả lời, tăng cỡ chữ bài đọc.
- Lưu lịch sử điểm và thời gian trong trình duyệt (`localStorage`).
- Giao diện tối và tự thích ứng màn hình laptop, điện thoại.

## Lưu ý về dữ liệu

`data/questions.json` chứa câu hỏi và đáp án. Có thể chỉnh sửa tệp này bằng VS Code để thay câu hỏi, bổ sung các đáp án tương đương hoặc sửa lỗi đánh máy. `READING.pdf` là tài liệu tham khảo gốc.

Các câu hỏi đã được chuyển thành dạng tương tác và có **một số câu diễn đạt lại**, do bản PDF được cung cấp là bản đã điền đáp án, không phải đề trống nguyên bản. Một số bài dạng sơ đồ/bảng đã chuyển sang câu điền từ tương đương để dễ thao tác trên website. Phần nối tiêu đề vẫn giữ các lựa chọn đầy đủ.

Muốn xây dựng lại `data/questions.json` từ `READING.pdf` sau khi chỉnh sửa `build_data.py`, cần cài `pymupdf` rồi chạy `python build_data.py`. Khi chỉ sử dụng website thì **không cần Python package nào**.
