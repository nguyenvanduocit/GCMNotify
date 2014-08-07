// Returns a new notification ID used in the notification.
function getNotificationId() {
    var id = Math.floor(Math.random() * 9007199254740992) + 1;
    return id.toString();
}

function messageReceived(message) {
    console.log("messageReceived");
    console.log(message.data.notificationOptions);
    var notificationOptions = JSON.parse(message.data.notificationOptions);
    // Pop up a notification to show the GCM message.
    chrome.notifications.create(message.data.messageid, notificationOptions, function() {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                return;
            }
        }
    );
}
function firstTimeRegistration() {
    chrome.storage.local.remove("regId");
    chrome.storage.local.get("regId", function(result) {
        // If already registered, bail out.
        if (result["regId"]) {
            console.log("firstTimeRegistration: " + result["regId"]);
            return;
        }
        console.log("firstTimeRegistration: " + "register");
        register();
    });
}

function register() {
    var senderId = "571157568705";
    chrome.gcm.register([senderId], registerCallback);
}
function registerCallback(regId) {
    if (chrome.runtime.lastError) {
        // When the registration fails, handle the error and retry the
        return;
    }

    sendRegistrationId(regId, function(succeed) {
        // Once the registration ID is received by your server,
        // set the flag such that register will not be invoked
        // next time when the app starts up.
        if (succeed)
        {
            console.log("storeRegistrationId: " + regId);
            chrome.storage.local.set({regId:regId });
        }
    });
    // Mark that the first-time registration is done.

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
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4)
        {
            if (xmlhttp.status==200) {
                console.log("sendRegistrationId: success");
                callback(true);
            }
            else
            {
                console.log("sendRegistrationId: fail");
                callback(false);
            }
        }
    }
    xmlhttp.open("POST","http://tvschedule.senviet.org/wp-admin/admin-ajax.php",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send("action=device_register&regid=" + regId + "&appid=4");
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
chrome.gcm.onMessage.addListener(messageReceived);
// Set up listeners to trigger the first time registration.
chrome.runtime.onInstalled.addListener(firstTimeRegistration);
chrome.runtime.onStartup.addListener(firstTimeRegistration);
chrome.runtime.onUpdateAvailable.addListener(notifyUpdateAvailable);