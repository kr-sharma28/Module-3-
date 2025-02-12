//server.js

require("dotenv").config();
let express = require("express");
let mongoose = require("mongoose");
let authRoutes = require("./routes/authRoutes");
let recipeRoutes = require("./routes/recipeRoutes");
let adminRoutes = require("./routes/adminRoutes");

let app = express();
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/recipe", recipeRoutes);
app.use("/admin", adminRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database connected"))
  .catch(err => console.error("Database connection error:", err));

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//authController.js

let User = require("../models/userModel");
let bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");

let signup = async (req, res) => {
  try {
    let { username, password, role } = req.body;
    let hashedPassword = await bcrypt.hash(password, 10);
    let user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

let login = async (req, res) => {
  try {
    let { username, password } = req.body;
    let user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    let token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30m" });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { signup, login };
//userModel.js

let mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Chef", "Customer"], required: true }
});

module.exports = mongoose.model("User", userSchema);
//recipeModel.js

let mongoose = require("mongoose");

let recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ingredients: { type: [String], required: true },
  instructions: { type: String, required: true },
  visibility: { type: String, enum: ["Public", "Private"], default: "Public" },
  views: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("Recipe", recipeSchema);
//recipeController.js

let Recipe = require("../models/recipeModel");

let createRecipe = async (req, res) => {
  try {
    let { title, ingredients, instructions, visibility } = req.body;
    let recipe = new Recipe({ title, ingredients, instructions, visibility, createdBy: req.user.id });
    await recipe.save();
    res.status(201).json({ message: "Recipe created successfully", recipe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

let getRecipe = async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (recipe.visibility === "Private" && req.user.role !== "Customer" && req.user.id !== recipe.createdBy.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    recipe.views += 1;
    await recipe.save();
    res.status(200).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createRecipe, getRecipe };
//roleMiddleware.js

let roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = roleMiddleware;
//authMiddleware.js

let jwt = require("jsonwebtoken");

let authMiddleware = (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
//Sample Routes (authRoutes.js)

let express = require("express");
let { signup, login } = require("../controllers/authController");
let router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
