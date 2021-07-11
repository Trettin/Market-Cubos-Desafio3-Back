const express = require("express");
const router = require("./router");
const cors = require("cors");

const app = express();
require('dotenv').config();

app.use(cors());

app.use(express.json());

app.use(router);

app.listen(process.env.PORT || 8000);
