const mongoose = require('mongoose')
const DB = process.env.DB
mongoose.connect('mongodb+srv://ketansali:Ketan7600@cluster0.ve9w5.mongodb.net/findBlackList?retryWrites=true&w=majority')
    .then(() => {
        console.log('DataBase Connected');
    }).catch(err => { console.log(err) })
