// Create web server
// Load the express module
const express = require("express");
// Create an instance of express
const app = express();
// Load the mysql module
const mysql = require("mysql");
// Load the body-parser module
const bodyParser = require("body-parser");
// Load the path module
const path = require("path");
// Load the session module
const session = require("express-session");
// Load the multer module
const multer = require("multer");
// Load the fs module
const fs = require("fs");

// Create connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "password",
  database: "comments"
});

// Set up the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Set up the middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);
app.use(multer({ dest: "/tmp/" }).single("image"));

// Set up the routes
app.get("/", (req, res) => {
  res.render("index", { title: "Comments" });
});

app.get("/comments", (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query("SELECT * FROM comments", (err, rows) => {
      connection.release();
      if (!err) {
        res.render("comments", { rows });
      } else {
        console.log(err);
      }
    });
  });
});

app.post("/comments", (req, res) => {
  const { name, comment } = req.body;
  pool.getConnection((err, connection) => {
    connection.query(
      "INSERT INTO comments SET name = ?, comment = ?",
      [name, comment],
      (err, rows) => {
        connection.release();
        if (!err) {
          res.render("comments", { alert: "Comment added successfully." });
        } else {
          console.log(err);
        }
      }
    );
  });
});

app.get("/edit/:id", (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query(
      "SELECT * FROM comments WHERE id = ?",
      [req.params.id],
      (err, rows) => {
        connection.release();
        if (!err) {
          res.render("edit", { rows });
        } else {
          console.log(err);
        }
      }
    );
  });
}