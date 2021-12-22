//initialize firebase
const functions = require("firebase-functions");
const admin = require("firebase-admin");
var serviceAccount = require("./permissions.json"); //Servive account private key so keep it private
// Authorize
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
//Use Express and Cors
const express = require("express");
const cors = require("cors");
const app = express();
//Database Refrence;
const db = admin.firestore();

app.use( cors({origin:true}));

//genel function for sending back single document
function sendSingleResponse(query,res){
    //send the query to db
    query.get()
    .then((doc) => {    
        //check if the document was found
        if(typeof doc.data() != "undefined"){
            //send document id with rest of the data
            temp = doc.data();
            temp.id = doc.id; 
            return res.status(200).send(temp);
        }  
        else{
            //return an errof if the document was not found
            return res.status(500).send({errorDescription: "Dokumend nie znaleziony"});
        }
       
})
}
//genel function for sending back a list of documents
function sendListResponse(query,res,specialCase = ""){
    //initiazie response as an empty array
    let response = [];
    //send the query to db
   
    query.get()
    .then((querySnapshot) => {
        //loop for every document                   
        querySnapshot.forEach((doc) => { 
         
            if(typeof doc.data() != "undefined"){
             
                //read the document
                temp = doc.data();
                temp.id = doc.id;  
                //chceck if there is a field named date
                if(typeof temp.date != "undefined"){
                    //change timestamp for a date string;
                    date = new Date(temp.date._seconds*1000);
                    temp.date = (date.getDate()+'/'+date.getMonth()+1)+'/'+date.getFullYear();     
                }           
                response.push(temp);
            }
            else{
                
                //return an error if there were no documents found
                return res.status(500).send({errorDescription: "Documents you requested were not found"});
            }
           
    });
   
        return res.status(200).send(response);    
    })
}
//not yet finished
app.get('/api/news',(req,res) => {      //?page=0&items=25
    //initialize parameters
    let page = parseInt(req.query.page || 0);
    let items = parseInt(req.query.items || 25);
   
    //send querry need to implement page selection
    let querry = db.collection('news').orderBy('date','desc').limit(items); 
    sendListResponse(querry,res);
   

});

exports.app = functions.region('europe-west1').https.onRequest(app);