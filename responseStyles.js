/* Styling outputs/messages on Slack uses the Block Kit framework. It's really easy, just follow the JSON template.
You can practice here: https://app.slack.com/block-kit-builder/TAQJ10E3A
*/

// Style output for joke.
// blocks is an array of messages to be sent back to Slack.
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




/* Styling for 'lookup' response
param(query) : what the user inputted, ex: /lookup Avengers -> the query is Avengers
param(data):  the results from the UTelly API
*/
exports.styleLookup = (query, data) =>{
  // If the user  query had no results, create an appropriate response
  if(JSON.stringify(data.results)== '{}'){
    return noResults = {
      response_type: 'in_channel',
      blocks: [
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': `There were no results found for "${query}"`,
          },
        }
      ]
    }
  }

  // Create array of 'messages' that'll be sent back to Slack
  let results = []
  //If there were results returned by the API call, add starter message
  results.push({
    'type': 'section',
    'text': {
      'type': 'mrkdwn',
      'text': `Here are the search results for "${query}"`,
    }
  });
  
  // For each result returned by the API, add the corresponding message
  data.results.map(result =>{
    results.push(
      {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `Watch ${result.name} on the following: \n ${result.locations.map(loc =>{
            return  `<${loc.url}|${loc.display_name}>\n`
          }).join('')}`
        },
        "accessory": {
          "type": "image",
          "image_url": `${result.picture}`,
          "alt_text": "alt text for image"
        },
      })
    // Add a divider to keep output clean
    results.push( {
        "type": "divider"
      });
    });
      
  // Return the array of messages to the channeel.
  return { 
    response_type: 'in_channel',
      blocks: results
    };
}


exports.styleNews = (query, data)=>{
  if(data.totalResults == 0){
    return noResults={
      response_type: 'in_channel',
      blocks: [
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': `There are no news articles for the keyword: "${query}"`,
          },
        }
      ]
    }
  }

  let results= []
  results.push({
    'type': 'section',
    'text': {
      'type': 'mrkdwn',
      'text': `Here are the News Articles for: "${query}"`,
    }
  });

  data.articles.map(result =>{
    var date = new Date(result.publishedAt);
    results.push(
      {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': `*Title:* ${result.title} \n*Date:* ${date} \n *Publisher:* ${result.source.name} \n*Description:* ${result.description}  \n *Read More At:* ${result.url}`,
        },
        "accessory": {
          "type": "image",
          "image_url": `${result.urlToImage}`,
          "alt_text": "alt text for image"
        },

      })
    results.push( {
        "type": "divider"
      });
    });
      
  return { 
    response_type: 'in_channel',
      blocks: results
    };
}

exports.styleDoge = (query, data) =>{
  // If the user  query had no results, create an appropriate response
  if(JSON.stringify(data.results)== '{}'){
    return noResults = {
      response_type: 'in_channel',
      blocks: [
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': `No Doge translation found for "${query}"`,
          },
        }
      ]
    }
  }

  // Create array of 'messages' that'll be sent back to Slack
  let results = []
  //If there were results returned by the API call, add starter message
  results.push({
    'type': 'section',
    'text': {
      'type': 'mrkdwn',
      'text': `You've summon a Doge Translator for: "${query}"\nDoge says: "${data.contents.translated}" `,
    }
  });
  
  // Return the array of messages to the channel.
  return { 
    response_type: 'in_channel',
      blocks: results
    };
}

exports.styleInspire = (quotes) => {
    const random = Math.floor(Math.random() * quotes.length);
    const quote = quotes[random].quote
    const author = quotes[random].author

    return {
        response_type: 'in_channel',
        blocks: [
            {
                'type': 'section',
                'text': {
                    'type': 'mrkdwn',
                    'text': `${quote}`,
                },
            },
            {
                'type': 'section',
                'text': {
                    'type': 'mrkdwn',
                    'text': `*${author}*`
                },
            }
        ]
    };
};
