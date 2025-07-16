const factory = require(`${__dirname}/handlerFactory`);
const Offer = require(`${__dirname}/../models/offerModel`);
const catchAsync = require(`${__dirname}/../utils/catchAsync`);

const multer = require("multer");
const path = require("path");

exports.getAllOffers = factory.getAll(Offer);
exports.getOneOffer = factory.getOne(Offer);
exports.createOffer = factory.createOne(Offer);
exports.updateOffer = factory.updateOne(Offer);
exports.deleteOffer = factory.deleteOne(Offer);

exports.uploadImage = catchAsync(async (req, res, next) => {
  try {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, "uploads/");
      },
      filename: (req, file, cb) => {
        cb(null, "fuck");
      },
    });

    const upload = multer({ storage: storage });
    upload.single("image")(req, res, (err) => {
      if (err) {
        // Handle multer-specific errors
        return next(new AppError("No file was uploaded.", 400));
      } else {
        console.log("File Uploaded");
        res.status(200).json({ message: "File uploaded successfully" });
      }
    });
  } catch (error) {
    // Handle other potential errors, such as invalid storage configuration
    return res.status(500).json({ error: "Internal server error" });
  }
});
