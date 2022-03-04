import express from 'express'; 
import { register } from '../controllers/auth'; 
import { login, logout, currentUser, sendTestEmail, forgotPassword, resetPassword } from '../controllers/auth'; 

const router = express.Router(); //gives us router fucntionality 
//middleware 
import {requireSignin} from '../middlewares'

router.post('/register', register);


router.post('/login', login);


router.get('/logout', logout);

//so when this endpoint is hit, the middleware function is called to get user id, then controller function is hit to get user full details
router.get('/current-user', requireSignin, currentUser); 

router.get('/send-email', sendTestEmail); 

router.post('/forgot-password', forgotPassword); 

router.post('/reset-password', resetPassword); 



module.exports = router; 

