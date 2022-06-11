
const { requireSignIn } = require('../middleware')

const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const shortId = require('shortid')
const { blacklistRequest, getAllRequest, rejectRequest, addReqToBlacklist, recentlyBlacklistedVendors } = require('../controller/BlacklistVendersReq.controller')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.dirname(__dirname) + '/images')
    },
    filename: function (req, file, cb) {
        
      cb(null, shortId.generate() +'-'+ file.originalname )
    }
  })
  
  const upload = multer({ storage: storage })

router.post('/vendor/blacklistRequest',requireSignIn, upload.single('image'),blacklistRequest)
router.get('/vendor/getAllRequest',requireSignIn,getAllRequest)
router.post('/vendor/rejectRequest/:id',requireSignIn,rejectRequest)
router.post('/vendor/addReqToBlacklist/:id',requireSignIn,addReqToBlacklist)
router.get('/vendor/recentlyBlacklistedVendors',requireSignIn,recentlyBlacklistedVendors)



module.exports = router
