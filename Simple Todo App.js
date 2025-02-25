//config/db.js

let mongoose = require("mongoose");

let connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

//TodoModel.js 

let mongoose = require("mongoose");

let todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);
//TodoController.js.

let Todo = require("../models/todoModel");

exports.createTodo = async (req, res) => {
  try {
    let { title, description, status } = req.body;
    let todo = new Todo({
      title,
      description,
      status,
    });
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTodos = async (req, res) => {
  try {
    let todos = await Todo.find();
    res.status(200).json(todos);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    let { id } = req.params;
    let { title, description, status } = req.body;
    let todo = await Todo.findByIdAndUpdate(
      id,
      { title, description, status },
      { new: true }
    );
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json(todo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    let { id } = req.params;
    let todo = await Todo.findByIdAndDelete(id);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// routes/todoRoutes.js

let express = require("express");
let router = express.Router();
let todoController = require("../controllers/todoController");

router.post("/todos", todoController.createTodo);
router.get("/todos", todoController.getTodos);
router.put("/todos/:id", todoController.updateTodo);
router.delete("/todos/:id", todoController.deleteTodo);

module.exports = router;

//In app.js

let express = require("express");
let dotenv = require("dotenv");
let connectDB = require("./config/db");
let todoRoutes = require("./routes/todoRoutes");

dotenv.config();
connectDB();

let app = express();
app.use(express.json());

app.use("/api", todoRoutes);

let PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//Tests/todo.test.js

let request = require("supertest");
let app = require("../app");
let Todo = require("../models/todoModel");
let mongoose = require("mongoose");

beforeAll(async () => {
  let mongoURI = process.env.DB_URI;
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe("Todo API", () => {
  it("should create a new todo", async () => {
    let response = await request(app)
      .post("/api/todos")
      .send({ title: "Test Todo", description: "This is a test", status: "pending" });
    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Test Todo");
    expect(response.body.status).toBe("pending");
  });

  it("should get all todos", async () => {
    await Todo.create({ title: "Todo 1", description: "Description 1" });
    let response = await request(app).get("/api/todos");
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should update a todo", async () => {
    let todo = await Todo.create({ title: "Old Title", description: "Old Description" });
    let response = await request(app)
      .put(`/api/todos/${todo._id}`)
      .send({ title: "Updated Title", description: "Updated Description" });
    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Updated Title");
  });

  it("should delete a todo", async () => {
    let todo = await Todo.create({ title: "Todo to delete" });
    let response = await request(app).delete(`/api/todos/${todo._id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Todo deleted successfully");
  });

  it("should return an error if todo not found for update or delete", async () => {
    let response = await request(app).put("/api/todos/invalidId").send({ title: "New Title" });
    expect(response.status).toBe(404);
  });
});
