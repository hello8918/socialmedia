
const nodemailer = require('nodemailer');
const config = require('../config');
const bcrypt = require('bcrypt');
const {connectMySqlDb} = require('../connection.js')
const jwt = require('jsonwebtoken');

const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  host: "smtrp.gmail.com",
  auth: {
    user: 'krishwason1209@gmail.com', 
    pass: 'iaon lxwx pidd gjxw' 
  }
});

const sendConfirmationEmail = async (email) => {



  const mailOptions = {
    from: '"Your Application"',
    to: email,
    subject: 'Account Registration Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Welcome to Your Application, ${email}!</h1>
        <p>Thank you for registering with us.</p>
        <p>Your account has been successfully created.</p>
        <p>We are excited to have you on board!</p>
        <p>Best Regards,<br/>Your Application Team</p>
      </div>
    `
  };



  await transporter.sendMail(mailOptions);
};



 const signupUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const db = await connectMySqlDb();

    const [tables] = await db.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      await db.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          posts INT DEFAULT 0,
          followers INT DEFAULT 0,
          following INT DEFAULT 0,
          user_image VARCHAR(255),
          verification_token VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userImage = req.file ? req.file.filename : null;
    const verificationToken = crypto.randomBytes(20).toString('hex');

    await db.query('INSERT INTO users (username, email, password, user_image, verification_token) VALUES (?, ?, ?, ?, ?)', [username, email, hashedPassword, userImage, verificationToken]);

    const verificationLink = `http://localhost:9000/verify?token=${verificationToken}`;

    await transporter.sendMail({
      from: 'krishwason1209@gmail.com',
      to: email,
      subject: 'Email Verification',
      html: `<p>Please click the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
    });

    res.status(200).send('Signup successful. Please check your email for verification.');
  } catch (error) {
    return res.status(500).send('Error saving user to database');
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await connectMySqlDb();

    const [rows, fields] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    const user = rows[0];
    if (!user) {
      return res.status(404).send('User not found');
    }

    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send('Invalid password');
    }

   
    const token = jwt.sign({ email: email }, 'your_secret_key', { expiresIn: '1h' });

    res.status(200).json({ token: token, id: user.id});
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};


const getUser = async (req, res) => {
  const userId = req.params.id;
  const query = `
    SELECT 
      users.*, 
      (SELECT COUNT(*) FROM posts WHERE user_id = users.id) AS posts
    FROM users 
    WHERE id = ?`;
  
  db.query(query, [userId], (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });

};



const getUserbyid = async (req, res) => {
  try {
    const db = await connectMySqlDb();

   
    const id = req.params.id;

    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    
  
    res.send(rows);
  } catch (error) {
   
    res.status(500).send('Internal Server Error');
  }
};


const getFollowusers = async (req, res) => {
  try {
    const db = await connectMySqlDb();

   
    const id = req.params.id;
  
  const [rows] = await db.query('SELECT * FROM users WHERE id != ?', [id]);

  
    res.send(rows);
  } catch (error) {
   
    res.status(500).send('Internal Server Error');
  }
};


const deleteUser = async (req, res) => {
  try {
    const db = await connectMySqlDb();

    const userId = req.params.id;
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    res.status(200).send('User deleted successfully');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};



const updateUser = async (req, res) => {
  const  userId  = req.params.id;
  const { username, email, password } = req.body;

  try {
    const db = await connectMySqlDb();

    // Check if the users table exists and create if not
    const [tables] = await db.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      await db.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          posts INT DEFAULT 0,
          followers INT DEFAULT 0,
          following INT DEFAULT 0,
          user_image VARCHAR(255),
          verification_token VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Check if the user exists
    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare the fields to update
    const fieldsToUpdate = {};
    if (username) fieldsToUpdate.username = username;
    if (email) fieldsToUpdate.email = email;
    if (password) fieldsToUpdate.password = await bcrypt.hash(password, 10);
    if (req.file) fieldsToUpdate.user_image = req.file.filename;
  
    console.log(req.body)
    // Create the SET part of the SQL query
    const setQuery = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fieldsToUpdate);

    // Update the user in the database
    await db.query(`UPDATE users SET ${setQuery} WHERE id = ?`, [...values, userId]);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    return res.status(500).send('Error updating user in database');
  }
};





 module.exports = {
    signupUser,
    loginUser,
    getUser,
    updateUser,
    deleteUser,
    getUserbyid,
    getFollowusers

 }   