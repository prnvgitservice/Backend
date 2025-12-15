import app from './app.js';
import { v2 as cloudinary } from 'cloudinary';
// import path from "path";
// import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 8080;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// app.get("/robots.txt", (req, res) => {
//   res.sendFile(path.join(__dirname, "../robots.txt"));
// });

app.get('/', (req, res) => {  
  res.send('🚀 Hello from Cloud Run');
  // res.send('🚀 Server is running successfully!');
});
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running port ${PORT}`)
  console.log(`http://localhost:${PORT}`);
});
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});  

setTimeout(() => {
  cloudinary.api.ping((err, result) => {
    if (err) {
      console.error("⚠️ Cloudinary Connection Failed:", err.message);
    } else {
      console.log("✅ Cloudinary Connected Successfully");
    }
  });
}, 2000);  

//  cloudinary.config({
//   cloud_name: `${process.env.CLOUD_NAME}`,
//   api_key: `${process.env.CLOUD_API_KEY}`,
//   api_secret: `${process.env.CLOUD_API_SECRET}`,
// });


// cloudinary.api.ping((err, result) => {
//   if (err) {
//     console.error("Cloudinary Connection Failed:", err);
//   } else {
//     console.log("Cloudinary Connected Successfully");
//   }
// });