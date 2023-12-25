// routes/blogRoutes.js
const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const authController = require("../controllers/authController");

// Apply global token verification middleware
router.use(authController.verifyToken);

// Define CRUD routes
router.get("/", blogController.getAllBlogs);
router.get("/create", authController.authMiddleware, (req, res) => {
  res.render("blogs/create", { blog: {} });
});

router.post(
  "/create",
  authController.authMiddleware,
  blogController.createBlog
);
router.get("/:id", blogController.getBlogById);
router.get(
  "/:id/edit",
  authController.authMiddleware,
  blogController.getBlogForEdit
);
router.put(
  "/:id/edit",
  authController.authMiddleware,
  blogController.updateBlog
);
router.delete("/:id", authController.authMiddleware, blogController.deleteBlog);

module.exports = router;
