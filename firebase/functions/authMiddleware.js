//This code will execue before the server gets the request
//----- NOT YET TESTED SINCE IN ORDER TO FULLY TEST IT WEBSITE MUST BE RUNNING-------
//firebase imports
const admin = require("firebase-admin");
const db = admin.firestore();
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();

module.exports = validateToken = function(authType){
    //authType shoud be 
    //any         anyone with an account can enter
    //edit        only editors and admins
    //admin       only admins 
    return (async(req,res,next) => {
        //check if authorization token was provided
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)) {
        res.status(403).send('No authorization token provided');
        return;
    }
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        // Read the token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
      } else if(req.cookies) {
        // Read the token from cookie.
        idToken = req.cookies.__session;
      } else {
        // No cookie
        res.status(403).send('Unable to read the authorization token');
        return;
      }
      try {
        //verify the provided token
        const ticket = await client.verifyIdToken({
            idToken: idToken,
        });
        //get user data
        const payload = ticket.getPayload();
        //get user id
        const userid = payload['sub'];
        //allow only school emails
        if(payload.hd === "lo1.gliwice.pl"){
            db.collection(user).doc(userid).get().then(doc=>{
                if(doc.data() === "undefined"){
                    //user is not yet in the database
                    let data = {
                        name: payload.email,
                        editor: false,
                        admin: false,
                        event_ids: [],
                    }
                    db.collection.doc(userid).set(data);
                    if(authType === 'any'){
                        //send back user info
                        req.email = payload.email;
                        req.id = userid;
                        //accept the request
                        next();
                        return;

                    }else{
                        res.status(403).send("You are not authorized to do that");

                    }
                }
                else{
                    if(authType ==="edit"){
                        if(doc.data().admin||doc.data().editor){
                            //send back user info
                            req.email = payload.email;
                            req.id = userid;
                            //accept the request
                            next();
                            return;

                        }
                        else{
                            res.status(403).send("You are not authorized to do that");

                        }
                    }
                    else if(authType === 'admin'){
                        if(doc.data().admin){
                            //send back user info
                            req.email = payload.email;
                            req.id = userid;
                            //accept the request
                            next();
                            return;

                        }
                        else{
                            res.status(403).send("You are not authorized to do that");

                        }
                        }

                    }

                }
            )
            
            
        }else{
            res.status(403).send('Only school account are allowed');
            return;
        }
        
        
      } catch (error) {
        res.status(403).send('Some unknow error occured');
        return;
      }

    })




};