const  express = require('express')
const app = express()
require('dotenv').config()
require('./db/coon')
const PORT = process.env.PORT
const cors = require('cors')
const userRoutes = require('./routes/User.routes')
const blacklistedVendorRoutes = require('./routes/BlacklistedVendors.routes')
const blacklistedVendorsReqRoutes = require('./routes/BlacklistedVendorsReq.routes')

const path = require('path')



//All Routes
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname,'images')))
app.use('/api',userRoutes)
app.use('/api',blacklistedVendorRoutes)
app.use('/api',blacklistedVendorsReqRoutes)




app.listen(PORT,()=>{
    console.log(`Server is Running On PORT : ${PORT}`);
})