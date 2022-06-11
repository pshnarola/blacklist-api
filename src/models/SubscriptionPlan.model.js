const mongoose  = require('mongoose')

const subscriptionPlanSchema = new mongoose.Schema({
    _id : {
        type : Number,
        required : true
    },
    title: {
        type: String,
        required : true
    },
    validity : {
        type : Number,
        required : true
    }
})
module.exports = mongoose.model('SubscriptionPlan',subscriptionPlanSchema)