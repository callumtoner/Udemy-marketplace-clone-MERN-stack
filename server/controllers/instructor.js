import User from '../models/user';
import queryString from 'query-string'
import Course from '../models/course'

const stripe = require('stripe')(process.env.STRIPE_SECRET); //had to do this instead of import,as it didnt find create method so no stripe instance existed


export const makeInstructor = async (req, res) => {
   try {

     //making reques tot stripe and need to give the redirect url, as user is taken to new window 
    //1. find the user from the db 
    const user = await User.findById(req.user._id).exec(); 
    //2. if user doesnt have strip eaccount id yet, then create new 
    if(!user.stripe_account_id) {
        //then we create new one
        const account = await stripe.accounts.create({type: 'express'});
        user.stripe_account_id = account.id; 
        user.save(); //now we have created a new stripe account and saved it to that individual user (into their user schema field!)
    }
    //3. create account link based on account id (for frontend to complete instructor onboarding)
    let accountLink = await stripe.accountLinks.create({
        account: user.stripe_account_id,
        refresh_url: process.env.STRIPE_REDIRECT_URL,
        return_url: process.env.STRIPE_REDIRECT_URL,
        type: 'account_onboarding', 
    });
    console.log(accountLink); 
    //4. pre-fill any info like email, then send url response to frontend 
    accountLink = Object.assign(accountLink, {
        "stripe_user[email]": user.email,
    });
    //5. then send the account link as response to front end 
    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
    
   } catch (err) {
       console.log(err)
   }
}

export const getAccountStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).exec(); 
        const account = await stripe.account.retrieve(user.stripe_account_id); 

        //check that the account has charges enabled 
        if (!account.charges_enabled) {
            return res.status(401).send('unauthorised'); 
        } else {
            //we want to save that stripe object inside our db in the user model fields, this is all initial setup
            const statusUpdated = await User.findByIdAndUpdate(user._id, {
                stripe_seller: account, 
                $addToSet: {role: 'Instructor'}, 

            }, { new: true }).select('-password').exec(); 
            
            res.json(statusUpdated); 
        }

    } catch (err) {
        console.log(err)
    }
}

export const currentInstructor = async (req, res) => {

    try {

        let user = await User.findById(req.user._id).select('-password').exec(); 
        if (!user.role.includes('Instructor')) {
            console.log('you are not supposed to be here')
            return res.sendStatus(403); 
        } else {
            res.json({ ok: true }); 
        }
    } catch (err) {
        console.log(err)
    }

}

//query db to find all courses of an instructor to display on the page dashboard 
export const instructorCourses = async (req,res) => {

    try {

        const courses = await Course.find({instructor: req.user._id}).sort({createdAt: -1}).exec(); 
      
        res.json(courses); //pinging them back to front end whre they'll have to be displayed. 
    } catch (err) {
        console.log(err)
    }
}

export const studentCount = async (req, res) => {
    try {

        const users = await User.find({course: req.body.courseId}).select('_id').exec(); //gets all users of a course for the instructor

        res.json(users); //then using user.length on front end 
    } catch (err) {
        console.log(err); 
    }
}

export const instructorBalance = async (req, res) => {

    try {

        const user = await User.findById(req.user._id).exec(); 
        const balance = await stripe.balance.retrieve({
            stripeAccount: user.stripe_account_id
        })
        res.json(balance); 

    } catch (err) {
        console.log(err)
    }
}

export const instructorPayoutSettings = async (req, res) => {
    try {

        let user = await User.findById(req.user._id).exec(); 
        const loginLink = await stripe.accounts.createLoginLink(user.stripe_seller.id, {redirect_url: process.env.STRIPE_SETTINGS_REDIRECT});

        res.json(loginLink.url);
    } catch (err) {
        console.log(err)
    }
}