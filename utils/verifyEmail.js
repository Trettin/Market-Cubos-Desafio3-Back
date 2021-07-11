const conection = require("../conection");

async function verifyEmail(email, res) {
  try {
    const query = "select * from users where email = $1";
    const user = await conection.query(query, [email]);

    if (user.rowCount > 0) {
      return "Esse email já foi registrado.";
    }
  } catch (error) {
    return error.message;
  }
}

module.exports = verifyEmail;
