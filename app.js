const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const colors = require('colors')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const fileupload = require('express-fileupload')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')
require('dotenv').config({ path: '.env.example' });
const bodyparser=require('body-parser');
const nodemailer=require('nodemailer');
const exphbs=require('express-handlebars');

const errorHandler = require('./middleware/error')

const DBConnection = require('./config/db')

dotenv.config({ path: './config/.env' })

DBConnection()

const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const categoryRoutes = require('./routes/categories')
const videoRoutes = require('./routes/videos')
const commentRoutes = require('./routes/comments')
const replyRoutes = require('./routes/replies')
const feelingRoutes = require('./routes/feelings')
const subscriptionRoutes = require('./routes/subscriptions')
const historiesRoutes = require('./routes/histories')
const searchRoutes = require('./routes/search')

const app = express()

app.use(express.json())

app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// File uploading
app.use(
  fileupload({
    createParentPath: true
  })
)

// Sanitize data
app.use(mongoSanitize())

// Set security headers
app.use(helmet())

// Prevent XSS attacks
app.use(xss())

// Enable CORS
app.use(cors())

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 mins
//   max: 100 // 100 request per 10 mins
// })

// app.use(limiter)

// Prevent http param pollution
app.use(hpp())

app.use(express.static(path.join(__dirname, 'public')))

// app.use((req, res, next) => {
//   setTimeout(() => {
//     next()
//   }, 1000)
// })

const versionOne = (routeName) => `/api/v1/${routeName}`

app.use(versionOne('auth'), authRoutes)
app.use(versionOne('users'), userRoutes)
app.use(versionOne('categories'), categoryRoutes)
app.use(versionOne('videos'), videoRoutes)
app.use(versionOne('comments'), commentRoutes)
app.use(versionOne('replies'), replyRoutes)
app.use(versionOne('feelings'), feelingRoutes)
app.use(versionOne('subscriptions'), subscriptionRoutes)
app.use(versionOne('histories'), historiesRoutes)
app.use(versionOne('search'), searchRoutes)

app.use(errorHandler)



const server = app.listen(1000, () => {
  console.log(
    `We are live on ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red)
  // Close server & exit process
  server.close(() => process.exit(1))
})
app.engine('handlebars',exphbs({ extname: "hbs", defaultLayout: false, layoutsDir: "views/ "}));
app.set('view engine','handlebars');

// body parser middleware
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());


//static folder
app.use('/public',express.static(path.join(__dirname, 'public')));


app.get('/',function(req,res){
    res.render('contact');
});

var email;

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);

let transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "7f157ec5072264",
      pass: "7fe34f67c1b6b5"
    }
});
    
app.post('/send',function(req,res){
    email=req.body.email;
    firstname=req.body.firstname

     // send mail with defined transport object
    var mailOptions={
        to: req.body.email,
       subject: `Otp for registration is: ${otp}`,
       html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
       <div style="margin:50px auto;width:70%;padding:20px 0">
         <div style="border-bottom:1px solid #eee">
           <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Your Brand</a>
         </div>
         <p style="font-size:1.1em">Hi ${firstname},</p>
         <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
         <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
         <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
         <hr style="border:none;border-top:1px solid #eee" />
         <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
           <p>Your Brand Inc</p>
           <p>1600 Amphitheatre Parkway</p>
           <p>California</p>
         </div>
       </div>
     </div>` // html body
     };
     
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  
        res.render('otp',{msg:"otp has been sent"});
    });
});

app.post('/verify',function(req,res){

    if(req.body.otp==otp){
       res.render('success')
    }
    else{
        res.render('otp',{msg : 'otp is incorrect'});
    }
});  

app.post('/resend',function(req,res){
  email=req.body.email;
  firstname=req.body.firstname

    var mailOptions={
        to: email,
       subject: `Otp for registration is: ${otp}`,
       html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
       <div style="margin:50px auto;width:70%;padding:20px 0">
         <div style="border-bottom:1px solid #eee">
           <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Your Brand</a>
         </div>
         <p style="font-size:1.1em">Hi ${firstname},</p>
         <p>Thank you for choosing Your Brand. Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
         <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
         <p style="font-size:0.9em;">Regards,<br />Your Brand</p>
         <hr style="border:none;border-top:1px solid #eee" />
         <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
           <p>Your Brand Inc</p>
           <p>1600 Amphitheatre Parkway</p>
           <p>California</p>
         </div>
       </div>
     </div>` // html body
     };
     
     transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        res.render('otp',{msg:"otp has been sent"});
    });

});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
})
