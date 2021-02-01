var express = require('express');
var router = express.Router();
const pug = require('pug');
const path = require('path');
var mongodb = require('mongodb');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
require('dotenv').config({ path: path.join(__dirname, "../bin/.env") })
const MongoClient = require('mongodb').MongoClient
const uri = `mongodb+srv://dBanusu90:${process.env.DB_PASS}@Cluster0.xudfg.mongodb.net/<dbname>?retryWrites=true&w=majority`;

var jwt = require('jsonwebtoken')

// SETTING CONSTANTS
let frontEndURL = "http://127.0.0.1:5500/JS/NODE-PASSWORD-RESET/NODE_PASS_RES_FRONTEND/index.html"


//IMPORTING MAILSEND JS

// let mailSendPath = "../public/javascripts/mailsend.js"
let mailSendPath = "../bin/mailsend.js"
let { welcomeMail, problemSigningIn } = require(mailSendPath)

const user2 = {
  name: "Anunay",
  email: 'anusu90@gmail.com'
}

// problemSigningIn(user2);

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});


router.get('/showusers', async function (req, res) {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("connection done")
    let userDBCollection = client.db('user-flow').collection("users");
    let findAll = await userDBCollection.find().toArray();
    await client.close();
    res.json(findAll);

  } catch (error) {
    console.log(error)
  }
});


router.get('/checkActiveState/:email', async function (req, res) {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("connection done")
    let userDBCollection = client.db('user-flow').collection("users");
    let findUser = await userDBCollection.findOne({ email: req.params.email })
    await client.close();
    res.json({
      "activeState": findUser.isActive,
    });

  } catch (error) {
    console.log(error)
  }
});

/////////LOGIN BACKEND

router.post("/login", async (req, res) => {
  try {
    console.log("i am anunay");
    console.log(req.body);
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let conn = await client.connect();
    // console.log(conn);
    let userDBCollection = client.db('user-flow').collection("users");
    let user = await userDBCollection.findOne({
      email: req.body.email
    });

    if (user && user.isActive) {
      let compare = await bcrypt.compare(req.body.password, user.password);
      if (compare === true) {
        let token = jwt.sign({ user: user }, process.env.RANDOM_KEY_FOR_JWT, { expiresIn: 20 })
        console.log(token)
        //Generate Token
        console.log(user);
        // const authHeader = {'authorization': `BEARER ${token}`}
        // res.cookie("jwt2", token)
        res.status(200).json({
          'authorization': `BEARER ${token}`
        })
        // res.json(user);
      } else {
        res.status(401).json({
          "message": "Invalid password"
        })
      }
    } else {
      res.status(401).json({
        "message": "Invalid user or Inactive user"
      })

    }

    await client.close();


  } catch (error) {

    console.log(error);

  }
})


///REGISTRATION BACK END
router.post("/registeruser", async (req, res) => {

  try {
    console.log(req.body);
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    let userDBCollection = client.db('user-flow').collection("users");
    let user = await userDBCollection.findOne({
      email: req.body.email
    });

    if (user) {

      res.status(404).json({
        "message": "the email address already exists please go through forgot password"
      })
    } else {

      let randString = require('crypto').randomBytes(8).toString('hex')
      let salt = await bcrypt.genSalt(10)
      let hashedPass = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPass;
      req.body.isActive = false;
      req.body.randString = randString;
      // console.log(hashedPass);

      let input = await userDBCollection.insertOne(req.body);
      await client.close();

      if (input.insertedCount === 1) {
        welcomeMail(req.body, randString);
        res.status(200).json({
          "message": "user inserted"
        })
      } else {
        res.status(404).json({
          "message": "User insertion failed"
        })
      }
    }

  } catch (error) {
    console.log(error)
  }

})


router.get("/activateuser/:urlParams", async (req, res) => {
  let urlDataString = req.params.urlParams
  let urlData = urlDataString.split('&').map(v => v.split('='))
  userEmail = urlData[0][1];
  randKey = urlData[1][1];
  timeOfVerification = urlData[2][1];

  console.log(Date.now() - timeOfVerification);

  if ((Date.now() - timeOfVerification) > 1000 * 60 * 60) {
    res.status(404).json({
      "message": "Activation timed out. Please re-register"
    })
  } else {
    try {
      const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      let conn = await client.connect();
      let userDBCollection = client.db('user-flow').collection("users");
      let user = await userDBCollection.findOne({
        email: userEmail
      });

      console.log(user);

      if (user) {
        if (user.randString == randKey) {

          let updateStatus = await userDBCollection.updateOne({ email: userEmail }, { $set: { isActive: true } });

          if (updateStatus.modifiedCount === 1) {

            let message = "success"
            res.render("../views/verification/verificationInProgress.pug", { email: userEmail, message: message }, (err, html) => {
              if (err) throw err;
              res.send(html);
            })
          } else {
            let message = "Unknown error occuered";
            res.render("../views/verification/verificationInProgress.pug", { email: userEmail, message: message }, (err, html) => {
              if (err) throw err;
              res.send(html);
            })
          }

          // Update the user as active
        } else {

          let message = "Invalid random key";
          res.render("../views/verification/verificationInProgress.pug", { email: userEmail, message: message }, (err, html) => {
            if (err) throw err;
            res.send(html);
          })
        }
      } else {

        let message = "Invalid user";
        res.render("../views/verification/verificationInProgress.pug", { email: userEmail, message: message }, (err, html) => {
          if (err) throw err;
          res.send(html);
        })
      }
      await client.close();
    } catch (error) {
      console.log(error);
    }
  }

})

//MANAGE DASHBOARD

router.get("/dashboard", authDashBoard, (req, res) => {
  console.log("I am reaching till here")
  res.status(200).json({
    "message": req.body.userEmail
  })
})

function authDashBoard(req, res, next) {
  if (req.headers.authorization) {
    let myVerifiedUser = (jwt.verify(req.headers.authorization.split(" ")[1], process.env.RANDOM_KEY_FOR_JWT));
    if (myVerifiedUser) {
      req.body.userEmail = myVerifiedUser.user.email
      next();
    } else {
      // res.status(400).json({message: "Invalid access"})
      console.log("Dil bole hadippa")
      res.status(400).render("../views/login/invalidaccess.pug")
    }

  } else {
    // res.status(400).json({message: "Invalid access"})
    res.status(400).render("../views/login/invalidaccess.pug")
  }
}


///////////////////////////////////////////////////FORGOT PASSWORD ROUTE///////////////////////////////////////////////////

router.post("/forgotpassword", async (req, res) => {
  passwordResetEmail = req.body.email;

  console.log(req.headers)

  //first we will search for this email in DB

  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    let userDBCollection = client.db('user-flow').collection("users");
    let user = await userDBCollection.findOne({
      email: passwordResetEmail
    });

    if (user) {
      console.log(user)
      let tokenReset = jwt.sign(user, process.env.RANDOM_KEY_FOR_JWT, { expiresIn: 300 });


      // Set-Cookie: resetSariOkayAuth=tokenReset; HttpOnly;

      await userDBCollection.updateOne({
        email: passwordResetEmail
      }, { $set: { isPassChangeAllow: true } });

      problemSigningIn(user);

      res.cookie('sariOkayReset', tokenReset, { httpOnly: true, sameSite: 'lax' })
      // res.setHeader("sariOkayReset", tokenReset)
      res.status(200).json({
        message: "User found. A password reset email has been despatched to your email. Kindly use the link there to reset your password",
      })
    } else {
      res.status(404).json({
        message: "No user found. Kindly recheck the email."
      })
    }

  } catch (error) {

    console.log(error);

  }

})

router.get("/resetpassword/:urlParams", async (req, res) => {

  console.log(req.headers)
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  let userDBCollection = client.db('user-flow').collection("users");

  let urlDataString = req.params.urlParams
  try {
    console.log(urlDataString)
    let urlData = urlDataString.split('&').map(v => v.split('='));
    passwordResetEmail = urlData[0][1];
    timeOfVerification = urlData[1][1];
    console.log(Date.now() - timeOfVerification);

    let user = await userDBCollection.findOne({
      email: passwordResetEmail
    });

  } catch (error) {

  }

  res.status(200).sendFile(path.join(__dirname, "../privatehtml/passwordchange.html"));

  // WE WILL NOW NOT ALLOW THE PASS CHANGE TO HAPPEN
  // await userDBCollection.updateOne({
  //   email: passwordResetEmail
  // }, {$set : { isPassChangeAllow: false }});

})

router.post("/changeuserpassword", authResetPass, (req, res) => {

  console.log("we Came here");

})

function authResetPass(req, res, next) {
  console.log(req.headers.authorization)
  if (req.headers.authorization) {
    let myVerifiedUser = (jwt.verify(req.headers.authorization.split(" ")[1], process.env.RANDOM_KEY_FOR_JWT));
    if (myVerifiedUser) {
      req.body.userEmail = myVerifiedUser.user.email
      next();
    } else {
      console.log("Dil bole hadippa")
      res.status(400).render("../views/login/invalidaccess.pug")
    }

  } else {
    // res.status(400).json({message: "Invalid access"})
    console.log("Dil bole fir se hadippa")
    res.status(400).render("../views/login/invalidaccess.pug")
  }
}


/////////////////////////////////////////////////// TEMP ///////////////////////////////////////////////////

router.get('/pug', function (req, res) {

  loginFormPath = path.join(__dirname, "../views/verification/verificationInProgress.pug");

  let outhtml = pug.renderFile(loginFormPath, {
    title: "Welcome",
    userName: "Anunay Sinha"
  });

  let pageVerificationComplete = "../views/verification/verificationSuccess.pug"

  // res.render(pageVerificationComplete)


  res.status(200).render("../views/verification/verificationInProgress.pug", { email: "anusu90@gmail.com" }, (err, html) => {
    if (err) throw err;
    res.send(html);
  })

  // console.log(outhtml);
  // res.send(outhtml)

});





module.exports = router;
