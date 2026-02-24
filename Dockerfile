# Sử dụng bản node nhẹ (alpine) để tiết kiệm tài nguyên VPS
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy file quản lý gói vào trước để tận dụng cache của Docker
COPY package*.json ./

# Cài đặt thư viện (omit=dev để bỏ qua nodemon nếu chạy production)
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở port (thông thường backend chạy 5000 hoặc 3000, bạn hãy chỉnh lại cho đúng)
EXPOSE 5000

# Lệnh chạy ứng dụng
CMD ["npm", "start"]