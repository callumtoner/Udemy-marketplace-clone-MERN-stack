//need expreess-jwt package to verify tokens to block user pages for everyone other than that user
//checks for tokens in headers and checks against the secret used to make the token, it can then exrtract data from token
////verift data from there against the database to get user id
import expressJwt from 'express-jwt'
import User from '../models/user'
import Course from '../models/course'

//we can drop this middleware as it's exported into any route so it validates before entry and execution and gives user id
export const requireSignin = expressJwt({
    getToken: (req, res) => req.cookies.token, 
    secret: process.env.JWT_SECRET, 
    algorithms: ["HS256"]
}) //i.e. if valid it will return req.user._id or error 



//we need a middlewar to check that a course is being created by a registered instructor 
export const isInstructor = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).exec();
        if (!user.role.includes('Instructor')) {
            return res.sendStatus(403);
        } else {
            next(); 
        }
    } catch (err) {
        console.log(err); 
    }
}


export const isEnrolled = async (req, res, next) => {

    try {

        const user = await User.findById(req.user._id).exec(); //get user
        const course = await Course.FindOne({slug: req.params.slug}).exec();  //get the course slug/id in question

        //now check if course(slug) is found inside the user's courses array so therefore he as access, if not then dont allow 
        let ids =[]; 
        for (let i =0; i < user.courses.length; i++) {
            ids.push(user.courses[i].toString()); //each course id
        }

        if(!ids.includes(course._id.toString())) {
            res.sendStatus(403); 
        } else {
            next(); 
        }

    } catch (err) {
        console.log(err);
    }
}