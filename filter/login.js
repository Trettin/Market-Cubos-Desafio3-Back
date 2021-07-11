const conection = require("../conection");
const jwt = require("jsonwebtoken");
require('dotenv').config();


async function verifyLogin(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(404).json("Token not informed.");
  }

  try {
    const token = authorization.replace("Bearer ", "").trim();

    const { id } = jwt.verify(token, process.env.SECRET);

    const query = "select * from users where id = $1";
    const { rowCount, rows } = await conection.query(query, [id]);

    if (rowCount === 0) {
      return res.status(404).json("The user was not found.");
    }

    const { password, ...user } = rows[0];

    req.user = user;

    next();
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

module.exports = verifyLogin;
