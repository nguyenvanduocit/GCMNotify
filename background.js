// Returns a new notification ID used in the notification.
function getNotificationId() {
    var id = Math.floor(Math.random() * 9007199254740992) + 1;
    return id.toString();
}

function messageReceived(message) {
    console.log("messageReceived");
    console.log(message);
    var notificationOptions = JSON.parse(message.data.NotificationOptions);
    // Pop up a notification to show the GCM message.
    chrome.notifications.create(message.data.messageid, notificationOptions, function() {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
                return;
            }
        }
    );
}
function messagesDeleted() {

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
                if (result["idSent"] == false || true) {
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
chrome.gcm.onMessage.addListener(messageReceived);
chrome.gcm.onMessagesDeleted.addListener(messagesDeleted);
// Set up listeners to trigger the first time registration.
chrome.runtime.onInstalled.addListener(firstTimeRegistration);
chrome.runtime.onStartup.addListener(firstTimeRegistration);
chrome.runtime.onUpdateAvailable.addListener(notifyUpdateAvailable);