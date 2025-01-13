// Import the crypto module
const crypto = require('crypto');

// Get the commands using process.argv
const args = process.argv.slice(2);

// Ensure there are enough arguments
if (args.length === 0) {
    console.log("Please provide an operation and the required arguments.");
    process.exit(1);
}

// Extract the operation and the numbers
const operation = args[0].toLowerCase();
const numbers = args.slice(1).map(Number);

// Function to handle calculations
switch (operation) {
    case 'add': {
        if (numbers.length < 2) {
            console.log("Please provide at least two numbers for addition.");
        } else {
            const result = numbers.reduce((acc, num) => acc + num, 0);
            console.log(`Result: ${result}`);
        }
        break;
    }
    case 'sub': {
        if (numbers.length < 2) {
            console.log("Please provide at least two numbers for subtraction.");
        } else {
            const result = numbers.reduce((acc, num) => acc - num);
            console.log(`Result: ${result}`);
        }
        break;
    }
    case 'mult': {
        if (numbers.length < 2) {
            console.log("Please provide at least two numbers for multiplication.");
        } else {
            const result = numbers.reduce((acc, num) => acc * num, 1);
            console.log(`Result: ${result}`);
        }
        break;
    }
    case 'divide': {
        if (numbers.length < 2) {
            console.log("Please provide at least two numbers for division.");
        } else {
            const result = numbers.reduce((acc, num) => acc / num);
            console.log(`Result: ${result}`);
        }
        break;
    }
    case 'sin': {
        if (numbers.length !== 1) {
            console.log("Please provide one number for sine calculation.");
        } else {
            const result = Math.sin(numbers[0]);
            console.log(`Result: ${result}`);
        }
        break;
    }
    case 'cos': {
        if (numbers.length !== 1) {
            console.log("Please provide one number for cosine calculation.");
        } else {
            const result = Math.cos(numbers[0]);
            console.log(`Result: ${result}`);
        }
        break;
    }
    case 'tan': {
        if (numbers.length !== 1) {
            console.log("Please provide one number for tangent calculation.");
        } else {
            const result = Math.tan(numbers[0]);
            console.log(`Result: ${result}`);
        }
        break;
    }
    case 'random': {
        if (numbers.length !== 1) {
            console.log("Provide length for random number generation.");
        } else {
            const length = numbers[0];
            const randomBytes = crypto.randomBytes(length);
            console.log(`Random Number: ${randomBytes.toString("binary")}`);
        }
        break;
    }
    default: {
        console.log("Invalid operation. Supported operations are: add, sub, mult, divide, sin, cos, tan, random.");
        break;
    }
}
