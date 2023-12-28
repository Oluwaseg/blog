// models/blogModel.js
const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

blogSchema.pre("save", async function (next) {
  try {
    // Generate and set the slug if it's not already set or modified
    if (!this.slug || this.isModified("title")) {
      this.slug = slugify(this.title, { lower: true });

      if (!this.slug) {
        throw new Error("Failed to generate slug.");
      }
    }

    // Move to the next middleware
    next();
  } catch (error) {
    next(error);
  }
});

blogSchema.pre("validate", function (next) {
  // Ensure that the slug is set before validation
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true });

    if (!this.slug) {
      this.invalidate("slug", "Slug is required.");
    }
  }

  next();
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
