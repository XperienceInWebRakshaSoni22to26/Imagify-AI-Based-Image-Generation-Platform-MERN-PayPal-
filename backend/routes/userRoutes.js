const { registerUser, loginUser, userCredits, paymentPaypal, verifyPaypal } = require("../controllers/userController");
const userAuth = require("../middlewares/auth");
const express = require("express");
const userRouter = express.Router();
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/credits', userAuth, userCredits);
userRouter.post('/pay-pal', userAuth, paymentPaypal)
userRouter.post('/verify-paypal', userAuth, verifyPaypal)
    // userRouter.get('/profile', userAuth, getUserProfile); // Route for profile


module.exports = userRouter;