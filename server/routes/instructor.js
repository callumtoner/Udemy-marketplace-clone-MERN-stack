import express from 'express'; 


const router = express.Router(); //gives us router fucntionality 
//middleware 
import { requireSignin } from '../middlewares'
import { makeInstructor, getAccountStatus, currentInstructor, instructorCourses, studentCount, instructorBalance, instructorPayoutSettings } from '../controllers/instructor'


router.post('/make-instructor', requireSignin, makeInstructor); 

router.post('/get-account-status', requireSignin, getAccountStatus); 

router.get('/current-instructor', requireSignin, currentInstructor);

//this is the route for the instructor dashboard, it'll show all a person's courses by querying db
router.get('/instructor-courses', requireSignin, instructorCourses)

router.post('/instructor/student-count', requireSignin, studentCount); 

//for payouts dashboard etc
router.get('/instructor/balance', requireSignin, instructorBalance); 

//payout stripe new window 
router.get('/instructor/payout-settings', requireSignin, instructorPayoutSettings); 

module.exports = router; 









