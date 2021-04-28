let currentRecipient = '';
let chatInput = $('#input');
// let chatButton = $('#btn-send');
let userList = $('#chat-list');
let messageList = $('#messages');


// this will be used to store the date of the last message
// in the message area
let lastDate = "";


function updateUserList() {
    $.getJSON('/api/v1/user/', function (data) {
        userList.children('.user').remove();
        for (let i = 0; i < data.length; i++) {
            const userItem = `
                <div class="chat-list-item d-flex flex-row w-100 p-2 border-bottom" onclick="getConversation(this, '${data[i]['username']}')">
                    <img src="${static_url}/img/profilepic.png" alt="Profile Photo" class="img-fluid rounded-circle mr-2" style="height:50px;">
                    <div class="w-50">
                        <div class="name">${data[i]['username']}</div>
                        <div class="small last-message">I am new</div>
                    </div>
                    <div class="flex-grow-1 text-right">
                        <div class="small time">14:10</div>
                    </div>
                </div>`;
            $(userItem).appendTo('#chat-list');
        }
        
    });
}


let getTime = (dateString) => {
  let date = dateString ? new Date(dateString) : new Date();
  let dualize = (x) => x < 10 ? "0" + x : x;
  return dualize(date.getHours()) + ":" + dualize(date.getMinutes());
}

function showDatesWeekDays(dateString) {
    const dt = new Date(dateString)        
    let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']; 

    let date_weekday = dt.toLocaleDateString();
    if (dt.toDateString() == new Date().toDateString()) {
        date_weekday = 'TODAY';
    } else if(dt > new Date(Date.now() - 604800000)) {
        // if date is greater than last 7 days date
        date_weekday = days[dt.getDay()].toUpperCase()
    }
    return date_weekday;
}

function drawMessage(message) {
    let msgDate = showDatesWeekDays(message.timestamp);
    let messageItem = '';
    if (lastDate != msgDate) {
        messageItem += `<div class="mx-auto my-2 bg-info text-white small py-1 px-2 rounded">
            ${msgDate}
        </div>`;
        lastDate = msgDate;
    }
    // alert(message.user === currentUser);
    // const date = new Date(message.timestamp);
    messageItem += `
    <div class="align-self-${message.user === currentUser ? "end self" : "start"} p-1 my-1 mx-3 rounded bg-white shadow-sm message-item">
        <div class="options">
            <a href="#"><i class="fas fa-angle-down text-muted px-2"></i></a>
        </div>
        <div class="d-flex flex-row">
            <div class="body m-1 mr-2">${message.body}</div>
            <div class="time ml-auto small text-right flex-shrink-0 align-self-end text-muted" style="width:75px;">
                ${getTime(message.timestamp)}
            </div>
        </div>
    </div>`;
    // alert(messageItem)
    $(messageItem).appendTo('#messages');
}

function getConversation(elem,recipient) {
    currentRecipient = recipient;
    $.getJSON(`/api/v1/message/?target=${recipient}`, function (data) {
        messageList.empty(); // .children('.message-item').remove();
        $(".overlay").addClass("d-none");
        $("#input-area").removeClass("d-none").addClass("d-flex");

        $(".chat-list-item").removeClass("active");
        $(elem).addClass("active");
        lastDate = "";
        for (let i = data['results'].length - 1; i >= 0; i--) {
            drawMessage(data['results'][i]);
        }
        messageList.animate({scrollTop: messageList.prop('scrollHeight')});
    });
}

function getMessageById(message) {
    const msg_id = JSON.parse(message).message;
    $.getJSON(`/api/v1/message/${msg_id}/`, function (data) {
        if (data.user === currentRecipient ||
            (data.recipient === currentRecipient && data.user == currentUser)) {
            drawMessage(data);
        }
        messageList.animate({scrollTop: messageList.prop('scrollHeight')});
    });
}


function sendMessage() {
    const body = chatInput.val();
    if (body.length > 0) {
        $.post('/api/v1/message/', {
            recipient: currentRecipient,
            body: body
        }).fail(function () {
            alert('Error! Check console!');
        });
        chatInput.val('');
    }
}

$(document).ready(function () {
    updateUserList();
    // let socket = new WebSocket(`ws://127.0.0.1:8000/?session_key=${sessionKey}`);
    var socket = new WebSocket('ws://' + window.location.host + `/ws?session_key=${sessionKey}`)

    chatInput.keypress(function (e) {
        if (e.keyCode == 13) sendMessage();
    });

    socket.onmessage = function (e) {
        getMessageById(e.data);
    };
});
