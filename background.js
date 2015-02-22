var messsages = {};
// Returns a new notification ID used in the notification.
function getNotificationId() {
    var id = Math.floor(Math.random() * 9007199254740992) + 1;
    return id.toString();
}
function onMessageReceived(message) {
    console.log("messageReceived : ");
    console.log(message);

    message.data.NotificationOptions = JSON.parse(message.data.NotificationOptions);

    if(typeof message.data.buttons != "undefined"){
        message.data.buttons = JSON.parse(message.data.buttons);
    }

    if(typeof message.data.items != "undefined"){
        message.data.items = JSON.parse(message.data.items);
    }

    messsages[message.data.messageid] = message;

    if(message.data.buttons){
        var buttons = message.data.buttons;
        message.data.NotificationOptions.buttons = [];
        for(var i=0;i<buttons.length; i++){
            message.data.NotificationOptions.buttons.push({
                "title":buttons[i].title,
                "iconUrl":buttons[i].iconUrl
            });
        }
    }

    if(message.data.items){
        var items = message.data.items;
        message.data.NotificationOptions.items = [];
        for(var i=0;i<items.length; i++){
            message.data.NotificationOptions.items.push({
                "title":items[i].title,
                "message":items[i].message
            });
        }
    }

    chrome.notifications.create(message.data.messageid, message.data.NotificationOptions, function() {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                return;
            }
        }
    );
}
function onMessageClosed(notificationId, byUser) {
    console.log(notificationId + " is closed.");
    delete messsages[notificationId];
}

function onMessageClicked(notificationId){
    console.log(notificationId + " clicked");
    if( typeof messsages[notificationId] != "undefined"){
        var createProperties = {
            windowId:chrome.windows.WINDOW_ID_CURRENT,
            url : messsages[notificationId].data.url,
            active:true,
            selected:true
        };
        chrome.tabs.create(createProperties, function(){});
        chrome.notifications.clear(notificationId, function(wasCleared){});
    }
}
function onButtonClicked(notificationId, buttonIndex){
    console.log(notificationId + " clicked");
    if( typeof messsages[notificationId] != "undefined"){
        var message = messsages[notificationId];
        if(typeof message.data.buttons[buttonIndex]) {
            var button = message.data.buttons[buttonIndex];
            var createProperties = {
                windowId: chrome.windows.WINDOW_ID_CURRENT,
                url: button.url,
                active: true,
                selected: true
            };
            chrome.tabs.create(createProperties, function () {});
            chrome.notifications.clear(notificationId, function(wasCleared){});
        }
    }
}

function firstTimeRegistration() {
    //chrome.storage.local.remove("regId");
    chrome.storage.local.get("regId", function(result) {
        // If already registered, bail out.
        if (result["regId"]) {
            console.log("regId exist: " + result["regId"]);
            var regId =result["regId"];
            chrome.storage.local.get("idSent", function(result) {
                // If already registered, bail out.
                if (result["idSent"] == false) {
                    console.log("regId not sent : call sendRegistrationId()");
                    sendRegistrationId(regId, function(succeed) {});
                    return;
                }
                else
                {
                    console.log("regId sent");
                }

            });
            return;
        }
        console.log("firstTimeRegistration: call " + "register()");
        register();
    });
}

function register() {
    var senderId = "571157568705";
    chrome.gcm.register([senderId], registerCallback);
}

function registerCallback(regId) {
    if (chrome.runtime.lastError) {
        chrome.notifications.create(getNotificationId(), {
            title: 'Sen Việt Subcribe',
            iconUrl: 'gcm_128.png',
            type: 'basic',
            message: 'Có lỗi xảy ra khi đăng ký subscribe tại Sen VIệt, hãy đảm bảo là bạn đã đăng nhập vào chrome. Dưới đây là chi tiết lỗi : ' + chrome.runtime.lastError.message
        }, function() {});
        return;
    }
    console.log( "registerCallback : " + regId);
    chrome.storage.local.set({regId:regId });
    sendRegistrationId(regId, function(succeed) {});
}
function unregister()
{
    chrome.gcm.unregister(unregisterCallback);
}
function unregisterCallback() {
    if (chrome.runtime.lastError) {
        // When the unregistration fails, handle the error and retry
        // the unregistration later.
        return;
    }
    chrome.storage.local.remove("regId");
}
function sendRegistrationId(regId, callback) {
    var xmlhttp = new XMLHttpRequest();
    console.log("regId send status: sending");
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4)
        {
            if (xmlhttp.status==200) {
                console.log(xmlhttp.responseText);
                console.log("regId send status: sent");
                chrome.storage.local.set({idSent:true});
            }
            else
            {
                console.log("regId send status: fail");
                chrome.notifications.create(getNotificationId(), {
                    title: 'Sen Việt Subcribe',
                    iconUrl: 'gcm_128.png',
                    type: 'basic',
                    message: 'Có lỗi xảy ra khi gửi ID của bạn đến server của Sen Việt, chúng tôi sẽ thử lại khi bạn khởi động lại trình duyệt, bạn chưa cần khởi động lại ngay.'
                }, function() {});
            }
        }
    }
    xmlhttp.open("POST","http://subcribe.senviet.org/wp-admin/admin-ajax.php",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("action=device_register&regid=" + regId + "&projectid=astute-sign-655");
}

function notifyUpdateAvailable()
{
    chrome.notifications.create(getNotificationId(), {
        title: 'MTR Update',
        iconUrl: 'gcm_128.png',
        type: 'basic',
        message: 'Mùa Tóc Rối đã có bản cập nhật mới, bản mới nhất sẽ được cài đặt sau khi bạn khởi động lại trình duyệt.'
    }, function() {});
}

// Set up a listener for GCM message event.
chrome.gcm.onMessage.addListener(onMessageReceived);

chrome.notifications.onClosed.addListener(onMessageClosed);
chrome.notifications.onClicked.addListener(onMessageClicked);
chrome.notifications.onButtonClicked.addListener(onButtonClicked);
//chrome.gcm.onMessagesDeleted.addListener(messagesDeleted);
// Set up listeners to trigger the first time registration.
chrome.runtime.onInstalled.addListener(firstTimeRegistration);
chrome.runtime.onStartup.addListener(firstTimeRegistration);
chrome.runtime.onUpdateAvailable.addListener(notifyUpdateAvailable);