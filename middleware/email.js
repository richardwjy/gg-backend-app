const send = (emailaddress, token, type) => {
    const baseUrl = process.env.redirect_url
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ACC,
            pass: process.env.EMAIL_PASS
        }
    })
    const forgetPassText = `<p>Your reset password link is : <a href=${baseUrl + "/change-password/" + token}>Reset password</a>
        This link is only alive for 20 minutes!</p>`
    const verifyEmailText = `<p>Verify your GG Invoice Application account by clicking link is : <a href=${baseUrl + "/verify-account/" + token}>Reset password</a>
        This link is only alive for 1 hour!</p>`
    const mailOptions = {
        from: process.env.EMAIL_ACC,
        to: emailaddress,
        subject: "Gudang Garam - Reset Password",
        html: `
        <p>Please ignore this email if you never requested to change password</p>
        ${type === "Verify" ? verifyEmailText : forgetPassText}
        `
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err)
            throw new Error(`Error while sending email: ${err.message}`)
        } else {
            console.log(info.response)
        }
    })
}

module.exports = { send };