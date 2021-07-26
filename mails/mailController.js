const config = require('../config/config')
const nodeMailer = require('nodemailer');
const welcomeMailHTML = require('./mailTemplates/welcome-mail');
const forgotPasswordMail = require('./mailTemplates/forget-password')



const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
            user: config.mailAccount,
            pass: config.mailAccountPassword
        }
    })
    
    
const sendWelcomeMail = (userMail, userName)=>{

    return new Promise((resolve, reject)=>{

        welcomeMailHTML(userName).then(content=>{

            mailOptions = {
                from: config.mailAccount,
                to: userMail,
                subject: 'Greeting Message',
                text: content.plainMessage,
                html: content.htmlMessage
            };

            transporter.sendMail(mailOptions)
            .then(info=>resolve(true))
            .catch(err=>reject(err));
    })
    })
    
};


const adminForgotPassword = (adminMail, resetLink)=>{
    return new Promise((resolve, reject)=>{
        forgotPasswordMail(adminMail, resetLink)
        .then(content=>{
        mailOptions = {
            from: config.mailAccount,
            to: adminMail,
            subject: 'Reset Password',
            text: content.plainMessage,
            html: content.htmlMessage
        }

        transporter.sendMail(mailOptions)
        .then(info=>resolve(true))
        .catch(error=>reject(err))
    })
})



}

module.exports = { sendWelcomeMail, adminForgotPassword } 