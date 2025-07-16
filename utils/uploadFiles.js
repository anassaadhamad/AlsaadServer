const multer = require("multer");
const catchAsync = require(`${__dirname}/catchAsync`);

// Define a storage engine for multer to use
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store uploaded files in the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, "products.xlsx");
  },
});

// Initialize multer with the defined storage engine
const upload = multer({ storage });

// Middleware to handle file uploads
const handleFileUpload = catchAsync(async (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: "No file was uploaded." });
    } else {
      console.log("File Uploaded");
      next();
    }
  });
});

module.exports = handleFileUpload;
