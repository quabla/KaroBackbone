var NotificationView = Backbone.View.extend({
    tagName: "li",
    className: "notification",
    initialize: function () {
        _.bindAll(this, "render", "done");
        //this.render();
        this.listenTo(this.model, "remove", this.done);
    },
    done: function () {
        var me=this;
        this.$el.hide({
            effect: "slide",
            direction: "up",
            complete: function () {
                me.$el.remove();
            }
        });
    },
    render: function () {
        var text = this.model.get("text");
        var html = "";
        this.$el.addClass(this.model.get("level"));
        if (this.model.get("imgUrl")) {
            html += '<div style="float:left"><img style="max-width: 50px; max-height: 50px" src="' + this.model.get("imgUrl") + '"></div>';
        }
        html += '<div style="float: left">' + text + '</div>';
        html += '<div stlye="clear: both"></div>';
        this.$el.html(html);
        return this;
    }
});
