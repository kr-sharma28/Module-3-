//config/database.js

let mongoose = require("mongoose");

let connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

//models/User.js

let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");

let userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

//models/Todo.js

let mongoose = require("mongoose");

let todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);

//middlewares/authMiddleware.js

let jwt = require("jsonwebtoken");

let protect = (req, res, next) => {
  let token = req.header("Authorization") && req.header("Authorization").split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = protect;

//controllers/authController.js

let User = require("../models/User");
let jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  let { username, password } = req.body;
  
  try {
    let userExists = await User.findOne({ username });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    let user = new User({ username, password });
    await user.save();

    let payload = { user: { id: user._id } };
    let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  let { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    let isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    let payload = { user: { id: user._id } };
    let token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//controllers/todoController.js

let Todo = require("../models/Todo");

exports.createTodo = async (req, res) => {
  let { title, description, status } = req.body;
  try {
    let todo = new Todo({
      title,
      description,
      status,
      user: req.user.id,
    });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTodos = async (req, res) => {
  try {
    let todos = await Todo.find({ user: req.user.id });
    res.status(200).json(todos);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateTodo = async (req, res) => {
  let { id } = req.params;
  let { title, description, status } = req.body;

  try {
    let todo = await Todo.findOne({ _id: id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    todo.title = title || todo.title;
    todo.description = description || todo.description;
    todo.status = status || todo.status;

    await todo.save();
    res.status(200).json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTodo = async (req, res) => {
  let { id } = req.params;

  try {
    let todo = await Todo.findOneAndDelete({ _id: id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: "Todo not found" });
    res.status(200).json({ message: "Todo deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//routes/authRoutes.js

let express = require("express");
let router = express.Router();
let { registerUser, loginUser } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
//routes/todoRoutes.js

let express = require("express");
let router = express.Router();
let { createTodo, getTodos, updateTodo, deleteTodo } = require("../controllers/todoController");
let protect = require("../middlewares/authMiddleware");

router.post("/todos", protect, createTodo);
router.get("/todos", protect, getTodos);
router.put("/todos/:id", protect, updateTodo);
router.delete("/todos/:id", protect, deleteTodo);

module.exports = router;

//server.js

let express = require("express");
let dotenv = require("dotenv");
let connectDB = require("./config/database");
let authRoutes = require("./routes/authRoutes");
let todoRoutes = require("./routes/todoRoutes");

dotenv.config();
connectDB();

let app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", todoRoutes);

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//test/authRoutes.test.js

let request = require("supertest");
let app = require("../server");
let User = require("../models/User");

describe("Auth Routes", () => {
  it("should register a user", async () => {
    let response = await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser", password: "password123" });
    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
  });

  it("should login a user", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ username: "testuser", password: "password123" });

    let response = await request(app)
      .post("/api/auth/login")
      .send({ username: "testuser", password: "password123" });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
//test/todoRoutes.test.js

let request = require("supertest");
let app = require("../server");
let User = require("../models/User");
let Todo = require("../models/Todo");

let token;

beforeAll(async () => {
  let user = await request(app).post("/api/auth/register").send({ username: "testuser", password: "password123" });
  token = user.body.token;
});

describe("Todo Routes", () => {
  it("should create a todo", async () => {
    let response = await request(app)
      .post("/api/todos")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Test Todo", description: "This is a test", status: "pending" });
    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Test Todo");
  });

  it("should get all todos", async () => {
    await Todo.create({ title: "Sample Todo", user: "testuser" });
    let response = await request(app)
      .get("/api/todos")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  it("should update a todo", async () => {
    let todo = await Todo.create({ title: "Update Test", user: "testuser" });
    let response = await request(app)
      .put(`/api/todos/${todo._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Test" });
    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Updated Test");
  });

  it("should delete a todo", async () => {
    let todo = await Todo.create({ title: "Delete Test", user: "testuser" });
    let response = await request(app)
      .delete(`/api/todos/${todo._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Todo deleted");
  });
});
