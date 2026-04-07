const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cloudinary storage — images go into the "matru-kripa" folder
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = req.cloudinaryFolder || "matru-krupa/products";
    return {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
      resource_type: "image",
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extOk = allowed.test(file.originalname.split(".").pop().toLowerCase());
  const mimeOk = /image\//.test(file.mimetype);
  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, gif, webp) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

module.exports = upload;
