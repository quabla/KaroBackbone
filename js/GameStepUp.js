Karopapier.User = new User({});
//make this user refer to "check" for loging in
Karopapier.User.url = function () {
    return "http://www.karopapier.de/api/user/check.json?callback=?";
};
Karopapier.User.fetch();

var game = new Game();
var mvs = new MapViewSettings();
//game.load(GameId);

var mmv = new MoveMessageView({
    el: '#moveMessages',
    collection: game.get("moveMessages")
});

var lmmv = new LastMoveMessageView({
    el: '#lastMoveMessages',
    collection: game.get("moveMessages"),
});

var giv = new GameInfoView({
    model: game,
    el: "#gameInfo"
});

var gtv = new GameTitleView({
    el: "#gameTitle",
    model: game
});

var svgView = new MapSvgView({
    el: "#mapSvgView",
    model: game.map,
    settings: mvs
});
game.on("change:completed", function() {
    if (!game.get("completed")) return false;
    console.log("Adjust cp settings to", game.get("withCheckpoints"), " and BTW, gamge completed is ",game.get("completed"));
    svgView.settings.set("cpsActive", game.get("withCheckpoints"));
    var cpsVisited = game.get("players").get(game.get("dranId")).get("checkedCps");
    console.info("VISITED: ",cpsVisited);
    svgView.settings.set("cpsVisited", cpsVisited);
});


var statusView = new StatusView({
    model: game,
    el: "#statusinfo"
})

var GameRouter = Backbone.Router.extend({
    routes: {
        "game.html?GID=:gameId": "showGame",
        "newshowmap.php?GID=:gameId": "showGame",
        "game.html": "defaultRoute"
    },
    showGame: function (gameId) {
        if (gameId) {
            game.load(gameId);
        }
    },
    defaultRoute: function () {
        this.navigate("game.html", {trigger: true});
        //this.navigate("game.html?GID=81161", {trigger: true});
        //this.navigate("game.html?GID=57655", {trigger: true});
    }
});

var pt = new PlayerTable({
    collection: game.get("players"),
    el: "#playerTable"
});

var mpm = new MapPlayerMoves({
    model: game,
    collection: game.get("players"),
    settings: mvs,
    el: '#mapPlayerMoves'
});

/*
 var mpl = new MapPlayerLayer({
 el: '#fgImg',
 model: game
 });
 mpl.render();
 */

var possView = new PossiblesView({
    el: "#mapImage",
    game: game,
    mapView: svgView
});

Karopapier.listenTo(possView, "game:player:move", function (playerId, mo) {
    var testmode = $('#testmode').is(":checked");
    if (testmode) {
        var player = game.get("players").get(playerId);
        var move = new Move(mo.toMove());
        move.set("t", new Date());
        move.set("test", true);
        player.moves.add(move);
        game.updatePossibles();
        mpm.render();
    } else {
        //build move url
        var moveUrl = "http://www.karopapier.de/move.php?GID=" + game.get("id");
        var m = mo.toMove();
        if (mo.get("vector").getLength() === 0) {
            //http://www.karopapier.de/move.php?GID=84078&startx=8&starty=29
            moveUrl += "&startx=" + m.x + "&starty=" + m.y;
        } else {
            //http://www.karopapier.de/move.php?GID=83790&xpos=76&ypos=28&xvec=-2&yvec=2
            moveUrl += "&xpos=" + m.x + "&ypos=" + m.y + "&xvec=" + m.xv + "&yvec=" + m.yv;
        }

        var moveMsg = $('#movemessage').val();
        if (moveMsg!=="") {
            moveUrl += "&movemessage="+moveMsg;
            $('#movemessageDisplay').hide();
            $('#movemessage').show().val("");
        }


        console.log("Send move");
        var movedGID=game.get("id");
        console.warn("I just moved",movedGID);
        myTextGet(moveUrl, function (text) {
            console.log("Parse move response");
            parseMoveResponse(text, movedGID);
        });
        dranQueue.remove(game.get("id"));
        console.log("Now HIDING");
        $('#mapImage').hide();
        game.set({"completed": false, "moved": true});
        console.log("Done with this game");
    }
});

function parseMoveResponse(text, movedGID) {
    //indexOf Danke ==ok
    if ((text.indexOf("Danke.") >= 0) || (text.indexOf("Spiel beendet") >=0)) {
        //<B>Didi</B> kommt als n&auml;chstes dran
        var hits = text.match(/<B>(.*?)<\/B> kommt als n/);
        var nextPlayer = "Unknown";
        if (hits) {
            if (hits.length > 1) {
                nextPlayer = hits[1];
            }
        }
        if (nextPlayer == Karopapier.User.get("login")) {
            //console.info("NOMMAL DRAN");
            dranQueue.addId(game.get("id"));
        }

        //check listed next games and add them to queue as well, excluding moved one
        var gids = text.match(/GID=(\d*)/g);
        var currentGID = game.get("id");
        if (gids.length > 0) {
            for (var i=0;i<gids.length;i++) {
                var s = gids[i].split("=");
                if (s) {
                    var gid = s[1];
                    console.log("Compare found",gid,"with",movedGID);
                    if (gid!=movedGID) {
                        console.log(gid,"!=",movedGID,", so add it to queue");
                        dranQueue.addId(gid);
                    }
                }
            }
        }
    } else {
        alert("KEIN DANKE!!! Da hat wohl was nicht gepasst");
        console.log(text);
    }
}

function myTextGet(url, cb, errcb) {
    var request = new XMLHttpRequest();
    request.withCredentials = true;
    request.open('GET', url, true);
    request.onload = function () {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            //console.log(request.responseText);
            cb(request.responseText);
            //console.log("Success: ",request.responseText.indexOf("Danke.") >=0);
        } else {
            // We reached our target server, but it returned an error
            cb(request.responseText);
            //console.log("doof",request);
        }
    };

    request.onerror = function () {
        // There was a connection error of some sort
    };

    request.send();
}

var checkTestmode = function () {
    if ($('#testmode').is(":checked")) {
        $('#mapImage').addClass("testmode");
    } else {
        $('#mapImage').removeClass("testmode");
        var dranId = game.get("dranId");
        var dranPlayer = game.get("players").get(dranId);
        //var dranMoves = myPlayer.get("moves"); #FIXME
        var dranMoves = dranPlayer.moves;

        var noTestMoves = dranMoves.where({"test": undefined});
        dranPlayer.moves.set(noTestMoves);
        mpm.render();
        game.updatePossibles();
    }
};

$('#testmode').click(checkTestmode);
checkTestmode();



var dranQueue = new GameCollection();
dranQueue.url = function () {
    return "http://www.karopapier.de/api/user/" + Karopapier.User.get("id") + "/dran.json?callback=?";
};
dranQueue.parse = function (data) {
    return data.games;
};

//inital load via reset
dranQueue.listenTo(Karopapier.User,"change:id", dranQueue.fetch.bind(dranQueue, {reset: true}));
//dranQueue.fetch({reset: true});

var nextGame = new Game();

/////////////////////////////////////////////////////////////////////////////
// EVENTS
/////////////////////////////////////////////////////////////////////////////

game.on("change:completed", function() {
    console.log("Completed",game.get("completed"));
    if (!(game.get("completed"))) return false;

    $('#mapImage').show();

    //set limit for "LastMoveMessages"
    var userId = Karopapier.User.get("id");
    var dranId = game.get("dranId");
    var ts = false;
    if (dranId) {
        var p = game.get("players").get(dranId);
        if (p) {
            var lastmove = p.moves.last();
            if (lastmove) {
                ts = new Date(lastmove.get("t"));
            }
        }
    }

    //console.log("Setting lastmove message filter to ", ts);
    lmmv.settings.set("timestamp",ts);
});

game.on("change:moved", function() {
    console.log("Game changed moved to ", game.get("moved"));
    if (game.get("moved")) {
        checkNextGame();
    }
});

nextGame.on("change:completed", function() {
    if (nextGame.get("completed")) {
        console.log("Next game is completed. Wanna have it?");
        checkNextGame();
    }
});

dranQueue.on("reset", function(q, e) {
    console.info("DranQueue INITIAL reset");
    //make sure to remove currently showing game from queue
    checkPreload();
});

dranQueue.on("add", function(g, q, e) {
    console.info("DranQueue add",g.get("id"));
    checkNextGame();
    checkPreload();
});

dranQueue.on("remove", function(g, q, e) {
    console.info("DranQueue remove",g.get("id"));
    checkPreload();
});

/////////////////////////////////////////////////////////////////////////////
var checkPreload = function() {
    console.log("Preparing buffer");
    if (dranQueue.length>0) {
        console.log("DQ len",dranQueue.length);
        var nextId = dranQueue.at(0).get("id");
        console.log("Next ID", nextId);

        if ((nextId == game.get("id")) && (!game.get("moved"))) {
            console.log("next == current, kicking from queue");
            dranQueue.shift();
            return false;
            //checkPreload(); //will be triggered by "remove"
        }

        if (nextGame.get("id")===0) {
            console.log("Trigger preload of",nextId);
            nextGame.set("id",nextId);
            setTimeout(function() {nextGame.load(nextId);},50);
        } else {
            console.log("Preload already in progress");
        }
    } else {
        console.log("DQ empty");
    }
};

var checkNextGame = function() {
    console.log("checking next game:");
    console.log("Game moved:", game.get("moved"));
    console.log("NextGame completed:", nextGame.get("completed"));

    if (((game.get("id")==0) || (game.get("moved"))) && nextGame.get("completed")) {
        console.log("Setting game from next");
        nextGame.set("moved",false);
        game.setFrom(nextGame);
        gr.navigate(window.location.pathname.substr(1) + "?GID=" + nextGame.get("id"));
        console.log("Now showing");
        $('#mapImage').show();
        nextGame.set({id: 0, completed: false}, {silent: true});
        checkPreload();
    } else {
        console.log("not completed yet or not moved yet");
    }
};

gr = new GameRouter();

Backbone.history.start({
    pushState: true
});


console.info("Stepup done");
