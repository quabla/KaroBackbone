var YOUTUBE_CACHE = {};
var KaroUtil = {};
(function (karoUtil) {
        karoUtil = karoUtil || {};
        karoUtil.funny = true;
        karoUtil.init = function () {
            console.log("Do da util init");
            karoUtil.replacements = [];
            karoUtil.replacements.push({
                r: "<a (.*?)</a>",
                f: function (a) {
                    //real-link protector
                    return a;
                },
                sw: "i"
            });

            //Formatting
            karoUtil.replacements.push({
                r: "-:K",
                f: "<i>"
            });
            karoUtil.replacements.push({
                r: "K:-",
                f: "</i>"
            });
            karoUtil.replacements.push({
                r: "-:F",
                f: "<b>"
            });
            karoUtil.replacements.push({
                r: "F:-",
                f: "</b>"
            });

            if (karoUtil.funny) {
                //nen
                karoUtil.replacements.push({
                    r: "(^|\\s)nen(^|\\s|$)",
                    f: function (text) {
                        return RegExp.$1 + "einen" + RegExp.$2;
                    },
                });

                //Nen
                karoUtil.replacements.push({
                    r: "(^|\\s)Nen(^|\\s|$)",
                    f: function () {
                        return RegExp.$1 + "Einen" + RegExp.$2;
                    }
                });

                //Thomas Anders
                karoUtil.replacements.push({
                    r: "\\banders\\b",
                    f: function () {
                        return ' <img style="opacity: .3" src="http://www.karopapier.de/images/anders.jpg" alt="anders" title="anders" />';
                    },
                    sw: "i"
                });

                //The HOFF
                karoUtil.replacements.push({
                    r: "\\bhoff\\b",
                    f: function () {
                        return ' <img style="opacity: .3" src="http://www.karopapier.de/images/hoff.jpg"     alt="hoff" title="hoff" />';
                    },
                    sw: "i"
                });
            }

            //GID
            karoUtil.replacements.push({
                r: "(?:http\\:\\/\\/www.karopapier.de\\/showmap.php\\?|http:\\/\\/2.karopapier.de\\/game.html\\?|\\b)GID[ =]([0-9]{3,6})\\b",
                f: function (all, gid) {
                    //console.log("All", all);
                    //console.log("GID", gid);
                    $.getJSON('http://www.karopapier.de/api/game/' + gid + '/info.json?callback=?', function (gameInfo) {
                        $('a.GidLink' + gid).text(gid + ' - ' + gameInfo.game.name);
                    });
                    return '<a class="GidLink' + gid + '" href="http://2.karopapier.de/game.html?GID=' + gid + '" target="_blank">' + gid + '</a>';
                },
                sw: "i"
            });

            //Links
            karoUtil.replacements.push({
                r: "(?![^<]+>)((https?\\:\\/\\/|ftp\:\\/\\/)|(www\\.))(\\S+)(\\w{2,4})(:[0-9]+)?(\\/|\\/([\\w#!:.?+=&%@!\\-\\/]))?",
                f: function (url) {
                    //console.log("URL MATCH", url);
                    var className = "";
                    var linktext = url;
                    var linktitle = url;
                    if (url.match('^https?:\/\/')) {
                        //linktext = linktext.replace(/^https?:\/\//i,'')
                        //linktext = linktext.replace(/^www./i,'')
                    } else {
                        url = 'http://' + url;
                    }

                    //special handdling: youtube
                    if (url.match('youtube.com/.*v=.*') || url.match('youtu.be/.*')) {
                        //console.log("Its a yt url", url);
                        try {
                            var videoid = url.split("?").filter(function (part) {
                                return part.substr(0, 2) == "v=";
                            })[0].split("=")[1];
                        } catch (err) {
                            //console.log("Try yt");
                            var videoid = url.split("tu\.be/")[1];
                        }
                        //console.log("Its a yt url", url, videoid);
                        className += " yt_" + videoid;
                        var yt_url = 'https://www.googleapis.com/youtube/v3/videos?id=' + videoid + '&key=AIzaSyBuMu8QDh49VqGJo4cSS4_9pTC9cqZwy98&part=snippet';
                        if (videoid in YOUTUBE_CACHE) {
                            var snippet = YOUTUBE_CACHE[videoid];
                            linktext = '<img height="20" src="' + snippet.thumbnails.default.url + '" />' + snippet.title;
                            linktitle = snippet.description;
                        } else {
                            //console.log(yt_url);
                            $.getJSON(yt_url, function (data) {
                                var snippet = data.items[0].snippet;
                                YOUTUBE_CACHE[videoid] = snippet;
                                linktext = '<img height="20" src="' + snippet.thumbnails.default.url + '" />' + snippet.title;
                                $('a.yt_' + videoid).attr("title", snippet.description).html(linktext);
                            });
                        }
                    } else if (url.match('.*\.(jpg|gif|png)')) {
                        //console.log("Handling jpg url", url);
                        linktext = '<img src="' + url + '" height="20" />';
                    } else {
                        //console.log("Handling default url", url, text);
                        if (url.match('^https?:\/\/')) {
                            linktext = linktext.replace(/^https?:\/\//i, '');
                            linktext = linktext.replace(/^www./i, '');
                        }
                    }

                    return '<a class="' + className + '" title="' + linktitle + '" target="_blank" rel="nofollow" href="' + url + '">' + linktext + '</a>';
                },
                sw: "i"
            });

            //Smilies
            karoUtil.replacements.push({
                r: ":([a-z]*?):",
                f: function (all, smil) {
                    //console.log(smil);
                    var img = document.createElement("img");
                    img.src = "http://www.karopapier.de/bilder/smilies/" + smil + ".gif";
                    img.onload = function () {
                        //console.log("Ich lud");
                        $('.smiley.' + smil).replaceWith(img);
                    }
                    return '<span class="smiley ' + smil + '">' + all + '</span>';
                },
                sw: "i"
            });

            karoUtil.replacements.push({
                r: 'img src="\\/images\\/smilies\\/(.*?).gif" alt=',
                f: function (all, smil) {
                    //console.log(all, smil);
                    return 'img src="http://www.karopapier.de/bilder/smilies/' + RegExp.$1 + '.gif" alt=';
                },
                sw: "i"
            });
        };


        karoUtil.createSvg = function (tag, attrs) {
            var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
            for (var k in attrs)
                el.setAttribute(k, attrs[k]);
            return el;
        };

        karoUtil.linkify = function (text) {
            if (!text) return text;

            //console.log("Look at", text);
            for (var i = 0, l = this.replacements.length; i < l; i++) {
                var rpl = this.replacements[i];
                var r = rpl.r;
                var f = rpl.f;
                var sw = rpl.sw || "";
                //console.log(r, sw);

                var rx = new RegExp("^(.*?)(" + r + ")(.*?)$", sw);
                //console.log(rx);
                var parts = rx.exec(text);
                if (parts) {
                    //console.log("Match for", rx, parts);
                    var dump = parts.shift(); //whole string
                    var before = parts.shift();
                    var matchingText = parts.shift();
                    var after = parts.pop(); //there can be internal submatches
                    var textToReturn = karoUtil.linkify(before) + matchingText.replace(new RegExp(r, sw), f) + karoUtil.linkify(after);
                    //console.info(textToReturn);
                    return textToReturn;
                }
            }
            //console.log("No match, return text", text);
            //nothing matches?
            return text;
        };

        karoUtil.oldlinkify = function (text) {
            //smilies
            console.warn("DEPRECATED");
            return text;
        };

        karoUtil.lazyCss = function (url) {
            var head = document.getElementsByTagName('head')[0];
            var link = document.createElement('link');
            link.type = "text/css";
            link.rel = "stylesheet"
            link.href = url;
            head.appendChild(link);
        };

        karoUtil.setFunny = function (tf) {
            karoUtil.funny = tf;
            karoUtil.init();
        };

        karoUtil.init();
    }
    (KaroUtil)
);

//Polyfills
if (!String.prototype.trim) {
    (function () {
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function () {
            return this.replace(rtrim, '');
        };
    })();
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}

if (typeof String.prototype.truncate != 'function') {
    String.prototype.truncate = function (str, c) {
        return str.substring(0, c) + "...";
    };
}
