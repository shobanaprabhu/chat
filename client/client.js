var uuid = false;
var bot = {};
var socket;
var session = false;
var global_user = {
  "given-name": 'shobana',
  "guid": '46feigz5eg',
  "email": "shobanag@texe.com"
};





function setFormValue(name, value) {
  $('#' + name).val(value);
}

function appendFormValue(name, value) {
  $('#' + name).append(value).animate({
    scrollTop: $('#' + name).prop("scrollHeight")
  }, 500);
}

var startTime = new Date().getTime();
var sequence = 1;





function wsSend(socket, text) {
  startTime = new Date().getTime();
  try {
    console.log("wsSend", text);
    var record = JSON.parse(text);
    if(record.params.chatText)
      message('<div class="chattextright">' + record.params.chatText + '</div>', 'right');
    if (socket && socket.readyState === 1) {
      socket.send(text);
    } else {
      setTimeout(openWSConnection(), 5000);
    }
  } catch (exception) {

  }
}

function openWSConnection() {
  host = "ws://localhost:3000/bot/1";

  try {
    socket = new WebSocket(host);
    socket.onopen = function () {
      sendBotEvent(socket, session, "event", {
        originator: 'user',
        user: global_user,
        msg: 'bot://support.texecom.com/texesupport/Welcome',
        text: '',
        show: false
      });
    };

    socket.onmessage = function (msg) {
      var data = JSON.parse(msg.data);
      var text = "Cloud bot didn't response?";
      if (data && data.type && data.type === 'ack') {
        createCookie("botSession", data.session, 7);
        return;
      }

      if (data && data.params && data.params.bot) {
        localStorage.setItem("bot", JSON.stringify(data.params.bot));
        bot = data.params.bot;
      }

      botL = data.params;
      if (botL && typeof botL.data !== 'undefined' && typeof botL.data.text !== 'undefined') {
        text = botL.data.text;
      } 
      if (text && text !== '<p></p>') {
        message('<div class="chattextleft"><div class="avatar"></div>' + text + '</div>', 'left');
      }
      var str = prettyJSON(botL);

      if (typeof str !== 'undefined')
        message('<div class="chattextleft"><div class="avatar"></div>' + str + '</div>', 'left');

    };

    socket.onclose = function () {
      console.log('Socket Status: ' + socket.readyState + ' (Closed)');
    };
    socket.onerror = function (error) {
      console.log('Socket Status Error : ', error);
    };
  } catch (exception) {
    console.log('WebSocket Error: ' + exception);
  }




  return socket;
}

function prettyJSON(data) {
  var options = "";
  var cards = '';
  console.log('prettyJSON', data);


  if (data && data.data && data.data.option) {
    var optionData = data.data.option;
    //console.log("OPTION",optionData);
    for (dataIndex in optionData) {
      var data = optionData[dataIndex];
      var onclick = "";
      if (typeof data.info !== 'undefined') {
        onclick = ' href="" onclick="sendBotEvent(socket,session, \'event\', {msg: \'bot://support.texecom.com/texesupport/' + data.info.key + '\', text: \'' + (data.title ? data.title.replace(/'/g, '&lsquo;') : '') + '\', tt: 0});return false;"';
      }
      options += '<div id="botoption" class="botoption"><a' + onclick + '>' + data.title + '</a></div>';
    }
    return options;
  }
  
  if (data && data.data && data.data.card) {
    var cardData = data.data.card;

    for (dataIndex in cardData.items) {
      var crddata = cardData.items[dataIndex];
      var onclick = "";
      if (typeof crddata.info !== 'undefined') {
        onclick = ' href="" onclick="sendBotEvent(socket, session, \'event\', {msg: \'bot://support.texecom.com/texesupport/' + crddata.info.key + '\', text: \'' + (crddata.title ? crddata.title.replace(/'/g, '&lsquo;').replace(/"/g, '&lsquo;') : '') + '\'});return false;"';
      }
      var imageurl = "";
      if (typeof crddata.image !== 'undefined') {
        imageurl = '<img class="card-image" src="' + crddata.image.imageUri + '"></div>';
        cards += '<div class="card"><a' + onclick + '><div class="round-image">' + imageurl + '<p class="label">' + crddata.title + '</p></a></div>';
      }

    }
    cards = '<div class="deckinner">' + cards + '</div>';
    return cards;
  }
  
}



function message(msg, align) {
  appendFormValue('chatLog', '<div class="chatBlock message' + align + '">' + msg + '</div>');
}


function createCookie(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + "=" + value + ";expires=" + date.toUTCString() + ";path=/";
  } else {
    console.log("ERROR: set cookie require ttl.");
  }
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return false;
}

function sendBotEvent(socket, session,method, params) {
  console.log("sendBotEvent");
  try {
    params.originator = 'user';
    params.bot = bot;
    if (!params.user) {
      params.user = global_user;
    }
    data = {
      session: session,
      method: method,
      params: params
    };

    wsSend(socket, JSON.stringify(data));
  } catch (e) {
    console.log(e);
  }
}



$(document).ready(function () {
    localbot = localStorage.getItem("bot");
    bot =  JSON.parse(localbot);
    if(!bot){
      bot = {};
    }
    socket = openWSConnection();
    $('#' + '0txt').keypress(function (event) {
      try{
        // On Enter, send message to server
        if (event.keyCode == '13') {
          if ($('#' +'0txt').val()) 
            sendBotEvent(socket, session, 'chat', {msg:'bot://support.texecom.com/texesupport/',chatText:$('#' +'0txt').val()});
          $('#' + '0txt').val("");
          
        }
      }catch(e){
        console.log(e);
      }
    });
    $('#' + '0btn').click(function () {
      if ($('#' + '0txt').val()) if ($('#' +'0txt').val()) 
        sendBotEvent(socket, session, 'chat', {msg:'bot://support.texecom.com/texesupport/',chatText:$('#' +'0txt').val()});
      $('#' + '0txt').val("");
    });
});
