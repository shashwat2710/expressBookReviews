const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');



public_users.post("/register", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
// public_users.get('/',function (req, res) {
//   //Write your code here
//   return res.status(200).json(books);
  
// });
public_users.get('/', async function (req, res) {
  try {
    // Simulating fetching the list of books from an external API using Axios
    // Example: Fetch the list of books from a URL (replace with your actual API endpoint)
    const response = await axios.get('http://localhost:5000/books');  // Modify the URL as per your server
    console.log(response.data);  // Log the response to the console
    return res.status(200).json(response.data);  // Return the data in the response
  } catch (error) {
    console.error('Error fetching books:', error);
    return res.status(500).json({ message: 'Error fetching books' });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = Object.values(books).find(book => book.isbn === isbn);

  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author; // Retrieve author name from request parameters
  const booksByAuthor = [];

  // Iterate through the books object
  Object.values(books).forEach(book => {
    if (book.author.toLowerCase() === author.toLowerCase()) {
      booksByAuthor.push(book);
    }
  });

  // Check if any books were found
  if (booksByAuthor.length > 0) {
    res.status(200).json(booksByAuthor);
  } else {
    res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title; // Retrieve title from request parameters
  const booksByTitle = [];

  // Iterate through the books object
  Object.values(books).forEach(book => {
    if (book.title.toLowerCase().includes(title.toLowerCase())) {
      booksByTitle.push(book);
    }
  });

  // Check if any books were found
  if (booksByTitle.length > 0) {
    res.status(200).json(booksByTitle);
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn; // Retrieve ISBN from request parameters
  const book = Object.values(books).find(book => book.isbn === isbn); // Find book by ISBN

  if (book) {
    // Return the reviews for the book
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
