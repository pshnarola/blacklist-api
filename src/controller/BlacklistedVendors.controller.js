const BlacklistedVendors = require('../models/BlacklistedVendors.model')
require('../models/Category.model')
exports.addToBlacklist =  async(req,res)=>{
    const {vendorName, address, reason} = req.body
    const venderValues = {
        vendorName, address, reason,adminId:req.user.userId
    }
    
    try{
        const { _id } = req.user.role;
        if(_id === 1){
            if(req.file){
                venderValues.image = req.file.filename
            }
            const vendor = await BlacklistedVendors(venderValues)
        vendor.save((err,vendor)=>{
            if(err) return res.status(400).json(err)
            if(vendor){
                return res.status(201).json({
                    message : 'Vendor Added to Blacklist',
                    vendor:vendor
                })
            } 
        })
        }else{
            return res.status(400).json({
                message: "Required Authorization",
              });
        }
        
    }catch(err){
        return res.status(400).json(err)
    }
}

exports.listOfBlackListVendor = async(req,res)=>{
    try{
        const blacklistedVendors = await BlacklistedVendors.find({isActive : true}).populate('category')
        if(blacklistedVendors){
            return res.status(200).json(blacklistedVendors)
        }else{
            return res.status(404).json({
                message : "Vendor Not Found"
            })
        }
    }catch(err){
        return res.status(400).json(err)
    }
}

exports.updateVendor = async (req,res)=>{
    const {vendorName, address, reason} = req.body
    const id = req.params.id;

    try {
        const { _id } = req.user.role;
        if (_id === 1) {

            const updatedBlacklistedVendors = await BlacklistedVendors.findByIdAndUpdate(
                id,
                {
                    vendorName, address, reason
                },
                { new: true }
            );
            if (updatedBlacklistedVendors) {
                return res.status(200).json({
                    message: "Vendor Updated",
                    user: updatedBlacklistedVendors,
                });
            }
        } else {
            return res.status(400).json({
                message: "Required Authorization",
            });
        }
    } catch (err) {
        return res.status(400).json(err);
    }
}
exports.removeToBlacklist =  (req,res)=>{
   
    const id = req.params.id;
    const {reason} = req.body

    try {
        const { _id } = req.user.role;
        if (_id === 1) {
            BlacklistedVendors.findOne({ _id: id }).exec(async (err, vendor) => {
                if (err) return res.status(400).json(err);
                if (vendor.isActive === true) {
                  await BlacklistedVendors.updateOne(
                    { _id: vendor._id },
                    {
                    isActive: false,
                      reason
                    },
                    { new: true }
                  );
                  return res.status(200).json({
                    message: "Vendor is Removed from Blacklist",
                  });
                } else {
                  await BlacklistedVendors.updateOne(
                    { _id: vendor._id },
                    {
                        isActive: true,
                    },
                    { new: true }
                  );
                  return res.status(200).json({
                    message: "Vendor is Add to Blacklist",
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
exports.updateCategory = async (req,res)=>{
    const {category} = req.body
    const id = req.params.id;
    try {
        const { _id } = req.user.role;
        if (_id === 1) {

            const updatedCategory = await BlacklistedVendors.findByIdAndUpdate(
                id,
                {
                    category
                },
                { new: true }
            );
            if (updatedCategory) {
                return res.status(200).json({
                    message: "Category Updated",
                });
            }
        } else {
            return res.status(400).json({
                message: "Required Authorization",
            });
        }
    } catch (err) {
        return res.status(400).json(err);
    }
}