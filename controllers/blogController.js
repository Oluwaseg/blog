// controllers/blogController.js
const Blog = require("../models/blogModel");

// Get all blogs
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "username");
    res.render("blogs/blog", { blogs });
  } catch (error) {
    console.error("Error getting blogs:", error);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

const createBlog = async (req, res) => {
  try {
    console.log("Received Data:", req.body);
    console.log("User ID:", req.user._id);
    const { title, description, content } = req.body;
    const author = req.user._id;

    // Check if title and content are provided
    if (!title || !description || !content) {
      return res
        .status(400)
        .render("error", { error: "Title and content are required." });
    }

    const blog = new Blog({ title, description, content, author });
    await blog.save();

    res.redirect("/blogs"); // Redirect to blog list after creation
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

// Get a blog by ID
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      "author",
      "username"
    );
    if (!blog) {
      return res.status(404).render("error", { error: "Blog not found" });
    }

    res.render("blogs/view", { blog }); // Assuming you have a separate view for blog details
  } catch (error) {
    console.error("Error getting blog by ID:", error);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

const getBlogForEdit = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).render("error", { error: "Blog not found" });
    }

    res.render("blogs/edit", { blog });
  } catch (error) {
    console.error("Error getting blog for edit:", error);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

// Update a blog by ID
const updateBlog = async (req, res) => {
  try {
    const { title, description, content } = req.body;
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, description, content },
      { new: true }
    );

    if (!blog) {
      return res.status(404).render("error", { error: "Blog not found" });
    }

    res.redirect("/blogs/" + blog._id); // Redirect to the updated blog details
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

// Delete a blog by ID
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).render("error", { error: "Blog not found" });
    }

    res.redirect("/blogs"); // Redirect to blog list after deletion
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

module.exports = {
  getAllBlogs,
  createBlog,
  getBlogById,
  updateBlog,
  deleteBlog,
  getBlogForEdit,
};
