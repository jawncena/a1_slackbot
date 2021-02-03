const {WebClient} = require ('@slack/web-api')
const {createEventAdapter} = require ('@slack/events-api')

// Grab ENV Variables
require('dotenv').config()

//Grab Tokens from ENV
const SlackEvents = createEventAdapter(process.env.SIGNING_SECRET)
const SlackClient = new WebClient(process.env.SLACK_TOKEN)
const Port = process.env.PORT || 3000;

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

// Start Server on port
SlackEvents.start(Port).then(()=>{
    console.log(`Server started on port ${Port}`)
})