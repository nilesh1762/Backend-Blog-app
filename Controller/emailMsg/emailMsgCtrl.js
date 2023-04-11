const expressAsyncHandler = require("express-async-handler");
const sgMail = require("@sendgrid/mail");
const Filter = require("bad-words");
const EmailMsg = require("../../Model/EmailMessage/Emailmessaging");
const nodemailer = require("nodemailer")

const sendEmailMsgCtrl = expressAsyncHandler(async (req, res) => {
  const { to, subject, message } = req.body;
  //get the message
  const emailMessage = subject + " " + message;
  //prevent profanity/bad words
  const filter = new Filter();

  const isProfane = filter.isProfane(emailMessage);
  if (isProfane)
    throw new Error("Email sent failed, because it contains profane words.");
  try {
    //buld up msg
    const msg = {
      to,
      subject,
      text: message,
      from: "kumarnile@gmail.com",
    };
    //send msg
    // await sgMail.send(msg);
    const transporter = nodemailer.createTransport({

      service: "gmail",
      auth: {
         user: process.env.EMAIL,
         pass: process.env.PASSWORD
      }
   });
   console.log("MSG===", msg);
   transporter.sendMail(msg, (error, info) => {
  
    if(error){
       console.log("Mail-Err===", error)
    }else{
        console.log("Email-Sent===", resetURL, info);
       res.json(msg)
    }
    

 })
    //save to our db
    await EmailMsg.create({
      sentBy: req?.user?._id,
      from: req?.user?.email,
      to,
      message,
      subject,
    });
    res.json("Mail sent");
  } catch (error) {
    res.json(error);
  }
});

module.exports = { sendEmailMsgCtrl };
