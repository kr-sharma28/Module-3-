
//Create config/cloudinary.js:

let cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;

//User Model (models/user.model.js)

let mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String, // hashed password
  role: { type: String, enum: ["user", "admin"], default: "user" }
});

module.exports = mongoose.model("User", userSchema);
//Recipe Model (models/recipe.model.js)

let mongoose = require("mongoose");

let recipeSchema = new mongoose.Schema({
  name: String,
  ingredients: [String],
  steps: String,
  imageURL: String,
  visibility: { type: String, enum: ["public", "private"], default: "private" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Recipe", recipeSchema);

//Authentication Middleware (middleware/auth.middleware.js)

lett jwt = require("jsonwebtoken");

let authMiddleware = (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = decoded;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};

module.exports = { authMiddleware, isAdmin };
//Multer Middleware for Image Upload (middleware/upload.middleware.js)

let multer = require("multer");

let storage = multer.memoryStorage();
let upload = multer({ storage });

module.exports = upload;

//User Controller (controllers/user.controller.js)

let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
let User = require("../models/user.model");

exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let hashedPassword = await bcrypt.hash(password, 10);

    let user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//Recipe Controller (controllers/recipe.controller.js)

let cloudinary = require("../config/cloudinary");
let Recipe = require("../models/recipe.model");

exports.createRecipe = async (req, res) => {
  try {
    let { name, ingredients, steps, visibility } = req.body;
    let result = await cloudinary.uploader.upload_stream({ resource_type: "image" }, async (error, result) => {
      if (error) return res.status(500).json({ message: error.message });

      let recipe = new Recipe({
        name,
        ingredients: ingredients.split(","),
        steps,
        imageURL: result.secure_url,
        visibility,
        userId: req.user.userId
      });

      await recipe.save();
      res.status(201).json({ message: "Recipe created successfully", recipe });
    }).end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecipe = async (req, res) => {
  let recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: "Recipe not found" });

  if (recipe.visibility === "private") {
    return res.status(403).json({ message: "This recipe is private and cannot be shared." });
  }

  res.json(recipe);
};
//Admin Controller (controllers/admin.controller.js)

let Recipe = require("../models/recipe.model");
let { createObjectCsvWriter } = require("csv-writer");

exports.generateReport = async (req, res) => {
  try {
    let recipes = await Recipe.find();
    let csvWriter = createObjectCsvWriter({
      path: "recipes_report.csv",
      header: [
        { id: "name", title: "Recipe Name" },
        { id: "ingredients", title: "Ingredients" },
        { id: "steps", title: "Steps" },
        { id: "imageURL", title: "Image URL" },
        { id: "visibility", title: "Public/Private" }
      ]
    });

    await csvWriter.writeRecords(recipes);
    res.download("recipes_report.csv");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//User Routes (routes/user.routes.js)

let express = require("express");
let { signup, login } = require("../controllers/user.controller");
let router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
//Recipe Routes (routes/recipe.routes.js)

let express = require("express");
let { createRecipe, getRecipe } = require("../controllers/recipe.controller");
let { authMiddleware } = require("../middleware/auth.middleware");
let upload = require("../middleware/upload.middleware");
let router = express.Router();

router.post("/createRecipe", authMiddleware, upload.single("image"), createRecipe);
router.get("/recipe/:id", getRecipe);

module.exports = router;

//Create server.js:


let express = require("express");
let mongoose = require("mongoose");
require("dotenv").config();

let app = express();
app.use(express.json());

app.use("/api/user", require("./routes/user.routes"));
app.use("/api/recipe", require("./routes/recipe.routes"));

mongoose.connect(process.env.MONGO_URI, () => console.log("DB Connected"));
app.listen(3000, () => console.log("Server running on port 3000"));
