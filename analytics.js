var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-53537058-3']);
_gaq.push(['_trackPageview']);

function trackClick(messageID, url) {
    _gaq.push(['_trackEvent', messageID, 'click', url]);
};

function trackRecived(messageID, title) {
    _gaq.push(['_trackEvent', messageID, 'recive', title]);
}
function trackClose(messageID, title) {
    _gaq.push(['_trackEvent', messageID, 'close', title]);
}
(function () {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();