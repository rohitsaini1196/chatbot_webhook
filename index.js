const express = require('express');
const app = express();
const dfff = require('dialogflow-fulfillment');

var admin = require("firebase-admin");

var serviceAccount = require('./config/stbot-31fd4-firebase-adminsdk-a79b5-1bd144a965.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://stbot-31fd4.firebaseio.com"
  });

  console.log("Connected to DB");
  
} catch (error) {
  console.log("Error here" + error);
  
}

var db = admin.firestore();

app.get('/', (req, res)=>{
    res.send("We are live")
});

app.post('/', express.json(), (req, res)=>{
    const agent = new dfff.WebhookClient({
        request : req,
        response : res
    });

    function demo(agent){
        agent.add("Sending response from Webhook server as v1.1.11.1");
    }
    function customPayloadDemo(agent){
        var payloadData = {
            "richContent": [
              [
                {
                  "type": "accordion",
                  "title": "Accordion title",
                  "subtitle": "Accordion subtitle",
                  "image": {
                    "src": {
                      "rawUrl": "https://example.com/images/logo.png"
                    }
                  },
                  "text": "Accordion text"
                }
              ]
            ]
          }

          agent.add( new dfff.Payload(agent.UNSPECIFIED, payloadData, {sendAsMessage: true, rawPayload: true }))
    }

    function finalConfirmation(agent){
      var name = agent.context.get("awaiting_name").parameters['given-name'];
      var email = agent.context.get("awaiting_email").parameters.email;

      console.log(name);
      console.log(email);


      

      agent.add(`Hello ${name}, your email: ${email}. We confirmed your meeting.`);

      return db.collection('meeting').add({
        name : name,
        email : email,
        time : Date.now()
      }).then(ref =>

        //fetching free slots from G-cal
        console.log("Meeting details added to DB")
        )

    }


    var intentMap = new Map();
    intentMap.set('finalConfirmation', finalConfirmation)
    intentMap.set('webhookDemo',demo )
    intentMap.set('customPayloadDemo', customPayloadDemo)
    

    agent.handleRequest(intentMap);

});

app.listen(3333, ()=>console.log("Server is live at port 3333"));
