const nodemailer = require("nodemailer");
const crypto = require("crypto");

const backendURL = "http://localhost:3002/users"

// const user = {
//     name: "Anunay",
//     email: 'anusu90@gmail.com'
// }
// let randString = crypto.randomBytes(8).toString('hex')

async function welcomeMail (user,randString) {
    let dtnow = Date.now()

    console.log(dtnow, Date.now(), Date.now() - dtnow);

    let urlToSend = backendURL + "/activateuser/" + 'user=' + user.email +'&randKey=' + randString + "&dtNow=" + dtnow;

    const mailToUser = {
        from: "sariokay@yahoo.com",
        to: user.email,
        subject: `Welcome ${user.name}, your account is due activation.`,
        replyTo: "sariokay@yahoo.com",
        text: `Dear ${user.name}, we are glad to have you onboard. Please click on the following link to get your account activated. URL is ${urlToSend}`,
        html: `<p>Dear ${user.name}, we are glad to have you onboard. Please click on the following link to get your account activated. <br><br> URL is ${urlToSend} <br>`+
        ` or you may also click the following buttom: <br><br> </p>`+
        `<a href = "${urlToSend}"> <button style="display: inline-block; background-color: rgb(26, 22, 224); color: white; height: 36px; border: transparent solid; border-radius: 5px; padding: 5px;" >Click Here</button> </a>`
    };
    
    const transporter = nodemailer.createTransport({
        service: 'yahoo',
        auth: {
            user: "sariokay@yahoo.com",
            pass: 'wfexyufcsvonksvf'
        }
    });
    
    await transporter.sendMail(mailToUser)
}


async function problemSigningIn(user){
    console.log(user);
}

module.exports = {welcomeMail: welcomeMail, problemSigningIn:problemSigningIn};