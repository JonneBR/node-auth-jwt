require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

//Config JSON response
app.use(express.json());

//Models
const User = require("./models/User");

//Open Route - Public Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Conectado" });
});

//Register User
app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name)
    return res.status(422).json({ message: "O campo nome é obrigatório!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.27axc.mongodb.net/jwtApplication?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
    console.log("Conectado ao MongoDB com sucesso!");
  })
  .catch((err) => console.log(err));
