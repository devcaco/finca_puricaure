const router = require('express').Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isAuthenticated } = require('../middleware/jwt.middleware.js');

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

router.post('/signup', async (req, res, next) => {
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
    data = req.body;

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

module.exports = router;
