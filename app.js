const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const {WebClient} = require ('@slack/web-api')
const {createEventAdapter} = require ('@slack/events-api')
const {styleJoke, styleLookup, styleNews} = require('./responseStyles');

// Grab ENV Variables
require('dotenv').config()
//Grab Tokens from ENV
const slackEvents = createEventAdapter(process.env.SIGNING_SECRET)
const SlackClient = new WebClient(process.env.SLACK_TOKEN)
const Port = process.env.PORT || 5000;
const UTELLY_API_KEY = process.env.UTELLY_API_KEY;
const UTELLY_HOST = process.env.UTELLY_HOST;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

const app = express()
app.use('/slack/events', slackEvents.expressMiddleware())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.listen(Port, function(){
  console.log("App listening");
});
app.get('/', function(req, res) {
  res.send('Server is working!');
});

// Creates response, whenever Slack sends a request to the /joke request url
app.post('/joke', async function(req, res) {
  await axios.get('https://official-joke-api.appspot.com/random_joke')
    .then((joke)=>{
      console.log(joke.data);
      res.json(styleJoke(joke.data));
    })
});

// Listener for 'lookup' slash command that uses the UTelly API
app.post('/lookup', async function(req, res) {
  // Saves the user input to a variable
  let query = (req.body.text);
  // Format's the API request as expected. The UTelly API needs specific headers.
  // Check with your API documentation for specifics. If none, follow joke API example.
  let options = {
    method: 'GET',
    url: 'https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com/lookup',
    params: {term: `${req.body.text}`, country: 'ca'},
    headers: {
      'x-rapidapi-key': UTELLY_API_KEY,
      'x-rapidapi-host': UTELLY_HOST
    }
  };
  // Make API call, store response in a variable called results.
  axios.request(options).then((results) =>{
    // Return the data to user
    res.json(
      // Style the data so it looks nice. 
      styleLookup(query, results.data)
      );
      //If there are any errors
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/news', async function(req,res){
let query = (req.body.text)

let options ={
  method: 'GET',
  url:'https://newsapi.org/v2/everything',
  params:{q: `${req.body.text}`, pageSize:'5'},
  headers:{
    'X-Api-Key':NEWS_API_KEY ,
  }
};
axios.request(options).then((results)=>{
  res.json(
    styleNews(query,results.data)
  );
}).catch(function(error){
  console.error(error);
})
});

//When bot is mentioned
slackEvents.on('app_mention', (event)=>{
    // Server status
    console.log(`Got message from user ${event.user}: ${event.text}`);
  (async () => {
    try {
        //Post Message
      await SlackClient.chat.postMessage({ channel: event.channel, text: `Hello, this is wayne` })
    } catch (error) {
      console.log(error.data)
    }
  })()
})
slackEvents.on('error', console.error)

// // Start Server on port
slackEvents.start(8080).then(()=>{
    console.log(`Server started on port ${Port}`)
})