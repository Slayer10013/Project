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
let parts;

// server.get('/signup',(req,res)=>{
//     res.sendFile(path.join(__dirname,'/public/signup.html'));
// })

client.connect("mongodb://127.0.0.1:27017").then(result=>{
    console.log("DB connected.........");
    carZone = result.db('CarZone');
    users = carZone.collection('Users');
    cars = carZone.collection('CarDeals');
    parts = carZone.collection('partDeals');
}).catch(err=>{
    console.log("db  onnection failed............"+err);
})

server.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'/public/login.html'));
})

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
    res.sendFile(path.join(__dirname,'/public/signup.html'))
})

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

var fname;

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

server.post('/getCar', (req,res)=>{
    res.redirect('/dashboard/gCar');
})

server.get('/lgout',(req,res)=>{
    req.session.destroy();
    res.redirect("/");
})

server.use('/dashboard',checkred,dboard);

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