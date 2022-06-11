const mongoose  = require('mongoose')

const roleSchema = new mongoose.Schema({
    _id :  { type: Number,required : true },
    name: {
        type: String,
        required : true
    },
    
    
})
module.exports = mongoose.model('Role',roleSchema)