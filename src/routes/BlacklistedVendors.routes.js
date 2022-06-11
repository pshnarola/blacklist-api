const {addToBlacklist, listOfBlackListVendor, updateVendor, removeToBlacklist, updateCategory } = require('../controller/BlacklistedVendors.controller')
const { requireSignIn } = require('../middleware')

const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const shortId = require('shortid')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.dirname(__dirname) + '/images')
    },
    filename: function (req, file, cb) {
        
      cb(null, shortId.generate() +'-'+ file.originalname )
    }
  })
  
  const upload = multer({ storage: storage })

router.post('/vendor/addToBlacklist',requireSignIn,upload.single('image'),addToBlacklist)
router.get('/vendor/listOfBlackListVendor',requireSignIn,listOfBlackListVendor)
router.post('/vendor/updateVendor/:id',requireSignIn,updateVendor)
router.post('/vendor/removeToBlacklist/:id',requireSignIn,removeToBlacklist)
router.post('/vendor/updateCategory/:id',requireSignIn,updateCategory)



module.exports = router
