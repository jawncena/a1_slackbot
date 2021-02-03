const express = require('express');
const bodyParser = require('body-parser');
const {WebClient} = require ('@slack/web-api')
const {createEventAdapter} = require ('@slack/events-api')

const app = express().use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

// Grab ENV Variables
require('dotenv').config()



//Grab Tokens from ENV
const SlackEvents = createEventAdapter(process.env.SIGNING_SECRET)
const SlackClient = new WebClient(process.env.SLACK_TOKEN)
const Port = process.env.PORT || 5000;

app.listen(Port, function(){
  console.log("App listening");
});
app.get('/', function(req, res) {
  res.send('Server is working! Path Hit: ' + req.url);
});
app.use('/slack/events', slackEvents.expressMiddleware())

app.get('/oauth', function(req, res) {
  // When authorizing app, a code query param is passed on the oAuth endpoint.
  // If that code is not there, we respond with an error message
  if (!req.query.code) {
    res.status(500);
    res.send({'Error': 'Looks like we\'re not getting code.'});
    console.log('Looks like we\'re not getting code.');
  } else {
    // If it's there...

    // We'll do a GET call to Slack's `oauth.access` endpoint,
    // passing app's client ID secret, & the code we just got as query params.
    request({
      url: 'https://slack.com/api/oauth.access', // URL to hit
      qs: {
        code: req.query.code,
        client_id: clientId,
        client_secret: clientSecret},
      method: 'GET', // Specify the method

    }, function(error, response, body) {
      if (error) {
        console.log(error);
      } else {
        res.json(body);
      }
    });
  }
});

//When bot is mentioned
SlackEvents.on('app_mention', (event)=>{
    // Server status
    console.log(`Got message from user ${event.user}: ${event.text}`);
  (async () => {
    try {
        //Post Message
      await SlackClient.chat.postMessage({ channel: event.channel, text: `${event.text}` })
    } catch (error) {
      console.log(error.data)
    }
  })()
})
SlackEvents.on('error', console.error)

// // Start Server on port
SlackEvents.start(8080).then(()=>{
    console.log(`Server started on port ${Port}`)
})