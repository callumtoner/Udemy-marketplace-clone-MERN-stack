import express from 'express'; 
import formidable from 'express-formidable' //to do with form data for video as its not in standard binary data 

const router = express.Router(); //gives us router fucntionality 
//middleware 
import {isInstructor, requireSignin, isEnrolled} from '../middlewares'

//controllers for course 
import {
    uploadImage, removeImage, create, read, upLoadVideo, removeVideo, addLesson, update, publishCourse, unpublishCourse, courses, checkEnrollment, freeEnrollment, paidEnrollment, stripeSuccess, userCourses
} from '../controllers/course'



//to display all published courses on the homepage 
router.get('/courses', courses);

router.post('/course/upload-image', uploadImage);

router.post('/course/remove-image', removeImage);

router.post('/course', requireSignin, isInstructor, create);

//to update a lesson or course 
router.put('/course/:slug', requireSignin, update)

//router for the slug / idividual course product pages 
router.get('/course/:slug', read); 

//router for the lesson data and video upload to S3, formidable is for form data 
router.post('/course/video-upload/:instructorId', requireSignin, formidable(), upLoadVideo); 

//to remove video
router.post('/course/video-remove/:instructorId', requireSignin, removeVideo); 

//for adding lesson in full etc 
router.post('/course/lesson/:slug/:instructorId', requireSignin, addLesson); 

//publish and unpublish the courses of an instructor on their dashboard 
router.put('/course/publish/:courseId', requireSignin, publishCourse); 
router.put('/course/unpublish/:courseId', requireSignin, unpublishCourse); 


//route to test if user is logged in/ enrolled on a certin course 
router.get('/check-enrollment/:courseId', requireSignin, checkEnrollment); 


//enrollment routes 
router.post('/free-enrollment/:courseId', requireSignin, freeEnrollment); 

router.post('/paid-enrollment/:courseId', requireSignin, paidEnrollment);

router.get('/stripe-success/:courseId', requireSignin, stripeSuccess); 

//display all courses on user dashboard request for all of em
router.get('/user-courses', requireSignin, userCourses); 

//this one is to guard a course endpoint to only registered users/enrolled users etc who have bought 
router.get('/user/course/:slug', requireSignin, isEnrolled, read); //write controller middleware - server/middlewares/

module.exports = router; 