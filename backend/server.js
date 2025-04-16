require('dotenv').config();

const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 4000;
const app = express();
const connectDB = require("./config/dbconnection");
const userRouter = require("./routes/userRoutes");
const imageRouter = require("./routes/imageRoutes");










app.use(express.json());
app.use(cors());

// db connection
connectDB();








app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);
app.get('/', (req, res) => res.send("API working "));

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});