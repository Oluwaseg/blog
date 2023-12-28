const authController = require("../controllers/authController");
const express = require("express");
const router = express.Router();

router.use(authController.verifyToken);

router.post("/login", authController.loginUser);
router.post(
  "/register",
  authController.upload.single("profileImage"),
  authController.registerUser
);

router.use(authController.checkTokenBlacklist);
router.use("/home", authController.authMiddleware);

router.get("/home", (req, res) => {
  res.render("home/home.ejs", {
    username: req.user.username,
    name: req.user.name,
    profileImage: req.user.profileImage,
  });
});

router.get("/register", (req, res) => {
  if (req.user) {
    return res.redirect("/auth/home");
  }
  res.render("auth/register.ejs");
});

router.get("/login", (req, res) => {
  if (req.user) {
    return res.redirect("/auth/home");
  }
  res.render("auth/login.ejs");
});

router.get("/logout", authController.logoutUser);

module.exports = router;
