const main = require("../middleware/mailer");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const SubscriptionPlan = require("../models/SubscriptionPlan.model");
const moment = require("moment");
const Role = require("../models/Role.model");
const bcrypt = require("bcrypt");
exports.signUp = async (req, res) => {
  const { email, password } = req.body;
  const { name, _id } = req.body;
  try {
    const user = await User({ email, password, roleId: 1 });
    user.save((err, user) => {
      if (err) return res.status(400).json(err);
      return res.status(201).json(user);
    });
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.signIn = (req, res) => {
  const { email, password } = req.body;
  try {
    User.findOne({ email: email, })
      .populate("roleId")
      .exec(async (err, user) => {
        if (err) return res.status(400).json(err);
        if (user) {
          const isMatch = await user.authenticated(password);
          if (isMatch) {
            if (user.isActive === false) {
              return res.status(400).json({
                message: "Inactive User, Can't logIn"
              })
            }
            if (user.expiryDate <= moment()) {
              return res.status(400).json({
                message: "Your Plan is Expired"
              })
            }
            const token = await jwt.sign(
              { userId: user._id, role: user.roleId, email: user.email },
              process.env.JWT_KEY,
              {
                expiresIn: "1d",
              }
            );
            return res.status(200).json({
              message: "Login Successfully",
              user: user.roleId,
              token: token,
            });
          } else {
            return res.status(400).json({
              message: "Password Is Wrong",
            });
          }
        } else {
          return res.status(404).json({
            message: "User Not found",
          });
        }
      });
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.resetPassword = (req, res) => {
  const { email, password, newPassword } = req.body;
  try {
    User.findOne({ email: email }).exec(async (err, user) => {
      if (err) return res.status(400).json(err);
      if (user) {
        const isMatch = await user.authenticated(password);
        if (isMatch) {
          const hashPass = await bcrypt.hash(newPassword, 10);
          await User.updateOne(
            { _id: user._id },
            {
              password: hashPass,
            },
            { new: true }
          );
          return res.status(200).json({
            message: "Password updated..",
          });
        } else {
          return res.status(400).json({
            message: "Your Old Password Is Wrong..",
          });
        }
      } else {
        return res.status(404).json({
          message: "User Not Found..",
        });
      }
    });
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.forgotPassword = async (req, res) => {
  const email = req.body.email;
  User.findOne({ email: email })
    .then(async (user) => {
      const token = await jwt.sign(
        { email: email },
        process.env.JWT_KEY,
        {
          expiresIn: "1h",
        }
      );
      if (!user) return res.status(404).json({ message: 'User not Found' })
      const subject = "User Password";
      const text = "Forgot User Password";
      const link = `http://localhost:3000/forgotpassword/${token}`
      const html = "<p>You have request for Forgot Password</p><br><p><a href='" + link + "'> Click this </a> To Set New Password</p>";

      await main(email, subject, text, html);

      return res.status(200).json({ message: 'Reset Link has sent on your Email' })
    })
    .catch(err => {
      return res.status(400).json(err)
    });


};
exports.updatePassword = async (req, res) => {
  const newPassword = req.body.password
  const token = req.body.token
  if (token) {
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
      if (err) return res.status(400).json({ message: 'Link is Expire' })
      if (user) {
        User.findOne({
          email: user.email
        })
          .then(async (user) => {
            if (!user) return res.status(404).json({ message: 'User Not Found' })
            user.password = newPassword
            await user.save()
            return res.status(200).json({ message: 'Password is Updated' })
          })
          .catch(err => {
            return res.status(400).json(err)
          });

      }
    })
  } else {
    return res.status(400).json({
      message: 'Authorization token Required '
    })
  }
};

exports.createUser = async (req, res) => {
  const { firstName, lastName, email, mobileNo, expiryDate, plan } = req.body;

  const E_Date = await expireDatePlan(expiryDate);

  try {
    const user = await User({
      firstName,
      lastName,
      email,
      mobileNo,
      plan,
      roleId: 2,
    });
    const pass = await genPassword();
    user.password = pass;
    user.expiryDate = E_Date;

    const { _id } = req.user.role;

    if (_id === 1) {
      User.findOne({ email: email }).exec((err, _user) => {
        if (_user) {
          return res.status(400).json({
            message: 'User Already Existed'
          })
        }
        user.save(async (err, user) => {
          if (err) return res.status(400).json(err);
          if (user) {
            const subject = "Your Password for find black-list"
            const text = "Here is your logInId and Password for Admin Access "
            const html = `<p>Email : ${user.email}<br>
            Password : ${pass}</p>`;
            await main(user.email, subject, text, html);
            return res.status(201).json({
              message: "User Created Successfully",
              user: user,
            });
          }
        });
      })

    } else {
      return res.status(400).json({
        message: "Required Authorization",
      });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ roleId: 2, isActive: true })
      .populate("roleId plan")
      .select("-password");
    if (users) {
      return res.status(200).json(users);
    } else {
      return res.status(404).json({
        message: "Users Not Found ",
      });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};
exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    const { _id } = req.user.role;
    if (_id === 1) {
      const deletedUser = await User.findByIdAndDelete(id);
      if (deletedUser) {
        return res.status(200).json({
          message: "User Deleted",
        });
      } else {
        return res.status(404).json({
          message: "User Not Deleted",
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
};
exports.updateUser = async (req, res) => {
  const { firstName, lastName, email, mobileNo } = req.body;
  const id = req.params.id;

  try {
    const { _id } = req.user.role;
    if (_id === 1) {
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          firstName,
          lastName,
          email,
          mobileNo,
        },
        { new: true }
      );
      if (updatedUser) {
        return res.status(200).json({
          message: "User Updated",
          user: updatedUser,
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
};

exports.userActiveOrInActive = async (req, res) => {
  const id = req.params.id;
  try {
    const { _id } = req.user.role;
    if (_id === 1) {
      User.findOne({ _id: id }).exec(async (err, user) => {
        if (err) return res.status(400).json(err);
        if (user.isActive === true) {
          await User.updateOne(
            { _id: user._id },
            {
              isActive: false,
            },
            { new: true }
          );
          return res.status(200).json({
            message: "User is Now InActive",
          });
        } else {
          await User.updateOne(
            { _id: user._id },
            {
              isActive: true,
            },
            { new: true }
          );
          return res.status(200).json({
            message: "User is Now Active",
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
};

exports.extendExpiryDate = (req, res) => {
  const id = req.params.id;
  const { expiryDate } = req.body;

  try {
    const { _id } = req.user.role;
    if (_id === 1) {
      User.findOne({ _id: id }).exec(async (err, user) => {
        if (err) return res.status(400).json(err);
        if (user) {
          await User.updateOne(
            { _id: user._id },
            {
              expiryDate,
            },
            { new: true }
          );
          return res.status(200).json({
            message: "Expiry Date Is Extended",
          });
        } else {
          return res.status(404).json({
            message: "Plan not found",
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
};

function genPassword() {
  var chars =
    "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var passwordLength = 8;
  var password = "";
  for (var i = 0; i <= passwordLength; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    password += chars.substring(randomNumber, randomNumber + 1);
  }
  const pass = `A@p#1${password}`
  return pass;

}

function expireDatePlan(Expiry) {
  let E_Date;

  if (Expiry === 3) {
    E_Date = moment().add(3, "M").format("YYYY-MM-DD");
  } else if (Expiry === 6) {
    E_Date = moment().add(6, "M").format("YYYY-MM-DD");
  } else if (Expiry === 12 || Expiry === 1) {
    E_Date = moment().add(12, "M").format("YYYY-MM-DD");
  }
  return E_Date;
}
exports.auth = (req, res) => {
  return res.status(200).json(req.user.user.Role);
};
