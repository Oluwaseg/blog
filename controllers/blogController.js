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
    const { title, description, content } = req.body;
    const author = req.user._id;

    if (!title || !description || !content) {
      return res.status(400).render("error", {
        error: "Title, description, and content are required.",
      });
    }

    const blog = new Blog({ title, description, content, author });

    if (!blog.title) {
      return res.status(400).render("error", { error: "Title is required." });
    }

    await blog.save();

    res.redirect("/blogs");
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

// Get a blog by ID
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate(
      "author",
      "username"
    );
    if (!blog) {
      return res.status(404).render("error", { error: "Blog not found" });
    }

    res.render("blogs/view", { blog });
  } catch (error) {
    console.error("Error getting blog by ID:", error);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

const getBlogForEdit = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });

    if (!blog) {
      return res.status(404).render("error", { error: "Blog not found" });
    }

    res.render("blogs/edit", { blog });
  } catch (error) {
    console.error("Error getting blog for edit:", error);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

const updateBlog = async (req, res) => {
  try {
    const { title, description, content } = req.body;

    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug },
      { title, description, content },
      { new: true }
    );

    if (!blog) {
      return res.status(404).render("error", { error: "Blog not found" });
    }

    res.redirect("/blogs/" + blog.slug);
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

    res.redirect("/blogs");
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).render("error", { error: "Internal Server Error" });
  }
};

module.exports = {
  getAllBlogs,
  createBlog,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getBlogForEdit,
};
