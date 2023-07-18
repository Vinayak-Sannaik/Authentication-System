require('dotenv').config();
const userModel = require('../models/user');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const SECRETE_KEYWORD = "authentication"
const nodemailer = require('nodemailer');

const showRejPage = (req, res) => {
  res.render('register');
}

const showLogPage = (req, res) => {
  res.render('login')
}

const submitForm = async (req, res) => {
  // Process the form data and perform any necessary actions
  // Existing user Check

  try {
    const { name, email, password } = req.body;

    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists 1" });
    }
    // Hashed Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // User Creation
    const result = await userModel.create({
      email: email,
      password: hashedPassword,
      name: name
    });

    // Token Generation
    const token = jwt.sign({ email: result.email, id: result._id }, SECRETE_KEYWORD);
    // res.status(201).json({user : result,token : token});
    res.redirect('login');

  } catch (error) {
    console.log(error);
  }
}

const signIn = async (req, res) => {

  try {
    const { email, password } = req.body

    const existingUser = await userModel.findOne({ email: email });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if (!matchPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, SECRETE_KEYWORD);
    // res.status(201).json({user : existingUser,token : token});
    res.render('home');

  } catch (error) {
    console.log(error);
  }
}

// forgot password reset link sending
const showResetPage = async (req, res) => {
  try {
    res.render('forgetPassword');
  } catch (error) {
    console.log(error.message)
  }
}

const resetPassword = async (req, res) => {
  try {
    const { email } = req.body

    const oldExistingUser = await userModel.findOne({ email: email });
    if (!oldExistingUser) {
      return res.status(400).json({ message: "User not found" });
    }
    // create secret token using jwt + user password
    const secret = SECRETE_KEYWORD + oldExistingUser.password;
    const token = jwt.sign({ email: oldExistingUser, id: oldExistingUser._id }, secret, {
      expiresIn: "5m",
    });

    const link = `http://localhost:3000/forgetPassword/${oldExistingUser._id}/${token}`;
    // console.log(link);
    // res.redirect('forgetPassword');


    // sending mail to user with reset password link using nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      }
    });

    const mailOptions = {
      from: process.env.USER,
      to: 'vinayaksannaik@gmail.com',
      subject: 'Password Reset',
      text: link,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    res.send(`
    <html>
      <head>
        <script>
          alert('Check Your Mail box!!');
        </script>
        <style>   
         
        a {
          text-decoration: none;
          color: #ffffff;
        }
        button {
          padding: 10px 20px;
          background-color: #2d2a6e;
          color: #f0e6e6;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>
      </head>
      <body>
      <div style="text-align : center">
        Thank You!!
        <button><a href="login">Log-In</a></button>
      </body>
      </div>
    </html>
  `);

  } catch (error) {
    console.log(error.message);
  }
}

const verifyUser = async (req, res) => {
  const { id, token } = req.params;
  // console.log(req.params);
  const oldUser = await userModel.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User not found" });
  }
  const secret = SECRETE_KEYWORD + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    //  res.send("Verified");
    //  console.log({email:verify.email})
    //  console.log(verify.email);
    res.render("resetPassword", { email: verify.email });
  } catch (error) {
    console.log(error)
    res.json({ status: "Not Verified" });
  }
}

const reVerifyUser = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body
  const oldUser = await userModel.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User not found" });
  }
  const secret = SECRETE_KEYWORD + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await userModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      });
    res.json({ status: "Password Updated" })
    
  } catch (error) {
    console.log(error)
    res.json({ status: "something went wrong" });
  }
}


module.exports = {
  submitForm,
  showRejPage,
  showLogPage,
  signIn,
  showResetPage,
  resetPassword,
  verifyUser,
  reVerifyUser
};
