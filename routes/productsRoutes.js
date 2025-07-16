const express = require("express");
const router = express.Router();
const productController = require(`${__dirname}/../controllers/productController`);
const authController = require(`${__dirname}/../controllers/authController`);

router
  .route("/search")
  .get(authController.protect, productController.searchProducts);

// // Restrict access to admin after this middleware
// router.use(authController.restrictTo("admin", "cashier"));
router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin", "cashier"),
    productController.getAllProducts
  )
  .post(
    authController.protect,
    authController.restrictTo("admin", "cashier"),
    productController.createProduct
  );

router.post(
  "/uploadAndConvertProducts",
  authController.protect,
  authController.restrictTo("admin", "cashier"),
  productController.uploadProducts,
  productController.convertProducts,
  productController.removeAllProducts
);

router.post(
  "/importJsonData",
  authController.protect,
  authController.restrictTo("admin", "cashier"),
  productController.importProducts
);

router.delete(
  "/removeAllProducts",
  authController.protect,
  authController.restrictTo("admin", "cashier"),
  productController.removeAllProducts
);

router.post("/downloadExcel", productController.downloadExcelMiddleware);

// router.route("/uploadProducts").post(productController.uploadProducts);
// router.route("/importProducts").post(productController.importProducts);

// router.post(
//   "/upload",
//   uploadFiles,
//   xtoj,
//   deleteAllFiles,
//   importData,
//   (req, res, next) => {
//     console.log("files");
//     next();
//   }
// );

module.exports = router;
