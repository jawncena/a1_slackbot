const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
var SpellChecker = require('simple-spellchecker');


const {WebClient} = require ('@slack/web-api')
const {createEventAdapter} = require ('@slack/events-api')
const {styleJoke, styleLookup, styleNews, styleInspire, styleDoge, styleFood} = require('./responseStyles');

//nlp dictionary
var dictionary = SpellChecker.getDictionarySync("en-US");    
// Grab ENV Variables
require('dotenv').config();
//Grab Tokens from ENV
const slackEvents = createEventAdapter(process.env.SIGNING_SECRET);
const SlackClient = new WebClient(process.env.SLACK_TOKEN);
const Port = process.env.PORT || 5000;
const UTELLY_API_KEY = process.env.UTELLY_API_KEY;
const UTELLY_HOST = process.env.UTELLY_HOST;

const FOOD_API_KEY = process.env.FOOD_KEY;
const FOOD_HOST = process.env.FOOD_HOST;

const NEWS_API_KEY = process.env.NEWS_API_KEY;

const app = express();
app.use('/slack/events', slackEvents.expressMiddleware());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.listen(Port, function(){
  console.log("App listening");
});

app.get('/', function(req, res) {
  res.send('Server is working!');
});

app.post('/food', async function(req, res) {
  // Saves the user input to a variable
  let query = (req.body.text);
  // Format's the API request as expected. The UTelly API needs specific headers.
  // Check with your API documentation for specifics. If none, follow joke API example.
  let options = {
    method: 'GET',
    url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/search',
    params: {query: `${req.body.text}`},
    headers: {
      'x-rapidapi-key': FOOD_API_KEY,
      'x-rapidapi-host': FOOD_HOST
    }
  };
  await axios.request(options).then((results) =>{
    res.json(
      // Style the data so it looks nice. 
      styleFood(query, results.data)
      );
      //If there are any errors
  }).catch(function (error) {
    console.error(error);
  });
});

// Listener for 'doge' slash command that uses the Doge Translator API
app.post('/doge', async function(req, res) {
  // Saves the user input to a variable
  let query = (req.body.text);
  // Format's the API request as expected
  let options = {
    method: 'GET',
    url: 'https://api.funtranslations.com/translate/doge.json',
    params: {text: `${query}`},
  
  };
  // Make API call, store response in a variable called results.
  await axios.request(options).then((results) =>{
    // Return the data to user
    res.json(
      // Style the data so it looks nice. 
      styleDoge(query, results.data)
      );
      //If there are any errors
  }).catch(function (error) {
    console.error(error);
  });
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
  await axios.request(options).then((results) =>{
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

// Listener for 'news' slash command that uses the News API
app.post('/news', async function(req,res){
let query = req.body.text
//NLP STUFF
//Get your query into an array of words
let wordArray=query.trim().split(" ");
//2 Arrays, one for the wrong spelling and one for suggestions
let typos = []
let spellcheck =[]
//Map and add to arrays
wordArray.forEach(element => {
  if(!dictionary.spellCheck(element)){
    spellcheck.push(element);
    var wordSuggest = dictionary.getSuggestions(element,2,10);
    wordSuggest.forEach(sug=>{
      typos.push(sug);
    })
   
  }
});
// End of NLP Stuff
let options ={
  method: 'GET',
  url:'https://newsapi.org/v2/everything',
  params:{q: `${req.body.text}`, pageSize:'5'},
  headers:{
    'X-Api-Key':NEWS_API_KEY ,
  }
};

await axios.request(options).then((results)=>{
  res.json(
    styleNews(spellcheck,typos,query,results.data)
  );
}).catch(function(error){
  res.json(
    styleNews(spellcheck,typos,query,"")
  );
  //console.error(error);
})
});

app.post('/inspire', async function(req, res) {
  await axios.get('https://raw.githubusercontent.com/BolajiAyodeji/inspireNuggets/master/src/quotes.json')
      .then((inspire) => {
        res.json(styleInspire(inspire.data));
      })
  }
);

//When bot is mentioned
slackEvents.on('app_mention', (event)=>{
  // Server status
  console.log(`Got message from user ${event.user}: ${event.text}`);
(async () => {
  try {
    if(event.text.includes("?")){
      await SlackClient.chat.postMessage({ channel: event.channel, text: `${event.text}`});
    };

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