# NLP_ML

README tiếng Việt cho project NLP_ML

## Mục đích

Repository này chứa một ứng dụng xử lý ngôn ngữ tự nhiên (NLP) dùng cho phân tích cảm xúc, tóm tắt và trích xuất chủ đề. Bao gồm backend (API), frontend (giao diện web), dữ liệu mẫu và các mô hình đã huấn luyện/fine-tuned.

## Cấu trúc thư mục (tóm tắt)

- `be/` — mã backend (FastAPI). File chính: `server.py`. Thêm: `models.py`, `untils.py`, `test.py`.
- `fe/` — frontend (Vite + React). Thư mục source ở `fe/src`.
- `data/` — tập dữ liệu mẫu và stopwords.
- `fine_tuned_model/`, `summary_model_final/`, `topic_model/` — các mô hình đã được lưu (config, weights, tokenizer...).
- `venv310/` — virtual environment mẫu (không commit lại nếu bạn muốn tạo mới).

## Yêu cầu

- Python 3.10+
- Node.js và npm/yarn cho frontend
- (Tuỳ chọn) GPU nếu muốn chạy inference nhanh với mô hình lớn

Backend dependencies có thể tìm ở `be/requirements.txt`.

## Cài đặt và chạy (PowerShell trên Windows)

1) Tạo virtual environment (nếu bạn không dùng `venv310` có sẵn):

```powershell
# ở thư mục gốc của repo
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2) Cài dependencies cho backend

```powershell
cd be
pip install --upgrade pip
pip install -r requirements.txt
```

3) Chạy backend (ví dụ dùng uvicorn)

```powershell
# từ thư mục be (hoặc cung cấp module path) 
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

4) Chạy frontend

```powershell
cd ..\fe
npm install
npm run dev
# ứng dụng frontend mặc định sẽ chạy trên http://localhost:5173 (hoặc theo cấu hình Vite)
```

## API & Endpoints

- Kiểm tra `be/server.py` để biết các endpoint hiện có. Thông thường sẽ có các route cho phân tích cảm xúc, tóm tắt, và trích chủ đề.

Ví dụ: `POST /analyze` (nội dung phụ thuộc vào triển khai trong `server.py`).

## Mô hình (notes)

- Các mô hình lưu trong các thư mục `fine_tuned_model`, `summary_model_final`, `topic_model` — những thư mục này chứa config/tokenizer và trọng số (`*.safetensors` hoặc file tương đương). Những file này có thể lớn (>100MB).
- Khi deploy trên môi trường mới, đảm bảo thư mục chứa model có quyền truy cập và đường dẫn trong `server.py` trỏ đúng tới chúng.

## Dữ liệu mẫu

- `data/` chứa một vài file CSV ví dụ: `DienDanNgheSVNoi.csv`, `Utc2Confessions.csv`, `Utc2NoiChiaSeCamXuc.csv`, `Utc2Zone.csv`.
- Ngoài ra có `vietnamese-stopwords.txt` để lọc stopwords tiếng Việt.

## Gợi ý phát triển & test nhanh

- Muốn thử endpoint backend nhanh: dùng curl hoặc httpie, hoặc Postman. Ví dụ (PowerShell):

```powershell
# ví dụ POST (tùy endpoint thực tế)
curl -X POST "http://localhost:8000/analyze" -H "Content-Type: application/json" -d '{"text": "Tôi cảm thấy rất vui hôm nay"}'
```

## Góp ý & đóng góp

- Nếu muốn đóng góp: fork repo, tạo branch mới, thực hiện thay đổi và gửi pull request. Ghi rõ phần sửa và test kèm theo.


