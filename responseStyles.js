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