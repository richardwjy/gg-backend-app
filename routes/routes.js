const express = require("express");
const Router = express.Router();

const userRoute = require("./api/user");
const authRoute = require("./api/auth");

Router.use('/users', userRoute);
Router.use('/auth', authRoute);

module.exports = Router;