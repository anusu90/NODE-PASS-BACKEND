var express = require('express');
var router = express.Router();
const pug = require('pug');
const path = require('path');
var mongodb = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, "../bin/.env") })
const MongoClient = require('mongodb').MongoClient
const uri = `mongodb+srv://dBanusu90:${process.env.DB_PASS}@Cluster0.xudfg.mongodb.net/<dbname>?retryWrites=true&w=majority`;


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

/////////LOGIN BACKEND

router.post("/login", async (req, res) => {
  try {
    console.log(req.body);

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    let conn = await client.connect();
    console.log(conn);
    let userDBCollection = client.db('user-flow').collection("users");
    let user = await userDBCollection.findOne({
      email: req.body.email
    });

    if (user) {
      let compare = await bcrypt.compare(req.body.password, user.password);
      if (compare === true) {
        //Generate Token
        console.log(user);
        res.json(user);
      } else {
        res.status(401).json({
          "message": "Invalid password"
        })
      }
    } else {
      res.status(401).json({
        "message": "Invalid user"
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

      let salt = await bcrypt.genSalt(10)
      let hashedPass = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashedPass;
      req.body.isActive = false;
      console.log(hashedPass);

      let input = await userDBCollection.insertOne(req.body);
      await client.close();

      if (input.insertedCount === 1) {
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







router.get('/pug', function (req, res) {

  loginFormPath = path.join(__dirname, "../views/loginForm.pug");

  let outhtml = pug.renderFile(loginFormPath, {
    title: "Hello",
    message: "Anunay Sinha"
  });
  console.log(outhtml);
  res.send(outhtml)

});





module.exports = router;
