console.log("server setup"); 
import express from 'express'
import cors from 'cors'
import { readdirSync } from 'fs'; //core node.js module, helps autoload routes 
import mongoose from 'mongoose'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
const morgan = require('morgan'); ///morgan has trouble being imported that way so standard node require used 
require('dotenv').config(); //helps load in our environment variables easier into this namespace 


const csrfProtection = csrf({ cookie: true });//this is to stop URL attacks to grab tokens

//create express app
const app = express(); 

//db work
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true }).then(() => console.log('db connected')).catch((err) => console.log('db connection error', err));



//apply middlewares - runs before any response is sent back to client 
app.use(cors());
app.use(express.json({ limit: "5mb" })); 
app.use(morgan("dev")); 
app.use(cookieParser()); 

//route - mapping all routes and syncing them and appling each one as middleware, this way dont have to require each new route file
//fs has been destructured when required so we can just use the function
readdirSync('./routes').map((r) => app.use('/api', require(`./routes/${r}`))); 

//csrf
app.use(csrfProtection); 
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() }); 
}); //now with this done we can secure the token from the front end

//set up the port 
const port = process.env.PORT || 8000; 

app.listen(port, () =>  console.log(`server is running on port ${port}`));
