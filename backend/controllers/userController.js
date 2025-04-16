const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const paypal = require('@paypal/checkout-server-sdk');
const transactionModel = require("../models/transactionModel");


const registerUser = async(req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashPassword
        }
        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ success: true, token, user: { name: user.name } })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "user does not exist" });
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            res.json({ success: true, token, user: { name: user.name } })
        } else {
            return res.json({ success: false, message: "Invalid credentials" })
        }




    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });

    }
}

const userCredits = async(req, res) => {
    try {
        const userId = req.userId;
        console.log("user credit userid", userId);
        const user = await userModel.findById(userId);
        res.json({ success: true, credits: user.creditBalance, user: { name: user.name } })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// PayPal Sandbox environment setup
const environment = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_KEY_ID, // This is your Client ID
    process.env.PAYPAL_KEY_SECRET // This is your Client Secret
);

// Create PayPal client instance
const paypalClient = new paypal.core.PayPalHttpClient(environment);

const paymentPaypal = async(req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.userId;

        if (!userId || !planId) {
            return res.json({ success: false, message: "Missing Details" });
        }

        const userData = await userModel.findById(userId);
        if (!userData) return res.json({ success: false, message: "User not found" });

        let credits, plan, amount;

        switch (planId) {
            case 'Basic':
                plan = 'Basic';
                credits = 100;
                amount = 10;
                break;
            case 'Advanced':
                plan = 'Advanced';
                credits = 500;
                amount = 50;
                break;
            case 'Business':
                plan = 'Business';
                credits = 5000;
                amount = 250;
                break;
            default:
                return res.json({ success: false, message: 'Plan not found' });
        }

        const date = Date.now();
        const transactionData = { userId, plan, amount, credits, date };
        const newTransaction = await transactionModel.create(transactionData);

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                reference_id: newTransaction._id.toString(),
                amount: { currency_code: process.env.CURRENCY || "USD", value: amount.toString() }
            }]
        });

        const order = await paypalClient.execute(request);
        res.json({ success: true, orderID: order.result.id });

    } catch (error) {
        console.log("PayPal Payment Error:", error);
        res.json({ success: false, message: error.message });
    }
};


const verifyPaypal = async(req, res) => {
    try {
        const { orderID } = req.body;

        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});
        const capture = await paypalClient.execute(request);
        const captureData = capture.result;

        if (captureData.status !== "COMPLETED") {
            return res.json({ success: false, message: "Payment not completed" });
        }

        const referenceId = captureData.purchase_units[0].reference_id;
        const transaction = await transactionModel.findById(referenceId);

        if (!transaction || transaction.payment) {
            return res.json({ success: false, message: "Transaction already completed or not found" });
        }

        const user = await userModel.findById(transaction.userId);

        await userModel.findByIdAndUpdate(user._id, {
            creditBalance: (user.creditBalance || 0) + transaction.credits
        });

        await transactionModel.findByIdAndUpdate(transaction._id, { payment: true });

        res.json({ success: true, message: "Credits added successfully" });

    } catch (error) {
        console.log("PayPal Verify Error:", error);
        res.json({ success: false, message: error.message });
    }
};












module.exports = {
    registerUser,
    loginUser,
    userCredits,
    paymentPaypal,
    verifyPaypal

};