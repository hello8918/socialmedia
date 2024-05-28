const {connectMySqlDb} = require('../connection.js')
const nodemailer = require('nodemailer');


const sendConfirmationEmail = async (name, email, subject,phone,message) => {

    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: 'krishwason1209@gmail.com', 
        pass: 'iaon lxwx pidd gjxw' 
      }
    });
  
  
    const mailOptions = {
   
      to: email,
      subject: subject,
      html: `<ul><li>Name : ${name} </li> , <li>email : ${email} </li> <li>Phone Number : ${phone} </li>   <li>Message : ${message} </li>   </ul>`
    };
  
  
    await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent successfully');
  };
  

const contacUser = async (req,res)=>{
    const { name, email, subject,phone,message } = req.body;

   
 
    try {
      const db = await connectMySqlDb();
      const [tables] = await db.query('SHOW TABLES LIKE "contact"');
      if (tables.length === 0) {
         
          await db.query(`
              CREATE TABLE contact (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  name VARCHAR(255) NOT NULL,
                  email VARCHAR(255) NOT NULL,
                  subject VARCHAR(255) NOT NULL,
                  phone VARCHAR(20),
                  message TEXT
              )
          `);
      }

  
      await db.query('INSERT INTO contact (name, email, phone,subject,message ) VALUES (?, ?, ?,?,? )', [name, email, phone, subject,message]);
  

      await sendConfirmationEmail(name, email, subject,phone,message)
      res.status(200).send('Form fill up ');
    } catch (error) {
      console.log(error);
      return res.status(500).send('Error saving user to database');
    }
}

module.exports = {
    contacUser,
    
}