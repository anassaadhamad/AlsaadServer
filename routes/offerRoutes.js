const express = require("express");
const router = express.Router();
const offerController = require(`${__dirname}/../controllers/offerController`);
const authController = require(`${__dirname}/../controllers/authController`);

router
  .route("/")
  .get(authController.protect, offerController.getAllOffers)
  .post(
    authController.protect,
    authController.restrictTo("admin", "cashier"),
    // offerController.uploadImage,
    offerController.createOffer
  );

router
  .route("/:id")
  .get(authController.protect, offerController.getOneOffer)
  .delete(
    authController.protect,
    authController.restrictTo("admin", "cashier"),
    offerController.deleteOffer
  )
  .patch(
    authController.protect,
    authController.restrictTo("admin", "cashier"),
    offerController.uploadImage,
    offerController.updateOffer
  );

module.exports = router;
