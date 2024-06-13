const express = require('express');
const path = require('path');
const client = require('mongodb').MongoClient;
const router = express.Router();

let carZone;
let cars;
let comments;

client.connect("mongodb://127.0.0.1:27017").then(result=>{
    console.log("DB connected to routes.........");
    carZone = result.db('CarZone');
    cars = carZone.collection('CarDeals');
    comments = carZone.collection('comments');
}).catch(err=>{
    console.log("db  connection failed............"+err);
})

// let carpics = [];
// cars.find({}).toArray.then((result)=>{
//     const resultArr = result;
// });

router.get('/',(req, res)=>{
    res.render('dashboard',{"name":req.session.username});
})

router.get('/buy',(req,res)=>{
    //var carpics = [];
    cars.find({}).toArray().then(result=>{
        // result.forEach(element => {
        //     var obj = {
        //         "_id":element._id,
        //         "pic":element.image
        //     }
        //     carpics.push(obj);
        // });
        res.render('buy',{"name":req.session.username,"pics":result});
    })
    // res.render('buy',{"name":req.session.username,"pics":carpics});
})

router.get('/sell',(req,res)=>{
    res.render('sell',{"name":req.session.username});
})

router.get('/know',(req,res)=>{
    res.render('know',{"name":req.session.username});
})

router.get('/know/:country',(req,res)=>{
    res.render(req.params.country,{"name":req.session.username});
})

router.get('/contactus',(req,res)=>{
    comments.find({}).toArray().then(result=>{
        res.render('contactus',{"name":req.session.username,"comment":result});
    })
    //res.render('contactus',{"name":req.session.username});
})

router.get('/aboutus',(req,res)=>{
    res.render('aboutus',{"name":req.session.username});
})

module.exports = router;