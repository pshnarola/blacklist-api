const BlacklistVendersReq = require('../models/BlacklistVendersReq.model')
const BlacklistedVendors = require('../models/BlacklistedVendors.model')
const moment = require('moment')
exports.blacklistRequest = (req,res)=>{
    try{
        
        const {vendorName,address,reason} = req.body
        
        const vendor = BlacklistVendersReq({vendorName,address,reason,userId:req.user.userId})
        if(req.file){
            vendor.image = req.file.filename
        }
        vendor.save((err,vendor)=>{
            if(err) return res.status(400).json(err)
            if(vendor){
                return res.status(200).json({
                    message : "Your request has been sent",
                    vendor :vendor
                })
            }
        })
    }catch(err){
        return res.status(400).json(err)
    }
}
exports.getAllRequest = async(req,res)=>{
    try{
       const venderReq = await BlacklistVendersReq.find({requestStatus:true}).populate('userId')
       if(venderReq)
       {
        return res.status(200).json(venderReq)
       }else{
        return res.status(404).json({
            message : "Don't Have any Request"
        })
       }
    }catch(err){
        return res.status(400).json(err)
    }
}
exports.rejectRequest = (req,res)=>{
    const id = req.params.id;
    const {reason} = req.body

    try {
        const { _id } = req.user.role;
        if (_id === 1) {
            BlacklistVendersReq.findOne({ _id: id }).exec(async (err, vendor) => {
                if (err) return res.status(400).json(err);
                if (vendor.requestStatus === true) {
                  await BlacklistVendersReq.updateOne(
                    { _id: vendor._id },
                    {
                        requestStatus: false,
                      reason
                    },
                    { new: true }
                  );
                  return res.status(200).json({
                    message: "Request Rejected",
                  });
                } 
              });
        } else {
            return res.status(400).json({
                message: "Required Authorization",
            });
        }
    } catch (err) {
        return res.status(400).json(err);
    }
}

exports.addReqToBlacklist = (req,res)=>{
    const id = req.params.id
    try{
        BlacklistVendersReq.findById(id).exec(async(err,vendor)=>{
            if (err) return res.status(400).json(err);
            if(vendor){
                const venderValues = BlacklistedVendors({
                    vendorName : vendor.vendorName,
                    address : vendor.address,
                    reason : vendor.reason,
                    userId:  vendor.userId,
                    adminId : req.user.userId,
                    image : vendor.image
                })
               await venderValues.save()
              await BlacklistVendersReq.deleteOne({_id:vendor._id})
               return res.status(200).json({
                   message : "Vendor Added to BlackList"
               })
            }
        })
    }catch(err){
        return res.status(400).json(err)
    }
}

exports.recentlyBlacklistedVendors = async (req,res)=>{
    const start = moment().startOf('day').subtract(30, 'day').toDate();
   const vendors = await BlacklistedVendors.find(
    {  
        createdAt: { $gte: start}  
    })
   return res.status(200).json(vendors)
} 