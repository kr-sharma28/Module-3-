let express = require('express');
let { sum, multiply } = require('./math'); // Importing functions from math.js

let app = express();
let port = 3000;

// Route to get the sum of two numbers
app.get('/sum', (req, res) => {
  let a = parseInt(req.query.a);
  let b = parseInt(req.query.b);
  res.json({ result: sum(a, b) });
});

// Route to get the product of two numbers
app.get('/multiply', (req, res) => {
  let a = parseInt(req.query.a);
  let b = parseInt(req.query.b);
  res.json({ result: multiply(a, b) });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// math.js
let sum = (a, b) => a + b;
let multiply = (a, b) => a * b;

module.exports = { sum, multiply };


// math.test.js
let { sum, multiply } = require('./math');

test('correctly sums two numbers', () => {
  expect(sum(2, 3)).toBe(5);
  expect(sum(-1, 1)).toBe(0);
  expect(sum(0, 0)).toBe(0);
});

test('correctly multiplies two numbers', () => {
  expect(multiply(2, 3)).toBe(6);
  expect(multiply(-1, 1)).toBe(-1);
  expect(multiply(0, 5)).toBe(0);
});


name: Node.js CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '14'

    - name: Install dependencies
      run: |
        npm install

    - name: Run tests
      run: |
        npm test
