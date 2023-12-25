exports.getAbout = (req, res) => {
  res.render("about.ejs");
};

// exports.blog = (req, res) => {
//   res.render("blog.ejs");
// };
exports.getFeatures = (req, res) => {
  res.render("coin_tracker.ejs");
};

exports.getLogout = (req, res) => {
  req.logout();
  res.redirect("/login");
};
