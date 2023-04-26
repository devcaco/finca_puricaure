const router = require('express').Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isAuthenticated } = require('../middleware/jwt.middleware.js');
const fileUploader = require('../config/cloudinary.config');

const saltRounds = 10;

router.get('/', async (req, res, next) => {
  try {
    const userList = await User.find();
    res.status(200).json({ ok: true, users: userList });
  } catch (err) {
    console.log('ERROR -> ', err);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});
router.get('/verify', isAuthenticated, (req, res, next) => {
  try {
    // If JWT token is valid the payload gets decoded by the
    // isAuthenticated middleware and made available on `req.payload`

    // Send back the object with user data
    // previously set as the token payload
    res.status(200).json({ ok: true, payload: req.payload });
  } catch (err) {
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const data = req.body;
    console.log({ data });

    if (!data.fname || !data.lname || !data.email || !data.password)
      throw new Error('Required Fields are missing');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(data.email)) throw new Error('Invalid E-Mail format');

    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(data.password))
      throw new Error('Password is to weak');

    const checkUser = await User.findOne({ email: data.email });

    if (checkUser) throw new Error('Email address already registered');

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(data.password, salt);

    const newUser = await User.create({
      fname: data.fname,
      lname: data.lname,
      email: data.email,
      password: hashedPassword,
    });

    if (!newUser) throw new Error('Error registering user');

    res.status(200).json({ ok: true, newUser });
  } catch (err) {
    console.log('ERROR -> ', err);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const data = req.body;

    if (!data.userName || !data.pwd)
      throw new Error('Required fields are missing');

    const theUser = await User.findOne({ email: data.userName });

    if (!theUser) throw new Error('No User found with that email address');

    const passwordOk = await bcrypt.compare(data.pwd, theUser.password);

    if (!passwordOk) throw new Error('Invalid Password');

    const payload = {
      _id: theUser._id,
      email: theUser.email,
      name: theUser.fname + ' ' + theUser.lname,
      fname: theUser.fname,
      lname: theUser.lname,
      picture: theUser.profilePicture,
    };

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: 'HS256',
      expiresIn: '6h',
    });

    res.status(200).json({ authToken, ok: true, theUser });
  } catch (err) {
    console.log('ERROR -> ', err);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.patch(
  '/',
  fileUploader.single('profilePicture'),
  async (req, res, next) => {
    try {
      const data = req.body;
      const file = req.file;
      console.log({ data });
      console.log({ file });

      if (!data._id || !data.fname || !data.lname || !data.email)
        throw new Error('Required Fields Missing');

      if (data.changePwd === 'true' && (!data.password || !data.password_2))
        throw new Error('Password fields required');
      if (data.changePwd && data.password !== data.password_2)
        throw new Error('Passwords do not match');

      let user = await User.findOne({ _id: data._id });

      if (!user) throw new Error('User not found');

      if (data.changePwd === 'true') {
        const pwdOk = await user.checkPwd(data.oldPassword);
        if (!pwdOk) throw new Error('Incorrect Current Password');

        const encryptedPwd = await User.hashPwd(data.password);
        if (!encryptedPwd) throw new Error('Error Saving Password');

        user.password = encryptedPwd;
        user = await user.save();
      }

      user.fname = data.fname;
      user.lname = data.lname;
      user.email = data.email;

      if (req.file) {
        user.profilePicture = req.file?.path;
      } else if (data.isUserPicture === 'false') {
        user.profilePicture = '';
      }
      const updatedUser = await user.save();

      console.log({ updatedUser });

      res.status(200).json({ ok: true, updatedUser });
    } catch (err) {
      console.log('ERROR -> ', err);
      res.status(200).json({ ok: false, errorMsg: err.message });
    }
  }
);

module.exports = router;
