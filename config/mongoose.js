const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(
    "mongodb+srv://ronaldo:ronaldo28@cluster0.dv8djaj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("database conected successfully");
  })
  .catch((error) => {
    console.log(error);
  });
