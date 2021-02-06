/* Styling outputs/messages on Slack uses the Block Kit framework. It's really easy, just follow the JSON template.
You can practice here: https://app.slack.com/block-kit-builder/TAQJ10E3A
*/
exports.styleJoke = (joke) => {
    return  jokeBlockKit = {
        response_type: 'in_channel',
        blocks: [
          {
            'type': 'section',
            'text': {
              'type': 'mrkdwn',
              'text': `${joke.setup}`,
            },
          },
          {
            'type': 'section',
            'text': {
              'type': 'mrkdwn',
              'text': ` ${joke.punchline}`,
            },
          }
        ]
    };
};