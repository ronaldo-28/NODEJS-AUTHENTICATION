     const mongoose = require("mongoose");
     require("dotenv").config()


     mongoose.connect("mongodb://127.0.0.1:27017/AuthApp")
         .then(() => { console.log('database conected successfully') })
         .catch((error) => { console.log(error) })