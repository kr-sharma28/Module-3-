
//Create server.js:

require("dotenv").config();
let express = require("express");
let session = require("express-session");
let passport = require("passport");
let GitHubStrategy = require("passport-github2").Strategy;

const app = express();

// Middleware for sessions
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Passport GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Serialize and Deserialize User
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Middleware for checking authentication
let isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
};

// Set view engine
app.set("view engine", "ejs");
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get("/auth/github/callback", passport.authenticate("github", { failureRedirect: "/" }), (req, res) => {
  res.redirect("/profile");
});

app.get("/profile", isAuthenticated, (req, res) => {
  res.render("profile", { user: req.user });
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Start Server
let PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

//Home Page (views/home.ejs)

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Developer Portfolio</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to Developer Portfolio</h1>
        <a href="/auth/github" class="login-btn">Login with GitHub</a>
    </div>
</body>
</html>

//Profile Page (views/profile.ejs)

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <div class="container">
        <h1>Welcome, <%= user.username %></h1>
        <img src="<%= user.photos[0].value %>" alt="Profile Picture">
        <p><strong>GitHub Username:</strong> <%= user.username %></p>
        <p><strong>Bio:</strong> <%= user._json.bio || "No bio available" %></p>
        <p><strong>Public Repositories:</strong> <%= user._json.public_repos %></p>
        <a href="/logout" class="logout-btn">Logout</a>
    </div>
</body>
</html>

//Create public/styles.css:

body {
    font-family: Arial, sans-serif;
    text-align: center;
    background-color: #f5f5f5;
}

.container {
    margin-top: 50px;
}

img {
    width: 150px;
    height: 150px;
    border-radius: 50%;
}

.login-btn, .logout-btn {
    display: inline-block;
    padding: 10px 20px;
    margin-top: 20px;
    text-decoration: none;
    background-color: #333;
    color: white;
    border-radius: 5px;
}

//Start the server:

node server.js
Visit http://localhost:3000 in your browser.


//List Public Repositories
Modify profile.ejs:

<h2>Public Repositories:</h2>
<ul>
    <% user._json.repos_url && user._json.repos_url.forEach(repo => { %>
        <li><a href="<%= repo.html_url %>" target="_blank"><%= repo.name %></a></li>
    <% }) %>
</ul>
