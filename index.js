const express = require("express");
const app = express();
require("dotenv").config();
const PORT = 8000;
const cors = require('cors');

const Route = require("./Routes/routes")

app.use(cors());
app.use(express.json());
const connectDB = require("./Config/ConfigDB");
connectDB(); //conntecting to the databse



app.use("/api",Route);


app.use((req, res, next) => {
  const error = new Error("Could not find this route.");
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

app.listen(PORT, () => {
  console.log("localhost:", PORT);
});

