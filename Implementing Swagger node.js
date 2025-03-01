// server.js
let express = require('express');
let app = express();
let port = 3000;

let swaggerUi = require('swagger-ui-express');
let swaggerDocument = require('./swagger-output.json');

// Route documentation
/**
 * @swagger
 * /:
 *   get:
 *     description: Returns a welcome message
 *     responses:
 *       200:
 *         description: A welcome message
 */
app.get('/', (req, res) => {
  res.send('Welcome to the Swagger Node.js API!');
});

/**
 * @swagger
 * /users:
 *   get:
 *     description: Returns a list of users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
app.get('/users', (req, res) => {
  res.json(['User1', 'User2', 'User3']);
});

/**
 * @swagger
 * /products:
 *   get:
 *     description: Returns a list of products
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
app.get('/products', (req, res) => {
  res.json(['Product1', 'Product2', 'Product3']);
});

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// swagger.js
let swaggerAutogen = require('swagger-autogen')();

// Define the output file and the input file(s)
let outputFile = './swagger-output.json';
let endpointsFiles = ['./server.js'];

// Swagger documentation information
let doc = {
  info: {
    title: 'Swagger Node.js API',  // Title of the API
    description: 'A simple API documentation using Swagger and Node.js',  // Description of the API
  },
  host: 'localhost:3000',  // Host for the Swagger UI
  basePath: '/',  // Base path for the API
  schemes: ['http'],  // The scheme for the Swagger UI
};

// Generate the Swagger documentation
swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger output generated!');
});



