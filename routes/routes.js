const express = require('express');
const path = require('path');
const client = require('mongodb').MongoClient;
const router = express.Router();

let carZone;
let cars;

client.connect("mongodb://127.0.0.1:27017").then(result=>{
    console.log("DB connected.........");
    carZone = result.db('CarZone');
    cars = carZone.collection('CarDeals');
}).catch(err=>{
    console.log("db  onnection failed............"+err);
})

// let carpics = [];
// cars.find({}).toArray.then((result)=>{
//     const resultArr = result;
// });

router.get('/',(req, res)=>{
    res.render('dashboard',{"name":req.session.username});
})

router.get('/buy',(req,res)=>{
    res.render('buy',{"name":req.session.username});
})

router.get('/sell',(req,res)=>{
    res.render('sell',{"name":req.session.username});
})

router.get('/know',(req,res)=>{
    res.render('know',{"name":req.session.username});
})

router.get('/contactus',(req,res)=>{
    res.render('contactus',{"name":req.session.username});
})

router.get('/aboutus',(req,res)=>{
    res.render('aboutus',{"name":req.session.username});
})

module.exports = router;