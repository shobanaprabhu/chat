'use strict';

var url = require('url');

var dialogflow= require('dialogflow').v2beta1;
module.exports = {
    

    getEventName: function (msg) {
        var eventName = "";
        try {
            console.log(msg)
            var boturlparts = url.parse(msg);
            if (typeof boturlparts !== 'undefined') {
                //console.log("boturlparts:", boturlparts);
                if(boturlparts.path){
                    var path = boturlparts.path.split('/');
                    if (path.length == 3) {
                        eventName = path[2];
                    }
                }
            }
            return eventName;
        } catch (e) {
            return eventName;
        }
    },

    sendEvent: function (id, sessionId, data, callback) {
        var postData = {
            method: 'event',
            id: id,
            session: sessionId,
            params: data
        };
        prepareContextsAndSendEventToAI(postData,callback);
    },

    chat: function (id, sessionId, data, callback) {
        var postData = {
            method: 'chat',
            id: id,
            session: sessionId,
            params: data
        };
        prepareContextsAndSendEventToAI(postData,callback);
    }
    
    
};


async function prepareContextsAndSendEventToAI(data,callback) {
    var eventName = data.params.msg;
    var userinfo = data.params.user;
    var bot = {};
    var request;
    var urlpart = url.parse(eventName);
    if (typeof urlpart !== 'undefined') {
        var path = urlpart.path.split('/');
        
        var contexts = [{ name: "BOT", parameters: bot }];
        if (userinfo) {
            contexts.push({ name: "USER", parameters: userinfo });
        }
        const sessionClient = new dialogflow.SessionsClient({keyFilename: "/home/shobanag/chatbot/lib/api/key1.json"});
        const sessionPath = sessionClient.sessionPath("texesupport-iqcbho", data.session);
  
        if (data.params.chatText) {
          
          request = {
            session: sessionPath,
            queryInput: {
              text: {
                text: data.params.chatText,
                languageCode: 'en-US',
              },
              queryParams: {
                //contexts:contexts
              },
            },
          };
            
        } else {
            request = {
              session: sessionPath,
              queryInput: {
                event: {
                  name: path[2],
                  languageCode:'en-US'
                }
              },
              queryParams:{
                //contexts:contexts
              },
            };
        }
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        if (result.intent) {
          processResponse(data.id, data.session, result, callback);
        } else {
          console.log(`  No intent matched.`);
        }
    }
}
function processResponse(id, sessionId, response, callback) {
    if (response && response && response.outputContexts) {
      var output = formatBotL(id, sessionId, response);
      callback(null, output);
    } else {
      callback(null, { id: id, session: sessionId, reply: { msg: 'No response.' }, debug: response });
    }
}
function formatBotL(id, sessionId, response) {
    var fulfillmentMessage = '';
    if (response && response.fulfillmentMessages) {
      fulfillmentMessage = response.fulfillmentMessages;
    }
    var contexts = response.outputContexts;
  
    var output = {
      id: id,
      method: 'message',
      session: sessionId,
      params: {
        originator: 'texebot',
        user: {},
        bot: {},
        data: {}
      },
    };
    var result_contexts = [];
    for (var i in contexts) {
      if (contexts[i] && contexts[i].name.toLowerCase() == 'bot') {
        output.params.bot = contexts[i].parameters;
       
      } else if (contexts[i] && contexts[i].name.toLowerCase() == 'user') {
        output.params.user = contexts[i].parameters;
        result_contexts.push(contexts[i]);
      } else {
        result_contexts.push(contexts[i]);
      }
    }
  
    for (var message in fulfillmentMessage) {
      if (fulfillmentMessage[message].simpleResponses) {
        output.params.data.text = fulfillmentMessage[message].simpleResponses.simpleResponses[0].textToSpeech;
      } else if (fulfillmentMessage[message].carouselSelect) {

          output.params.data.card = fulfillmentMessage[message].carouselSelect;

      } else if (fulfillmentMessage[message]. suggestions) {
        output.params.data.option = fulfillmentMessage[message].suggestions.suggestions;
      }
      else if(fulfillmentMessage[message].listSelect) {
        output.params.data.option = fulfillmentMessage[message].listSelect.items;
      }

    }
  
    output.params.bot.contexts = result_contexts;
    /*if (response.result.fulfillment.messages && response.result.fulfillment.messages.length > 0) {
      var fulfillmentMessageSpeech = '';
      for (var message in fulfillmentMessage) {
  
        if (fulfillmentMessage[message].type === 0 && fulfillmentMessage[message].speech) {
          output.params.data.text = fulfillmentMessage[message].speech;
          fulfillmentMessageSpeech = fulfillmentMessage[message].speech;
        }
  
        if (fulfillmentMessage[message].type === 4) {
          if (fulfillmentMessage[message].payload && fulfillmentMessage[message].payload.client &&
            fulfillmentMessage[message].payload.client.text && fulfillmentMessage[message].payload.client.text !== '@api.ai:fulfillment.speech') {
            output.params.data.text = fulfillmentMessage[message].payload.client.text;
          }
          if (fulfillmentMessage[message].payload && fulfillmentMessage[message].payload.client) {
            if (fulfillmentMessage[message].payload.client.option) {
              output.params.data.option = fulfillmentMessage[message].payload.client.option;
            }
            if (fulfillmentMessage[message].payload.client.card) {
              output.params.data.card = fulfillmentMessage[message].payload.client.card;
            }
            if (fulfillmentMessage[message].payload.client.menu) {
              for (var index in fulfillmentMessage[message].payload.client.menu) {
                if (fulfillmentMessage[message].payload.client.menu[index].text && fulfillmentMessage[message].payload.client.menu[index].text === '@api.ai:fulfillment.speech' && fulfillmentMessageSpeech) {
                  fulfillmentMessage[message].payload.client.menu[index].text = fulfillmentMessageSpeech;
                }
              }
              output.params.data.menu = fulfillmentMessage[message].payload.client.menu;
            }
            if (fulfillmentMessage[message].payload.client.action) {
              output.params.data.action = fulfillmentMessage[message].payload.client.action;
            }
            if (fulfillmentMessage[message].payload.client.reference) {
              output.params.data.reference = fulfillmentMessage[message].payload.client.reference;
            }
            if (fulfillmentMessage[message].payload.client.command) {
              output.params.data.command = fulfillmentMessage[message].payload.client.command;
            }
            if (fulfillmentMessage[message].payload.client.style) {
              output.params.data.style = fulfillmentMessage[message].payload.client.style;
            }
          }
        }
  
      }
    }*/
    return output;
}