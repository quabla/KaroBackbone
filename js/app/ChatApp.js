var ChatApp = Backbone.Marionette.Layout.extend({
    className: "chatApp",
    initialize: function () {
        this.layout = new ChatLayout({
            el: this.el
        });
        this.layout.render();

        this.configuration = new Backbone.Model();
        this.configuration.set("limit", 20);

        this.chatMessageCollection = new ChatMessageCollection();
        this.chatMessagesView = new ChatMessagesView({
            model: this.configuration,
            collection: this.chatMessageCollection
        });

        this.chatInfoView = new ChatInfoView({
            model: Karopapier.User
        });

        this.chatControlView = new ChatControlView({
            model: this.configuration
        });

        //dirty first poor man's refresh
        this.refreshMessages = setInterval(function () {
            this.chatMessageCollection.fetch()
            this.chatInfoView.updateTopBlocker();
        }.bind(this), 60000);
    },
    render: function () {
        this.layout.chatMessages.show(this.chatMessagesView);
        this.layout.chatInfo.show(this.chatInfoView);
        this.layout.chatControl.show(this.chatControlView);
    }
});

