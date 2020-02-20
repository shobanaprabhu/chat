var bot = require("./bot.js");
var utils = require("../utils.js");

function handle(data, connection, callback, request) {

    if (data && data.params && data.params.msg) {
    var eventName = bot.getEventName(data.params.msg);
         if (!eventName) {
            return callback(400, {
                id: data.id,
                session: data.session,
                reply: {
                    msg: 'Invalid or no event name'
                },
                debug: data
            }, true);
        }

        if(data.session)
           var sessionId= data.session;
        else
            var sessionId = utils.generateSessionId();


        callback(null, {
            id: (data && data.id) ? data.id : "",
            type: 'ack',
            session: sessionId,
            params: {
                originator: 'Texecombot',
                bot: data.params.bot,
                msg_id: data.params.msg_id
            }
        }, true);

        bot.sendEvent(data.id, sessionId, data.params, function (status, obj) {
            callback(status, obj, true);

        });


    } else {
        callback(400, {
            id: (data && data.id) ? data.id : "",
            session: (data && data.session) ? data.session : "",
            reply: {
                msg: 'Invalid request data'
            },
            debug: data
        }, true);
    }
}
exports.handle = handle;