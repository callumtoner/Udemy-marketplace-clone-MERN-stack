import AWS from 'aws-sdk'
import {nanoid} from 'nanoid'
import Course from '../models/course'
import slugify from 'slugify'
import {readFileSync} from 'fs' //fs.readFileSync so destructure 
import User from '../models/user'
const stripe = require('stripe')(process.env.STRIPE_SECRET);

//create aws config where we pass the .env secrets etc to verify 
const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
    region: process.env.AWS_REGION,
    apiVersion: process.env.AWS_API_VERSION,
}
//configure aws 
const S3 = new AWS.S3(awsConfig); 

export const uploadImage = async (req, res) => {
    console.log(req.body)
    try {

    const { image } = req.body; 
    if (!image) return res.status(400).send('no image ')

     //prepare the image - it comes in as binary so needs modified, need to get rid of the data tag in the string for empty string
     const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), "base64"); 


     const type = image.split(';')[0].split('/')[1]; //this gives image/jpeg 

     //make image params for sending to s3 bucket aws 
     const params = {
         Bucket: 'cals-bucket', 
         Key: `${nanoid()}.${type}`,
         Body: base64Data,
         ACL:'public-read',
         ContentEncoding: 'base64',
         ContentType: 'image/${type}',
     }
     //upload to s3 
     S3.upload(params, (err, data) => {
         if (err) {
             console.log(err);
             return res.sendStatus(400); 
         }
          console.log(data)
         res.send(data); //just raw data not json here 
     })
    } catch (err) {
        console.log(err)
    }
}



export const removeImage = async (req, res) => {

    try {
        const {image}= req.body; 
        const params = {
            Bucket: image.Bucket,
            Key: image.Key, 

        }
        //send remove request to S3 
        S3.deleteObject(params, (err, res) => {
            if (err) {
                console.log(er)
                res.sendStatus(400)
            }
            res.send({ ok: true}); 
        })


    } catch (err) {
        console.log(err)
    }

}


//okay so this is the function that gets called 
//when the front end sends axios to the endpoint 'course', when the course create form data gets sent here
//so now we have to save it in the database, the middleware already made sure its a registered instructor
export const create = async (req, res) => {

    console.log('create course ')
    //console log works so can create course now based on schema 

    try{

        //make sure course with that name doesnt exist 
        const alreadyExist = await Course.findOne({
            slug: slugify(req.body.name)
        })
        if(alreadyExist) return res.status(400).send('title is taken'); 

        const course = await new Course({
            slug: slugify(req.body.name),
            instructor: req.user._id,
            ...req.body,
        }).save(); 

        res.json(course); 

    } catch (err) {
        console.log(err)
        return res.status(400).send('course create failed. try again'); 
    }
}


//controller for individual slug product page data 
export const read = async (req, res) => {

    try {
        const course = await Course.findOne({slug: req.params.slug}).populate('instructor', '_id name').exec(); 
        //now respond to the front end that made the call in the first place 
        res.json(course); 
    } catch (err) {
        console.log(err)
    }
}


export const upLoadVideo = async (req, res) => {

    try {
        if(req.user._id != req.params.instructorId) {
            return res.status(400).send('unauthorised'); 
        }
        //very similar to image upload 
        const {video} = req.files; 
        console.log(video); 
        if(!video) return res.status(400).send('no video'); 

        //video params 
        const params = {
            Bucket: 'cals-bucket',
            Key: `${nanoid()}.${video.type.split('/')[1]}`, //video/mp4 etc so you grab the mp4 type! 
            Body: readFileSync(video.path),
            ACL: 'public-read',
            ContentType: video.type,

        }
        //now we can upload to S3 
        S3.upload(params, (err, data) => {
            if (err) {
                console.log(err)
                res.sendStatus(400); 
            }

            res.send(data); //should get back location url, key etc 
        })

    } catch (err) {
        console.log(err)
    }
}




//remove video from lesson upload addlessonform.js 
export const removeVideo = async (req, res) => {
    try {
        if(req.user._id != req.params.instructorId) {
            return res.status(400).send('unauthorised'); 
        }
        //very similar to video upload as above but .body instead of .files as its not form data 
        const { Bucket, Key } = req.body; 
        console.log(video); 
        if(!video) return res.status(400).send('no video'); 

        //video params 
        const params = {
            Bucket,
            Key, //video/mp4 etc so you grab the mp4 type! 
            
        }
        //now we can remove from S3 bucket 
        S3.deleteObject(params, (err, data) => {
            if (err) {
                console.log(err)
                res.sendStatus(400); 
            }

            res.send({ ok: true}); //to say thta it went ok 
        })

    } catch (err) {
        console.log(err)
    }
   
}


//lesson adding fucntion for endpoint - sending values (contains title content and video)
export const addLesson = async (req, res) => {
    try {
        //destructure data coming in from values 
        const { slug, instructorId } = req.params; 
        const { title, content, video } = req.body; 

        //verify if the user is the right instructor 
        if(req.user._id != instructorId) {
            return res.status(400).send('unauthorised'); 
        }

        //now we can continue for real 
        const updated = await Course.findOneAndUpdate({slug}, {
            $push: {lessons: {title, content, video, slug: slugify(title)}}
        }, { new: true } ).populate('instructor', '_id name').exec(); 


        res.json(updated)
    } catch (err) {
        console.log(err)
        return res.status(400).send("Add lesson failed"); 
    }
}


export const update = async (req, res) => {

    try {

        const {slug} = req.params; 
        const course = await Course.findOne({ slug }).exec(); 
        if (req.user._id != course.instructor) {
            return res.status(400).send('not allowed')
        }
        //if all good then update 
        const updated = await Course.findOneAndUpdate({slug}, req.body, {new:true}).exec(); //course updated 
    
        res.json(updated); 
    } catch (err) {
        return res.status(400).send(err.message);
    }
}



export const publishCourse = async (req, res) => {
    try {

        const {courseId} = req.params; 
        const course = await Course.findById(courseId).select('instructor').exec(); //find who made the course sent 
        if (course.instructor._id != req.user._id) {
            return res.status(400).send('unauthorised'); 
        } //if these arent the same users, only og instructor can publish and unpublish 

        const updated = await Course.findByIdAndUpdate(courseId, {published: true}, {new: true}).exec();  
        res.json(updated); 

    } catch (err) {
        console.log(err)
        return res.status(400).send('sending publish failed')
    }
}


export const unpublishCourse = async (req, res) => {
    try {

        const {courseId} = req.params; 
        const course = await Course.findById(courseId).select('instructor').exec(); //find who made the course sent 
        if (course.instructor._id != req.user._id) {
            return res.status(400).send('unauthorised'); 
        } //if these arent the same users, only og instructor can publish and unpublish 

        const updated = await Course.findByIdAndUpdate(courseId, {published: false}, {new: true}).exec();  
        res.json(updated); 

    } catch (err) {
        console.log(err)
        return res.status(400).send('sending unpublish failed')
    }
}


export const courses = async (req, res) => {

    const all = await Course.find({published : true}).populate('instructor', '_id name').exec(); //find em all! 

    res.json(all); 
}



export const checkEnrollment = async (req, res) => {
    const {courseId} = req.params; 
    //finds course of currently logged in user
    const user = await User.findById(req.user._id).exec(); 
    //check if course id is found in user courses array
    //get all their courses, loop, and match or not 
    let ids = []; 
    let length = user.courses && user.courses.length; 
    for (let i=0; i < length; i++) {
        ids.push(user.courses[i].toString()); 
    }
    res.json({
        status: ids.includes(courseId),
        course: await Course.findById(courseId).exec(),
    })
}


export const freeEnrollment = async (req, res) => {

    try {
        const course = await Course.findById(req.params.courseId).exec(); 
        if (course.paid) return; 

        const result = await User.findByIdAndUpdate(req.user._id, {
            $addToSet: {courses: course._id}, 
        }, {new: true}).exec(); 

        res.json({
            message: 'congrats, now enrolled!',
            course, 
        })
    } catch (err) {
        console.log('free enrollment error'); 
        return res.status(400).send('enrollment create failed');
    }
}


export const paidEnrollment = async (req, res) => {
    //all money dynamics of the marketplace and getting paid through stripe, remember this is function of hitting the endpoiht route
    try {

        //first check if course if free or paid - always check etc 
    const course = await Course.findById(req.params.courseId).populate('instructor').exec(); 
    if(!course.paid) return; 
    //charge application fee - whats the vig? 20%, remember stripe is taking 3% as well 
    const fee = (course.price * 20) / 100; 
    //create stripe session 
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        //purchase details
        line_items: [{
            name: course.name, 
            amount: Math.round(course.price.toFixed(2) * 100), //gives price in cents as requried by stripe 
            currency: 'gbp',
            quantity: 1,
        }],
        //charge the buyer and transfer remaining balance to seller after the platform fee
        payment_intent_data: {
            application_fee_amount: Math.round(course.price.toFixed(2) * 100),
            transfer_data: {
                destination: course.instructor.stripe_account_id,
            },
        },
        //redirect success url after stripe is completed 
        success_url: `${process.env.STRIPE_SUCCESS_URL}/${course._id}`, 
        cancel_url: process.env.STRIPE_CANCEL_URL,


    });//gives the stripe session 
    console.log('SESSIONJ ID', session); 

    await User.findByIdAndUpdate(req.user._id, { stripeSession: session}).exec(); //updates db of userbase, the session is in the user model
    //if payment fails for some reason, this queries the user db and if there's a session then the user tried to enroll and pay and we can try again for them

    res.send(session.id); //send the id to the front end 
    } catch (err) {
        console.log('paid enrollment error!!!', err); 
        return res.status(400).send('paid enrollment failed');  
    }
    //if all goes well, when a user clicks on the enroll button of paid course we should return a session id so the user can checkout on a new checkout page
    //then get redirected to success url on completion 
};//ends function for payment 




export const stripeSuccess = async (req, res) => {
    try {

        //find course 
        const course = await Course.findById(req.params.courseId).exec(); 
        //get user from db to get their stripe session id 
        const user = await User.findById(req.user._id).exec(); 

        //if no stripe session returned 
        if(!user.stripeSession.id) return res.sendStatus(400); 

        //retreive stripe session then 
        const session = await stripe.checkout.sessions.retrieve(user.stripeSession.id); 
        //most important field returned is payment status = true, then we can push and move user 
        
        if(session.payment_status === 'paid') {
            await User.findByIdAndUpdate(user._id, {
                $addToSet: { courses: course._id },
                $set: { stripeSession: {} },
            }).exec(); 
        }
        res.json({success: true, course}); //we return the slug and can thenrender the course page via its slug

    } catch (err) {
        console.log('stripe success error', err); 
        res.json({ success: false}); 
        }
}


export const userCourses = async (req, res) => {

    try {

        const user = await User.findById(req.user._id).exec(); //now we can access his user cvourses array! 

        const courses = await Course.find({_id: {$in: user.courses}}).populate('instructor', '_id name').exec(); 
        
        res.json(courses); //send it back to the front enjd to display them all on user dashboard 
    } catch (err) {
        console.log(err); 
    }
}