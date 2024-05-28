const {connectMySqlDb} = require('../connection.js')


const AdminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
      const db = await connectMySqlDb();
  
  
      const [rows, fields] = await db.query('SELECT * FROM admin WHERE email = ?', [email]);
  
      const user = rows[0];

      if (!user) {
        return res.status(404).send('User not found');
      }
  

      if (user.password !== password) {
        return res.status(401).send('Invalid password');
      }

      
    //   const passwordMatch = await bcrypt.compare(password, user.password);
    //   if (!passwordMatch) {
    //     return res.status(401).send('Invalid password');
    //   }
  
      res.status(200).send('Login successful');
    } catch (error) {
     
      res.status(500).send('Internal Server Error');
    }
  };

  
  module.exports = {
    AdminLogin
  }