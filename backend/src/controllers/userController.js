const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Handles new user registration.
 */
const registerUser = async (req, res) => {
  const { username, password } = req.body;

  // 1. Basic Validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide both username and password.' });
  }

  try {
    // 2. Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert the new user into the database
    const query = `
      INSERT INTO users (username, password_hash)
      VALUES ($1, $2)
      RETURNING id, username, created_at;
    `;
    const values = [username, passwordHash];

    const { rows } = await db.query(query, values);

    // 4. Send a success response
    res.status(201).json({
      message: 'User registered successfully!',
      user: rows[0],
    });

  } catch (error) {
    // Handle potential errors, like a duplicate username
    if (error.code === '23505') { // PostgreSQL unique violation error code
      return res.status(409).json({ message: 'Username already exists.' });
    }
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


/**
 * Handles user login and JWT generation.
 */
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  // 1. Basic Validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide both username and password.' });
  }

  try {
    // 2. Find the user in the database
    const query = 'SELECT * FROM users WHERE username = $1;';
    const { rows } = await db.query(query, [username]);

    if (rows.length === 0) {
      // User not found. Send a generic error for security.
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];

    // 3. Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      // Password does not match. Send a generic error.
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // 4. User is authenticated, create a JWT
    const payload = {
      id: user.id,
      username: user.username,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token will be valid for 24 hours
    );

    // 5. Send the token and user info back to the client
    res.status(200).json({
      message: 'Logged in successfully!',
      token: token,
      user: {
        id: user.id,
        username: user.username,
      },
    });

  } catch (error) {
    console.error('Error during user login:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};


module.exports = {
  registerUser,
  loginUser,
};