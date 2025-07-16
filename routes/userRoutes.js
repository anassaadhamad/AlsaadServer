const express = require("express");
const userController = require(`${__dirname}/../controllers/userController`);
const authController = require(`${__dirname}/../controllers/authController`);

const router = express.Router();

router.post("/login", authController.login);
router.post(
  "/signup",
  // authController.protect,
  // authController.restrictTo("admin"),
  authController.signup
);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);
router.patch("/updateUserData", userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);
router.get("/me", userController.getMe, userController.getUser);

router.get("/logout", authController.logout);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
