const jwt = require('jsonwebtoken')

exports.requireSignIn = (req,res,next)=>{
    const jwtToken = req.headers.authorization
    if(jwtToken){
        const token = jwtToken.split(' ')[1]
    jwt.verify(token,process.env.JWT_KEY,(err,user)=>{
        if(err) return res.status(400).json(err)
        if(user){
           
            req.user = user
            next()
        }
    })
    }else{
        return res.status(400).json({
            message : 'Authorization token Required '
        })
    }
    
}
