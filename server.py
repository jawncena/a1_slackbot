import slack
import os
from pathlib import Path
from flask import Flask, render_template
from dotenv import load_dotenv
from slackeventsapi import SlackEventAdapter

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World"

env_path = Path('.') / '.env'
load_dotenv(dotenv_path=env_path)
slack_event_adapter = SlackEventAdapter(os.environ['SIGNING_SECRET'],'/slack/events',app)

client = slack.WebClient(token=os.environ['SLACK_TOKEN'])

client.chat_postMessage(channel="general", text='Hellooo')

BOT_ID = client.api_call("auth.test")['user_id']
@slack_event_adapter.on('message')
def message(payload):
    print(payload)
    event = payload.get('event',{})
    channel_id = event.get('channel')
    user_id = event.get('user')
    text2 = event.get('text')
    if BOT_ID !=user_id:
        client.chat_postMessage(channel=channel_id, text="༼ ༎ຶ ‿ ༎ຶ༽")

# Run the webserver micro-service
if __name__ == "__main__":
    app.run(debug=True)