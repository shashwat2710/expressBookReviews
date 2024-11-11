const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))


app.use("/customer/auth/*", function auth(req,res,next){
    if (req.session && req.session.username) {
        // User is authenticated via session
        return next();
    }
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Extract the token

  if (!token) {
    // If no token is provided, return an unauthorized status
    return res.status(401).json({ message: "Authentication required. Please log in." });
  }

  // Verify the JWT token
  jwt.verify(token, "your_secret_key", (err, user) => {
    if (err) {
      // If token is invalid or expired, return a forbidden status
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user; // Attach the user data to the request object
    return next(); // Proceed to the next middleware or route handler
  });
});

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
