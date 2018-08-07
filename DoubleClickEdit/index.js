module.exports = (Plugin, Api, Vendor, Dependencies) => {

    const { $ } = Vendor;
    const { Events, Logger} = Api;
    const DiscordApi = Api.Discord;
    const Reflection = Api.Reflection;

    return class extends Plugin {
        onStart() {
            if(this.setup()) {
                Logger.log('Started successfully.');
                return true;
            } else {
                Logger.log('Failed to start.');
                return false;
            }
        }

        onStop() {
            Events.unsubscribeAll();
            if (this.observer) this.observer.disconnect();
            $('.message-1PNnaP.bd-isCurrentUser').off('dblclick.dblclickedit');

            return true;
        }

        onUnload(reload) {
            Logger.log('Unloading plugin');
        }

        handleMutation(mutationsList, dblClickFunction) {
            setTimeout(_ => { //jshint ignore: line
                $('.message-1PNnaP.bd-isCurrentUser').off('dblclick.dblclickedit').on('dblclick.dblclickedit', dblClickFunction);
            }, 100);
        }

        messageDblClicked(e) {
            
            const messageId = Reflection(e.currentTarget).prop('message.id');
            const message = DiscordApi.currentChannel.messages.filter(m => m.id == messageId)[0];

            Logger.log('Starting edit:', messageId, message);

            message.startEdit();

            e.preventDefault();
            e.stopPropagation();
        }

        setup() {

            let chatPaneCheck = setInterval(_ => {
                if (document.querySelector('.da-chat')) {
                    clearInterval(chatPaneCheck);
                    this.observer = new MutationObserver(m => {this.handleMutation(m, this.messageDblClicked);});
                    this.observer.observe(document.querySelector('.da-chat'), {childList: true, subtree: true});
                    setTimeout(_ => { //jshint ignore: line
                        $('.message-1PNnaP.bd-isCurrentUser').off('dblclick.dblclickedit').on('dblclick.dblclickedit', this.messageDblClicked);
                    }, 100);
                }
            }, 100);

            return true;
        }        
    };

};
