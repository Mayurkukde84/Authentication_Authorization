const nodemailer = require('nodemailer')

const sendEmail = async options=>{
    //1)create a transporter
    const transporter = nodemailer.createTransport({
        //service:'gmail
        host:process.env.EMAIL_HOST,
        PORT:process.env.EMAIL_PORT,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })
    //2)Define the email options
    const mailOptions = {
        from:'Mayur Kukde <mk@gmailcom>',
        to:options.email,
        subject:options.subject,
        text:options.message
    }

    //3)Actually send the email
    await  transporter.sendMail(mailOptions)
}

module.exports = sendEmail