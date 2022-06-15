const mongoose = require('mongoose')
const DB = process.env.DB
const MONGO_USER = process.env.MONGO_USER
const MONGO_PASS = process.env.MONGO_PASS
mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASS}@cluster0.ve9w5.mongodb.net/${DB}?retryWrites=true&w=majority`)
.then(()=>{
    console.log('DataBase Connected');
}).catch(err=>{console.log(err)})

//mongodb+srv://ketansali:<password>@cluster0.ve9w5.mongodb.net/?retryWrites=true&w=majority