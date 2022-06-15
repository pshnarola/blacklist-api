const nodemailer = require("nodemailer")


async function main(email,subject,text,html) {
  try{
    if (email) {
      // let testAccount = await nodemailer.createTestAccount();
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.Email, // generated ethereal user
          pass: process.env.Email_PASS, // generated ethereal password
        },
      });
  
      let info = await transporter.sendMail({
        from: `Find Black-list ${process.env.Email}`, // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html // html body
      });
  
      console.log("Message sent: %s", info.messageId);
      // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  }catch(err){
     throw Error(err)
  }
  
}

main().catch(console.error);
module.exports = main