const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const secretKey = "your_secret_key";

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return !users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.some(user => user.username === username && user.password === password);
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate a JWT token
  const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
  res.json({ message: "Login successful", token });
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Add a book review
regd_users.put("/auth/review/:isbn", authenticateToken,(req, res) => {
  const { isbn } = req.params; // ISBN from URL parameters
  const { review } = req.body; // Review text from request body
  const username = req.user.username; // Username from the JWT payload

  // Find the book by ISBN
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or modify the review
  book.reviews[username] = review;

  // Respond with the appropriate message
  return res.json({ message: "Review added or updated successfully" });
});

regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
  const { isbn } = req.params;
  const username = req.user.username;  // Get the username from the token

  // Find the book by ISBN
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has posted a review for the book
  if (!book.reviews[username]) {
    return res.status(403).json({ message: "You can only delete your own review" });
  }

  // Delete the review
  delete book.reviews[username];

  res.json({ message: "Review deleted successfully" });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
