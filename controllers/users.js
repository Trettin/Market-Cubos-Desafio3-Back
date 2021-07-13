const conection = require("../conection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyEmail = require("../utils/verifyEmail");
const { userErrors } = require("../utils/fieldsValidation");
require("dotenv").config();
const nodemailer = require("../nodemailer");

async function registerUser(req, res) {
  const { name, email, password, store_name } = req.body;

  const error = userErrors(req.body);
  if (error) {
    return res.status(400).json({ error: `O campo  ${error} é obrigatório.` });
  }

  const emailError = await verifyEmail(email, res);
  console.log(emailError);
  if (emailError) return res.status(400).json({ error: emailError });

  try {
    const hash = await bcrypt.hash(password, 10);
    const query =
      "insert into users (name, email, password, store_name) values ($1, $2, $3, $4)";
    const { rowCount: registration } = await conection.query(query, [
      name,
      email,
      hash,
      store_name,
    ]);

    if (!registration) {
      return res
        .status(400)
        .json({ error: "Não foi possível efetuar o registro." });
    }

    const emailData = {
      from: "Market Cubos <nao-responder@market-cubos>",
      to: email,
      subject: "Bem-vindes ao Market Cubos",
      template: "welcome",
      context: {
        name,
        email,
      },
    };
    nodemailer.sendMail(emailData);

    return res.status(200).json("Usuário cadastrado com sucesso.");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(404).json({ error: "Email e senha são obrigatórios." });
  }

  try {
    const queryVerifyEmail = "select * from users where email = $1";
    const { rows, rowCount } = await conection.query(queryVerifyEmail, [email]);

    if (!rowCount) {
      return res.status(404).json({ error: "Email e/ou senha não conferem." });
    }

    const user = rows[0];

    const verifiedPassword = await bcrypt.compare(password, user.password);

    if (!verifiedPassword) {
      return res.status(400).json({ error: "Email e/ou senha não conferem." });
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET);

    const emailData = {
      from: "Market Cubos <nao-responder@market-cubos>",
      to: email,
      subject: "Login em Market Cubos",
      template: "login",
      context: {
        name: user.name,
      },
    };
    nodemailer.sendMail(emailData, (err, suc) => {
      if (err) {
        console.log(err);
      }
    });

    const { password: pswFromDb, ...userData } = user;

    return res.status(200).json({ user: userData, token });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function profile(req, res) {
  return res.json(req.user);
}

async function updateProfile(req, res) {
  const {
    name: newName,
    email: newEmail,
    password: newPassword,
    store_name: newStoreName,
  } = req.body;
  const { id, name, email, store_name } = req.user;

  if (newEmail) verifyEmail(newEmail, res);

  let hash = undefined;
  if (newPassword) {
    hash = await bcrypt.hash(newPassword, 10);
  }

  const { rows: passwordsFound } = await conection.query(
    "select password from users where id = $1",
    [id]
  );

  const updatedName = newName ?? name;
  const updatedEmail = newEmail ?? email;
  const updatedPassword = hash ?? passwordsFound[0].password;
  const updatedStoreName = newStoreName ?? store_name;

  try {
    const queryUpdateProfile =
      "update users set name = $1, email = $2, password = $3, store_name = $4 where id = $5";
    const { rowCount: updatedUser } = await conection.query(
      queryUpdateProfile,
      [updatedName, updatedEmail, updatedPassword, updatedStoreName, id]
    );

    if (!updatedUser) {
      return res.status(400).json({
        error:
          "Desculpe, Não foi possível atualizar o seu perfil. Tente novamente.",
      });
    }
    return res.status(200).json("Oba, seu perfil foi atualizado.");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  registerUser,
  login,
  profile,
  updateProfile,
};
