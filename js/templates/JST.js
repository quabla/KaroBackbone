this["JST"] = this["JST"] || {};

this["JST"]["chat/chatControl"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<div id="chatEnter">\r\n    <form id="chatEnterForm">\r\n        <span id="chatUserName">' +((__t = ( login )) == null ? '' : __t) +': </span>\r\n        <input type="text" name="newchatmessage" id="newchatmessage"/>\r\n        <input type="submit" value="Sag es" id="newchatmessagesubmit"/>\r\n    </form>\r\n</div>\r\n';}return __p};

this["JST"]["chat/chatInfo"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<small>Wer in den letzten 60 Sekunden da war, sortiert nach Althasigkeit</small>\r\n<ul id="chatUsers" class="chatUsersView"></ul>\r\n<span title="Hastig akkumulierte Blockersumme derer im Chat" alt="Hastig akkumulierte Blockersumme derer im Chat">HABDICH: <span id="chatHabdich"></span></span>\r\n<br />\r\n<div id="chatInfoGames">\r\n    <div id="chatInfoDran"><a target="ibndran" href="/dran">-</a></div>\r\n    <span id="chatInfoBlockerRank">-</span><br>\r\n    <span id="chatInfoTopBlocker">-</span><br>\r\n</div>\r\n<div id="chatBlockerInfo">\r\n    <!-- <div class="clearer"></div> -->\r\n';}return __p};

this["JST"]["chat/chatLayout"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<div id="chatWrapper">\r\n    <div id="chatMessages"></div>\r\n    <div id="chatInfo"></div>\r\n</div>\r\n<div class="clearer"></div>\r\n<div id="chatControl">Say: <input></div>\r\n';}return __p};

this["JST"]["dumbview"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += 'Hello, I am a <strong>' +((__t = ( adjective )) == null ? '' : __t) +'</strong> view template. Please JST me via grunt an watch my changes, so I can regrunt!\r\n';}return __p};