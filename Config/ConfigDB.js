const mongoose = require("mongoose");
require("dotenv").config();

const url = "mongodb+srv://rahul:Rahul2018@cluster0.qhgtv7z.mongodb.net/?retryWrites=true&w=majority"

const connectDB = () => {
    console.log("connecting to db....")
  mongoose
    .connect(url)
    .then(() => {
      console.log("connected to db");
    })
    .catch((err) => {
      console.log("connection failed to connect db", err);
    });
};

module.exports = connectDB;