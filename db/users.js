const client = require("./client");
const bcrypt = require('bcrypt');
const SALT_COUNT = 10;
// database functions

// user functions
async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT_COUNT)
  let userToAdd = { username, hashedPassword }
  
  try {
    const { rows: [ user ] } = await client.query(`
      INSERT INTO users(username, password) 
      VALUES($1, $2) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `, [username, hashedPassword]);

    // remove the password from the user object
    delete user.password;

    // return the user object without the password
    return user;

  } catch (error) {
    console.error(error);
  }
}

async function getUser({ username, password }) {
  const user = await getUserByUsername(username);
  const hashedPassword = user.password;

  let passwordsMatch = await bcrypt.compare(password, hashedPassword) 
  if (passwordsMatch) {
    // return the user object (without the password)
    delete user.password
    
    return user;
    
  } else if (!passwordsMatch) {
    return null;
}
}

async function getUserById(userId) {
  try {
    const { rows: [ user ] } = await client.query(`
    SELECT id
    FROM users
    WHERE id=${userId}
    `);

    return user;
  } catch (error) {
    console.error(error);
  }
}

async function getUserByUsername(userName) {
  try {
    const { rows: [ user ] } = await client.query(`
    SELECT *
    FROM users
    WHERE username=$1
    `, [ userName] );

    return user;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
