import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: 'vinhhv28', 
  api_key: 'YOUR_API_KEY', 
  api_secret: 'YOUR_API_SECRET' // Thông tin này lấy trong Dashboard Cloudinary
});

export default cloudinary;