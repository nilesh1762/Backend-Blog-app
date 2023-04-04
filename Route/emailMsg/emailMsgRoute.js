const express = require("express");
const { sendEmailMsgCtrl } = require("../../Controller/emailMsg/emailMsgCtrl");
const authMiddleware = require('../../Middleware/Auth/AuthMiddleware');
const emailMsgRoute = express.Router();

emailMsgRoute.post("/", authMiddleware, sendEmailMsgCtrl);

module.exports = emailMsgRoute;
