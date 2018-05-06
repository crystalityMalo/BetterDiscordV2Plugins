module.exports = (Plugin, Api, Vendor, Dependencies) => {

    const { $, moment, _ } = Vendor;
    const { Events, Logger, CssUtils } = Api;
    const DiscordApi = Api.Discord;
    const Reflection = Api.Reflection;

    return class extends Plugin {
        onStart() {

            if(this.setup()) {
                return true;
            } else {
                return false;
            }
        }

        onStop() {
            Events.unsubscribeAll();
            this.observer.disconnect();
            $('.message').off('dblclick.dblclickedit');

            return true;
        }

        onUnload(reload) {
            Logger.log('Unloading plugin');
        }

        settingChanged(category, setting_id, value) {
            if (!this.enabled) return;
            Logger.log(`${category}/${setting_id} changed to ${value}`);
        }

        settingsChanged(settings) {
            if (!this.enabled) return;
            Logger.log([ 'Settings updated', settings ]);
        }

        handleMutation(mutationsList, dblClickFunction) {
            for(var mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    for (var node of mutation.addedNodes) {
                        if ($(node).is('.message') || $(node).is('.message-group')) {
                            $('.message').off('dblclick.dblclickedit').on('dblclick.dblclickedit', dblClickFunction);
                        } else if($(node).is('.messages-wrapper')) {
                            setTimeout(_ => { //jshint ignore: line
                                $('.message').off('dblclick.dblclickedit').on('dblclick.dblclickedit', dblClickFunction);
                            }, 500);
                        }
                    }
                }
            }
        }

        messageDblClicked(e) {

            const messageId = Reflection(e.currentTarget).prop('message.id');
            const message = DiscordApi.currentChannel.messages.filter(m => m.id == messageId)[0];

            console.log(messageId, message);

            if (DiscordApi.currentUser.id === message.author.id) {
                message.startEdit();
            } else {
                e.currentTarget.classList.add('dblclickedit-error');
                let errorNode = e.currentTarget;
                setTimeout(() => { errorNode.classList.remove('dblclickedit-error'); }, 600);
            }

            e.preventDefault();
            e.stopPropagation();
        }

        async injectStyles() { //jshint ignore: line
            const scss = await CssUtils.getConfigAsSCSS() + this.styleSheet; //jshint ignore: line
            await CssUtils.injectSass(scss); //jshint ignore: line
        }

        setup() {

            let chatPaneCheck = setInterval(_ => {
                if (document.querySelector('.chat')) {
                    clearInterval(chatPaneCheck);
                    this.observer = new MutationObserver(m => {this.handleMutation(m, this.messageDblClicked);});
                    this.observer.observe(document.querySelector('.chat'), {childList: true, subtree: true});
                    $('.message').off('dblclick.dblclickedit').on('dblclick.dblclickedit', this.messageDblClicked);
                }
            }, 100);

            this.styleSheet = 
`
.dblclickedit-error {
    animation: error 0.6s linear
}

@keyframes error {
    0% {
        opacity: 1;
    }
    25% {
        opacity: 0.25;
    }
    100% {
        opacity: 1;
    }
}
`;
            this.injectStyles();

            return true;
        }        
    };

};
