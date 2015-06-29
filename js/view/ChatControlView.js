var ChatControlView = Backbone.View.extend({
    tagName: "div",
    template: window["JST"]["chat/chatControl"],
    initialize: function () {
        _.bindAll(this, "render");
        this.listenTo(Karopapier.User, "change:id", this.render);
        this.listenTo(this.model, "change:limit", this.render);
        this.listenTo(this.model, "change:lastLineId", this.render);
        return this;
    },
    events: {
        "click .messageLimit": "setLimit",
        "change #startPicker": "syncStart",
        "input #startPicker": "syncStart",
        "click #startLineUpdate": "setStart"
    },
    setStart: function(e) {
        var start = this.$el.find("#startPicker").val();
        this.model.set("start", start);
    },
    syncStart: function(e) {
        //console.log(e);
        var v = e.currentTarget.value;
        $('#startLine').val(v);
    },
    setLimit: function (e) {
        var limit = parseInt($(e.currentTarget).text());
        this.model.set("limit", limit);
    },
    render: function () {
        if (Karopapier.User.get("id") != 0) {
            this.$el.html(this.template({user: Karopapier.User.toJSON(), settings: this.model.toJSON()}));
        } else {
            this.$el.html("Nicht angemeldet");
        }
        return this;
    }
})
