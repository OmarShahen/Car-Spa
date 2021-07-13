const config = require('../config/config')
const nodeMailer = require('nodemailer');
const welcomeMailHTML = require('./mailTemplates/welcome-mail');

const sendWelcomeMail = (userMail, userName)=>{

    return new Promise((resolve, reject)=>{

        welcomeMailHTML(userName).then(content=>{

            const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                    user: config.mailAccount,
                    pass: config.mailAccountPassword
                }
            });


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

module.exports = sendWelcomeMail;