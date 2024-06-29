const express = require('express');
const path = require('path');
const fs = require('fs');
const client = require('mongodb').MongoClient;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dboard = require('./routes/routes.js');
const multer = require('multer');
const server = express();

server.use(express.static('public'));
server.use(express.urlencoded({extended:false}));

server.set("view engine", "ejs");

//session and cookie creation

const oneday = 1000*60*60*24;
server.use(cookieParser());
server.use(session({
    saveUninitialized: true,
    resave:false,
    secret: 'ggfg#153246',
    cookie:{
        maxAge: oneday
    }
}))

let carZone;
let users;
let cars;
//let parts;
let comments;

// server.get('/signup',(req,res)=>{
//     res.sendFile(path.join(__dirname,'/public/signup.html'));
// })

// connecting database

client.connect("mongodb://127.0.0.1:27017").then(result=>{
    console.log("DB connected.........");
    carZone = result.db('CarZone');
    users = carZone.collection('Users');
    cars = carZone.collection('CarDeals');
    //parts = carZone.collection('partDeals');
    comments = carZone.collection('comments');
}).catch(err=>{
    console.log("db  onnection failed............"+err);
})

server.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'/public/login.html'));
})

// authenticating user

server.post('/login',(req,res)=>{
    users.find({}).toArray().then(result=>{
        const resultArr = result.filter(ele => {
            return (ele.username===req.body.username && ele.password===req.body.password && ele.role===req.body.role);           
        });
        if(resultArr.length>0){
            req.session.username=req.body.username;
            req.session.role=req.body.role;
            res.redirect('/dashboard');
        }
        else{
            res.redirect('/signup.html')
        }
    })
    // fs.readFile('./public/users.json',(err,data)=>{
    //     if(err){
    //         throw err;
    //     }
    //     const val = JSON.parse(data);
    //     //console.log(val);
    //     const resultarr = val.Users.filter((ele)=>{
    //         return (ele.username===req.body.username && ele.password===req.body.password && ele.role===req.body.role);
    //     })
        
    // })
})

server.get('/signup',(req,res)=>{
    res.sendFile(path.join(__dirname,'/public/signup.html'));
})

//creating another user account and adding it to database

server.post('/signup',(req,res)=>{
    users.find({}).toArray().then(result=>{
        const resultArr = result.filter(ele => {
            return (ele.username===req.body.username && ele.password===req.body.password && ele.role===req.body.role);           
        });
        if(resultArr.length>0){
            res.redirect('/dashboard');
        }
        else{
            var robj={
                "username": req.body.username,
                "password": req.body.password,
                "email": req.body.email,
                "sques": req.body.ques,
                "sans": req.body.ans,
                "role": req.body.role
            }
            users.insertOne(robj).then(result=>{
                console.log(result);
                req.session.username = req.body.username;
                req.session.role = req.body.role;
                res.redirect('/dashboard');
            })
        }
    })
})

var ques;
var name;
var mail;
var ans;

server.get('/fpass', (req,res)=>{
    // console.log("Forgot password page requested......");
    res.render('fpass');
})

// forget password

server.post('/fpass',(req,res)=>{
    // console.log(req.body.username + '\n' +req.body.mail);
    users.find({}).toArray().then(result =>{
        result.filter(ele=>{
            if(ele.username==req.body.username && ele.email==req.body.mail && ele.role == req.body.role){
                name = ele.username;
                mail = ele.email;
                ques =  ele.sques;
                ans = ele.sans;
                //console.log("Targetted data found...........");
            }
        })
        if(ques){
            res.render('fpass',{"ques": ques});
        }
        else{
            res.redirect('/signup');
        }
    })
})

server.post('/forgot',(req,res)=>{
    if(ans==req.body.sol){
        users.updateOne({username:name, email:mail},{$set:{password:req.body.pass}});
        res.redirect('/login');
    }
    else{
        res.redirect('/');
    }
})

var fname;

//storing image

const mstorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, './public/file')
    },
    filename:(req,file,cb)=>{
        fname = Date.now()+path.extname(file.originalname);
        cb(null, fname);
    }
})

const upload = multer({storage:mstorage});

// adding data related to new car

server.post('/sellcar',upload.single('img'),(req,res)=>{
    var cobj = {
        "username": req.body.name,
        "car_name": req.body.cname,
        "car_company": req.body.cmpny,
        "price":req.body.price,
        "distance_travelled":req.body.distance,
        "fines":req.body.fines,
        "registration_Number":req.body.rnum,
        "rc_expiry":req.body.rexpiry,
        "category":req.body.category,
        "problems":req.body.prblm,
        "color":req.body.color,
        "image":fname,
        "specs":req.body.specification
    }
    cars.insertOne(cobj).then(result=>{
        console.log(result);
        // req.session.username = req.body.username;
        // req.session.role = req.body.role;
        res.redirect('/dashboard');
    })
})

// server.post('/getCar',(req,res)=>{
//     cars.deleteOne(_id=req.body.id);
//     res.redirect('/dashboard/buy');
// })

server.post('/comment',(req,res)=>{
    var robj={
        "username": req.body.nme,
        "comments": req.body.cmnt,
    }
    comments.insertOne(robj).then(result=>{
        console.log("Comment Added");
        res.redirect('/dashboard');
    })
})

// logout button

server.get('/lgout',(req,res)=>{
    req.session.destroy();
    res.redirect("/");
})

server.use('/dashboard',checkred,dboard);

// middleware

function checkred(req,res,next){
    if(req.session.username){
        next();
    }
    else{
        res.redirect('/login');
    }
}

server.listen(4001,()=>{
    console.log("Server revving up at 4001..........");
})