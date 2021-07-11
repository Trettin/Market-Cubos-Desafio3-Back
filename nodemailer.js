const nodemailer = require("nodemailer");
const handlebars = require("nodemailer-express-handlebars");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_USER,
  },
});

transporter.use(
  "compile",
  handlebars({
    viewEngine: {
      extname: ".handlebars",
      defaultLayout: false,
    },
    viewPath: "./views/",
  })
);

module.exports = transporter;
