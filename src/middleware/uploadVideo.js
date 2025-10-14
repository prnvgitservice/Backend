// --- uploadVideo.js (middleware) ---
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const videoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join(__dirname, "../uploads/videos");
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + "-" + Date.now() + ext;
    cb(null, name);
  },
});

const videoFileFilter = (req, file, cb) => {
  const allowedVideoTypes = ["video/mp4", "video/mpeg", "video/webm", "video/ogg"];
  if (allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    req.uploadError = "Only video files (MP4, MPEG, WEBM, OGG) are allowed.";
    cb(null, false);
  }
};

export const videoMulterUpload = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
});

/**
 * Middleware for uploading technician videos.
 * By default: allows 1 video.
 * You can customize the limit by passing `req.maxVideos = 2/3/...` in a prior middleware if needed.
 */
export const uploadVideoWithValidation = (req, res, next) => {
  const maxVideos = 1; // default to 1 video

  const upload = videoMulterUpload.array("videos", maxVideos);

  upload(req, res, function (err) {
    if (err) {
      req.uploadError = err.message;
      console.error("Multer Video Error:", err.message);
      return next();
    }

    if (req.files.length > maxVideos) {
      req.uploadError = `Maximum ${maxVideos} video(s) allowed.`;
      return next();
    }

    next();
  });
};
