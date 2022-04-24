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

//Private Route
app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  //check if user exists
  const user = await User.findById(id, "-password");

  if (!user)
    return res.status(404).json({ message: "Usuário não encontrado!" });

  return res.status(201).json({ user });
});

//Middware
function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(404).json({ message: "Acesso negado!" });
  }

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    return res.status(500).json({ message: "Token inválido!" });
  }
}

app.get("/user", async (req, res) => {
  const user = await User.find({});

  if (user) return res.status(201).json({ user });

  return res.status(404).json({ message: "Usuário não encontrado!" });
});

//Register User
app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const userExists = await User.findOne({ email: email });

  if (!name)
    return res.status(422).json({ message: "O campo nome é obrigatório!" });
  if (!email)
    return res.status(422).json({ message: "O campo e-mail é obrigatório!" });
  if (!password)
    return res.status(422).json({ message: "O campo password é obrigatório!" });
  if (password !== confirmPassword)
    return res.status(422).json({ message: "As senhas não são iguais!" });

  if (userExists)
    return res
      .status(422)
      .json({ message: "O e-mail informado já foi cadastrado!" });

  //create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  //create user
  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ message: "Usuário criado com sucesso!" });
  } catch (error) {
    return res.status(500).json({ message: "Algo deu errado." });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  console.log("user", user);
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!email)
    return res.status(422).json({ message: "O campo e-mail é obrigatório!" });
  if (!password)
    return res.status(422).json({ message: "O campo password é obrigatório!" });

  if (!user)
    return res.status(404).json({ message: "Usuário não encontrado!" });

  if (!checkPassword)
    return res.status(404).json({ message: "Senha inválida!" });

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign({ id: user._id }, secret);
    return res.status(200).json({
      message: "Usuário autenticado com sucesso!",
      access_token: token,
    });
  } catch (error) {
    return res.status(500).json({ message: "Algo deu errado." });
  }
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
