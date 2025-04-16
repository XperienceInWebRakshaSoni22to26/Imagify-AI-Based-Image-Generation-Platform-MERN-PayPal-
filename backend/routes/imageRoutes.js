const express = require("express");
const { generateImage } = require("../controllers/imageController");
const imageRouter = express.Router();
const userAuth = require("../middlewares/auth");


imageRouter.post('/generate-image', userAuth, generateImage);

module.exports = imageRouter;