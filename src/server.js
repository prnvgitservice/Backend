import app from './app.js';
import { v2 as cloudinary } from 'cloudinary';

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('🚀 Server is running successfully!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`http://localhost:${PORT}`);
});

 cloudinary.config({
  cloud_name: `${process.env.CLOUD_NAME}`,
  api_key: `${process.env.CLOUD_API_KEY}`,
  api_secret: `${process.env.CLOUD_API_SECRET}`,
});
cloudinary.api.ping((err, result) => {
  if (err) {
    console.error("Cloudinary Connection Failed:", err);
  } else {
    console.log("Cloudinary Connected Successfully");
  }
});