
const nodemailer = require('nodemailer');
const config = require('../config');
const bcrypt = require('bcrypt');
const {connectMySqlDb} = require('../connection.js')
const jwt = require('jsonwebtoken');

const crypto = require('crypto');





const folloerUser = async (req,res)=>{


  const userId = req.body.userid;
   
    const followId = req.params.id;
    try {
      const db = await connectMySqlDb();
  
      // Check if the followers table exists, and create it if it doesn't
      const [tables] = await db.query('SHOW TABLES LIKE "followers"');
      if (tables.length === 0) {
        await db.query(`
          CREATE TABLE followers (
            user_id INT,
            follower_id INT,
            PRIMARY KEY (user_id, follower_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);
      }
  
      // Insert the follow relationship
      await db.query('INSERT INTO followers (user_id, follower_id) VALUES (?, ?)', [userId, followId]);
  
      // Update the followers and following count
      await db.query('UPDATE users SET followers = followers + 1 WHERE id = ?', [followId]);
      await db.query('UPDATE users SET following = following + 1 WHERE id = ?', [userId]);
  
      res.json({ message: 'Followed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}

const postingUser = async (req,res)=>{
  const userId = req.params.id;
  console.log(userId);
  const db = await connectMySqlDb();
  
  // Ensure the `users` table has an `id` column of type INT or BIGINT

  // Create the `posts` table with a compatible foreign key
  await db.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      img_url VARCHAR(255),
      content TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  const post_img = req.file ? req.file.filename : null;
  const { description } = req.body;

  try {
    const [result] = await db.query('INSERT INTO posts (user_id, img_url, content) VALUES (?, ?, ?)', [userId, post_img, description]);
    await db.query('UPDATE users SET posts = posts + 1 WHERE id = ?', [userId]);
    res.status(201).json({ id: result.insertId, user_id: userId, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
 
}

const commentuser = async (req,res)=>{
  const db = await connectMySqlDb();
    const [tables] = await db.query('SHOW TABLES LIKE "comments"');
    if (tables.length === 0) {
     
        await db.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          post_id INT,
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (post_id) REFERENCES posts(id)
     
        );
        `);
    }


    const userId = req.params.userId;
    const postId = req.params.postId;
    const { content } = req.body;

    try {
      const [result] = await db.query('INSERT INTO comments (user_id, post_id, comment) VALUES (?, ?, ?)', [userId, postId, content]);
      res.status(201).json({ id: result.insertId, user_id: userId, post_id: postId, content });
      
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
}

const  likeUser = async (req,res)=>{
    const userId = req.user.userId;
    const { postId } = req.body;
  
    try {

        const db = await connectMySqlDb();
        const [tables] = await db.query('SHOW TABLES LIKE "likes"');
        if (tables.length === 0) {
         
            await db.query(`
            CREATE TABLE likes (
                id SERIAL PRIMARY KEY,
                post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `);
        }



      const result = await db.query(
        'INSERT INTO likes (post_id, user_id) VALUES ($1, $2) RETURNING *',
        [postId, userId]
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}


const getAlluser = async (req,res) =>{
  try {
   
    const userId = req.params.id;

    if (!userId) {
        throw new Error('User ID not provided.');
    }

    const db = await connectMySqlDb();
    const [rows, fields] = await db.query('SELECT * FROM users WHERE id != ?', [userId]);
    
    res.json(rows);
} catch (error) {
  
    res.status(500).json({ error: error.message });
}
}


const getpostUser = async (req,res) =>{
  try {
   
    const userId = req.params.id;

    if (!userId) {
        throw new Error('User ID not provided.');
    }



    

    const db = await connectMySqlDb();

    const [tables1] = await db.query('SHOW TABLES LIKE "posts"');
    if (tables1.length === 0) {
    await db.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      img_url VARCHAR(255),
      content TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  }
    const [tables] = await db.query('SHOW TABLES LIKE "comments"');
    if (tables.length === 0) {
     
        await db.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          post_id INT,
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (post_id) REFERENCES posts(id)
     
        );
        `);
    }
    
    console.log("user idd",userId)
    const [rows, fields] = await db.query('SELECT * FROM posts WHERE user_id != ?', [userId]);

    console.log('vvvvvv',rows);
    res.json(rows);
} catch (error) {
  
    res.status(500).json({ error: error.message });
}
}


const getpostUserbyId = async (req,res) =>{
  try {
   
    const userId = req.params.id;
    

    if (!userId) {
        throw new Error('User ID not provided.');
    }



    

    const db = await connectMySqlDb();

    const [tables1] = await db.query('SHOW TABLES LIKE "posts"');
    if (tables1.length === 0) {
    await db.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      img_url VARCHAR(255),
      content TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  }
    const [tables] = await db.query('SHOW TABLES LIKE "comments"');
    if (tables.length === 0) {
     
        await db.query(`
        CREATE TABLE IF NOT EXISTS comments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          post_id INT,
          comment TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (post_id) REFERENCES posts(id)
     
        );
        `);
    }
    
    console.log("user idd",userId)
    const [rows, fields] = await db.query('SELECT * FROM posts WHERE user_id = ?', [userId]);

    console.log('vvvvvv',rows);
    res.json(rows);
} catch (error) {
  
    res.status(500).json({ error: error.message });
}
}

const deletePostUser = async (req,res) =>{
  try {
    const postId = req.params.id;
    const userid = req.params.userid;

    if (!postId) {
      throw new Error('Post ID not provided.');
    }

    const db = await connectMySqlDb();

    // Check if the post exists
    const [post] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);

    if (post.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Delete associated comments first
    await db.query('DELETE FROM comments WHERE post_id = ?', [postId]);

    // Delete the post
    await db.query('DELETE FROM posts WHERE id = ?', [postId]);
    await db.query('UPDATE users SET posts = posts - 1 WHERE id = ?', [userid]);

    console.log(userid)
    res.json({ message: 'Post and associated comments deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getCommentsByUserAndPost = async (req, res) => {
  const db = await connectMySqlDb();

  
  const postId = req.params.postId;



  try {
    const [comments] = await db.query(
      'Select users.username, comments.* from comments join users on comments.user_id=users.id where comments.post_id=?', [postId]
    );

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await db.end();
  }
};


const checkuser = async (req, res) => {
  const db = await connectMySqlDb();
  const userId = req.params.userid;
  const followId = req.params.followid;

   

  // Check if the followers table exists, and create it if it doesn't
  const [tables] = await db.query('SHOW TABLES LIKE "followers"');
  if (tables.length === 0) {
    await db.query(`
      CREATE TABLE followers (
        user_id INT,
        follower_id INT,
        PRIMARY KEY (user_id, follower_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  }

  console.log(`users id ${userId} and follower_id ${followId}`);
  const [existingFollow] = await db.query('SELECT * FROM followers WHERE user_id = ? AND follower_id = ?', [userId, followId]);
   
  if (existingFollow.length > 0) {
    return res.status(200).json({ message: true });
  }else{
    return res.status(200).json({ message: false });
  }


}


module.exports = {
    folloerUser,
    postingUser,
    getpostUser,
    commentuser,
    likeUser,
    getAlluser,
    checkuser,
    getpostUserbyId,
    getCommentsByUserAndPost,
    deletePostUser
}
