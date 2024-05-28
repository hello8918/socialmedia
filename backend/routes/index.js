const express = require('express');
const router = express.Router();
const {signupUser,loginUser,getUser,deleteUser,getUserbyid,updateUser,getFollowusers} = require('../controllers/Authcontroller');
const multer = require('multer');
const path = require('path');
// const {addProperty,deleteProperty,updateProperty,getProperty,getProductById} = require('../controllers/PropertyController');



const {AdminLogin} = require('../controllers/AdminLogin');

const {getUserByVerificationToken,updateUserVerificationStatus} = require('../connection')

const {contacUser} = require('../controllers/Contact')


const {folloerUser,getAlluser,postingUser,getpostUser,commentuser,getCommentsByUserAndPost,checkuser,getpostUserbyId,deletePostUser} = require('../controllers/Followeruser')








router.get('/verify', async (req, res) => {
  const { token } = req.query;

  try {
    const user = await getUserByVerificationToken(token);
    if (!user) {
      return res.status(404).send('User not found');
      
    }

    
    await updateUserVerificationStatus(user.id, true);

    res.status(200).send('Email verified successfully');
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/users/:id',getAlluser);
router.get('/posts/:id',getpostUser);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif' || 
    file.mimetype === 'image/webp'

  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF WEBP files are allowed.'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 
  },
  fileFilter: fileFilter
});
     

router.post('/signup', upload.single('userImage'), signupUser);
router.put('/user/update/:id', upload.single('user_image'), updateUser);

router.post('/comments/:userId/:postId', commentuser);
router.get('/comments/get/:postId', getCommentsByUserAndPost);


router.get('/follower/get/:userid/:followid', checkuser);


router.get('/:id', getUserbyid);

router.get('/user/post/:id', getpostUserbyId);

router.get('/follower/:id', getpostUserbyId);

// router.post('/property/add', upload.single('propertyImg'), addProduct);
// router.delete('/property/delete/:id', deleteProduct);
// router.put('/property/update/:id', upload.single('propertyImg'), updateProduct);




// router.post('/blog/add', upload.single('blogImg'), addBlog);
// router.delete('/blog/delete/:id', deleteBlog);
// router.put('/blog/update/:id', upload.single('blogImg'), updateBolg);


router.post('/contact', contacUser);





router.post('/login', loginUser);
router.delete('/post/delete/:id/:userid', deletePostUser);



router.post('/follow/:id', folloerUser);
router.get('/follow/:id',getFollowusers );

router.post('/user/:id/post' ,upload.single('post_img'), postingUser);

module.exports = router;
