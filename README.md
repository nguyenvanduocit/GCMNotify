GCMNotify
=========

Google cloud message client implement on chrome extension

Server side
-----

https://github.com/nguyenvanduocit/wp-gcm

Modify
-----

Edit this lines

<code>xmlhttp.open("POST","http://tvschedule.senviet.org/wp-admin/admin-ajax.php",true);
xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
xmlhttp.send("action=device_register&regid=" + regId + "&appid=4");</code>
