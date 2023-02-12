/* eslint-disable no-useless-catch */
const express = require("express");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getUserByUsername, createUser } = require("../db");
const { UserTakenError, PasswordTooShortError, UnauthorizedError } = require("../errors");
const router = express.Router();

// POST /api/users/register
router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
  
    try {
      const existingUser = await getUserByUsername(username);

      if (existingUser) {
       next({
        name:"UserTakenError",
        message: UserTakenError(username),
        error: UserTakenError(username),
       })
      } else if (password.length < 8) {
        next({
          message: "Password Too Short!",
          name: PasswordTooShortError(password),
          error: PasswordTooShortError(password),
        })
      } else {
      const newUser = await createUser({
        username,
        password,
      });

      const token = jwt.sign({ 
        id: newUser.id, 
        username: newUser.username
      }, process.env.JWT_SECRET, {
        expiresIn: '1w'
      });

      res.send({ 
        message: "Thank you for registering!",
        token: token,
        user: newUser,
      });
    }
    } catch (error) {
      next(error);
    } 
  });
  
// POST /api/users/login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password"
    });
  }

  try {
    const user = await getUserByUsername(username);

    const passwordIsValid = await bcrypt.compare(password, user.password)

    if (passwordIsValid) {
      const token = jwt.sign({
        id: user.id,
        username
      }, process.env.JWT_SECRET, {expiresIn: '1w'})
      res.send({ 
        user,
        message: "You're logged in!",
        token
      });
    } else {
      next({ 
        name: 'IncorrectCredentialsError', 
        message: 'Username or password is incorrect'
      });
    }
  } catch(error) {
    next(error);
  }
});

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
