const nodemailer = require('nodemailer');

const sendEmail = async options => {
    
     const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    //Define the email option
     const mailoption = {
         from: 'Nilesh Kumar <Nilesh@gang.io>',
         to: options.email,
         subject: options.subject,
         text: options.message
     }

    //Acutally send email

   await transporter.sendMail(mailoption)
};

module.exports = sendEmail