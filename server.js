const express = require("express");

const dotenv = require("dotenv");
dotenv.config()
const dbConnection = require("./Config/db/dbConnect");
const userRoutes = require("./Route/Users/UserRoute");
const cors = require("cors");
const {errorHandler, notFound} = require("./Middleware/Error/errorHandler");
const postRoutes = require("./Route/Posts/PostRoute");
const commentroutes = require("./Route/Comments/CommentRoute");
const emailMsgRoute = require("./Route/emailMsg/emailMsgRoute");
const categoryRoute = require("./Route/category/categoryRoute");

const app = express()

//DB connection
dbConnection()

//MiddleWare
app.use(express.json());

//cors

app.use(cors());


//User Routes
app.use("/api/users", userRoutes)

// Post Routes

app.use("/api/posts", postRoutes)

// Comment Routes
app.use("/api/comments", commentroutes);

//email msg
app.use("/api/email", emailMsgRoute);

//category route
app.use("/api/category", categoryRoute);

//Error Handler
app.use(errorHandler)

//Not Found Middleware
app.use(notFound)

//DB Connection

//Error Handler
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server Running on port ${PORT}`));

//Passwords are for Mongodb 8GK8Alo5N125jQBm

