const {
  signUp,
  signIn,
  resetPassword,
  forgotPassword,
  createUser,
  getAllUsers,
  deleteUser,
  updateUser,
  inActivePlan,
  ActivePlan,
  createRole,
  userActiveOrInActive,
  extendExpiryDate,
  updatePassword,
} = require("../controller/User.controller");
const { requireSignIn, verifyExpireToken } = require("../middleware");

const router = require("express").Router();

router.post("/user/signUp", signUp);
router.post("/user/signIn", signIn);
router.post("/user/resetPassword", resetPassword);
router.post("/user/forgotPassword", forgotPassword);
router.post("/user/updatePassword", updatePassword);
router.post("/user/createUser", requireSignIn, createUser);
router.get("/user/getAllUsers", requireSignIn, getAllUsers);
router.post("/user/deleteUser/:id", requireSignIn, deleteUser);
router.post("/user/updateUser/:id", requireSignIn, updateUser);
router.post(
  "/user/userActiveOrInActive/:id",
  requireSignIn,
  userActiveOrInActive
);
router.post("/user/extendExpiryDate/:id", requireSignIn, extendExpiryDate);

module.exports = router;
