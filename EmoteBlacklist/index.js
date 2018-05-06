
module.exports = (Plugin, Api, Vendor, Dependencies) => {

    const { $, moment, _ } = Vendor;
    const { Events, Logger } = Api;
    const EmoteModule = Api.Emotes;

    return class extends Plugin {
        onStart() {

            if (this.startup()) {
                return true;
            } else {
                return false;
            }
        }

        onStop() {
            Events.unsubscribeAll();

            return true;
        }

        onUnload(reload) {
            Logger.log('Unloading plugin');
        }

        deleteEmotes() {
            this.settingsObject = this.settings.getSetting('default', 'emotes').items;

            console.log(this.settingsObject);

            let blacklisted = this.settingsObject.map(setting => {
                return setting.get('default', 'emote');
            });

            Logger.log(`Blacklist: ${blacklisted}`);

            blacklisted.forEach(emote => {
                EmoteModule.emotes.delete(emote);
            });
        }

        startup() {

            this.deleteEmotes = this.deleteEmotes.bind(this);

            this.deleteEmotes();

            this.on('settings-updated', this.deleteEmotes);

            
            
        }
    };
};