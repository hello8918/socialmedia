
const mysql = require('mysql2/promise');


const connectMySqlDb = async () => {
    return await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '2110990796',
            database: 'media'
    });
  };

  const getUserByVerificationToken = async (token) => {
    try {
      const connection = await connectMySqlDb();
      const [rows, fields] = await connection.query('SELECT * FROM users WHERE verification_token = ?', [token]);

      return rows[0]; 
    } catch (error) {
      console.error('Error fetching user by verification token:', error);
      throw error;
    }
  };
  
  const updateUserVerificationStatus = async (userId, isVerified) => {
    try {
      const connection = await connectMySqlDb();
      await connection.query('UPDATE users SET is_verified = ? WHERE id = ?', [isVerified, userId]);
      
    } catch (error) {
      console.error('Error updating user verification status:', error);
      throw error;
    }
  };

module.exports = {
    connectMySqlDb,
    getUserByVerificationToken,
    updateUserVerificationStatus
};
