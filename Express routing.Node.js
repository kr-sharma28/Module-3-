const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const todoRoutes = require('./routes/todos');

const app = express();

app.use(bodyParser.json());

// Routes
app.use('/users', userRoutes);
app.use('/todos', todoRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const express = require('express');
const router = express.Router();

let users = [];

// Create a new user
router.post('/', (req, res) => {
  const user = req.body;
  users.push(user);
  res.status(201).send('User created successfully');
});

// Read all users
router.get('/', (req, res) => {
  res.status(200).json(users);
});

// Update a user
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;
  const userIndex = users.findIndex((user) => user.id === parseInt(id));

  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updatedUser };
    res.send('User updated successfully');
  } else {
    res.status(404).send('User not found');
  }
});

// Delete a user
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex((user) => user.id === parseInt(id));

  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    res.send('User deleted successfully');
  } else {
    res.status(404).send('User not found');
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

let todos = [];

// Create a new todo
router.post('/', (req, res) => {
  const todo = req.body;
  todos.push(todo);
  res.status(201).send('Todo created successfully');
});

// Read all todos
router.get('/', (req, res) => {
  res.status(200).json(todos);
});

// Update a todo
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updatedTodo = req.body;
  const todoIndex = todos.findIndex((todo) => todo.id === parseInt(id));

  if (todoIndex !== -1) {
    todos[todoIndex] = { ...todos[todoIndex], ...updatedTodo };
    res.send('Todo updated successfully');
  } else {
    res.status(404).send('Todo not found');
  }
});

// Delete a todo
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const todoIndex = todos.findIndex((todo) => todo.id === parseInt(id));

  if (todoIndex !== -1) {
    todos.splice(todoIndex, 1);
    res.send('Todo deleted successfully');
  } else {
    res.status(404).send('Todo not found');
  }
});

module.exports = router;
