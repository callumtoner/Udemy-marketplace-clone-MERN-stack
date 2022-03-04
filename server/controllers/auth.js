import User from '../models/user'
import { hashPassword, comparePassword } from '../utils/auth';
import jwt from 'jsonwebtoken'
import AWS from 'aws-sdk'
import { nanoid } from 'nanoid'

//create aws config where we pass the .env secrets etc to verify 
const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
    region: process.env.AWS_REGION,
    apiVersion: process.env.AWS_API_VERSION,
}

const SES = new AWS.SES(awsConfig); 

export const register = async (req, res) => {
   //now we use the functions of the model to has the password then we'll save and divert back to register route 
    try {
        console.log(req.body); 
        const {name, email, password} = req.body 
        //do validation now 
        if (!name) return res.status(400).send("name is required.")
        if (!password || password.length < 6) {
            return res.status(400).send("Password is required and should be minimum of 6 characters long");
        }
        let userExist = await User.findOne({email}).exec(); 
        if (userExist) return res.status(400).send("Email is taken"); 

        //now if all details are acceptable then we can save it to db correctly 
        //hash password 
        const hashedPassword = await hashPassword(password); 
        //register 
        const user = await new User({
          name, 
          email, 
          password: hashedPassword  
        }).save();
        console.log("saved user:", user); 
        return res.json({ ok: true });
    } catch (err) {
        console.log(err); 
        return res.status(400).send('Error. Try again.')
    }
}; 

export const login = async (req, res) => {
    try {

        //check if our db has user with that email
        const { email, password } = req.body
        const user = await User.findOne({email}).exec(); 
        if (!user) return res.status(400).send("No user found"); 
        //check password and use the compare password function already made for register
        const match = await comparePassword(password, user.password); 

        //if no match 
        if (!match) return res.status(400).send('Wrong password!'); 
        //now we create JWT
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d', });
        //send it now as cookie in json response 
        user.password = undefined; 
        res.cookie('token', token, {
            httpOnly: true,
            //secure: true, 
        }); 
        //send user as json response 
        res.json(user); 
    } catch (err) {
        console.log(err)
        return res.status(400).send("Error. Try again.")
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token');
        return res.json({message: "signout successful"});
    } catch (err) {
        console.log(err)
    }
}

export const currentUser = async (req, res) => {
    //we want to query db 
    try {
        const user = await User.findById(req.user._id).select('-password').exec(); 
        console.log('CURRENT USER', user)
        return res.json({ ok: true });
    } catch (err) {
        console.log(err); 
    }
}//if we get the user from this function as the middleware of the endpoint current-user, then page is presented and token has been read by express-jwt

export const sendTestEmail = async (req, res) => {
    //console.log('send email using SES')
    //res.json({ ok: true }); 
    //now we have to send the email with SES, so install npm package sdk 
    //see aws config above - obv switch to domain email when live!!!!
    const params = {
        Source: process.env.EMAIL_FROM, 
        Destination: {
            ToAddresses: [process.env.EMAIL_FROM],
        },
        ReplyToAddresses: [process.env.EMAIL_FROM],
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `
                    <html>
                    <h1>Reset password link</h1>
                    <p>Please use the following link to rset your password</p>
                    </html>
                    `,
                },
            },
           Subject: {
            Charset: "UTF-8",
            Data: "Password reset link",
           }
        }
    }

    const emailSent = SES.sendEmail(params).promise(); //using a promise so dont need await

    emailSent.then((data) => {
        console.log(data); 
        res.json({ ok: true })
    }).catch(err => {
        console.log(err)
    })
}

export const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body; 
        //console.log(email)
        //generate a code and send and save in db to match 
        const shortCode = nanoid(6).toUpperCase(); 
        const user = await User.findByIdAndUpdate({ email }, { passwordResetCode: shortCode });
        if(!user) return res.status(400).send('user not found'); 

        //now send as email, so we need params and message
        const params = {
            Source: process.env.EMAIL_FROM,
            Destination: {
                toAddresses: [email]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `
                            <html>
                                <h1>Reset password</h1> 
                                <p>Use this code to reset your password</p>
                                <h2 style="color:red;">${shortCode}</h2>
                            </html
                        `,
                    },
                },
                Subject: {
                    Charset: "UTF-8", 
                    Data: 'Reset Password',
                },
            },
            
        };

        const emailSent = SES.sendEmail(params).promise(); 

        emailSent.then((data) => {
            console.log(data) 
            res.json({ ok: true })
        }).catch((err) => {
            console.log(err); 
        })
    }catch (err) {
        console.log(err)
    }
}

export const resetPassword = async (req, res) => {
    try {
        //reset password, first we need the email, code, new password 
        const { email, code, newPassword } = req.body;
        //now find user 
        const hashedPassword = await hashPassword(newPassword); 
        const user = User.findOneAndUpdate({
            email, 
            passwordResetCode: code,
        }, {
            password: hashedPassword, 
            passwordResetCode: "", 
        }).exec(); 
        res.json({ ok: true }); 

    } catch (err) {
        console.log(err)
        return res.status(400).send('error. try again!')
    }
}