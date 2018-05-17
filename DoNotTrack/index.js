
module.exports = (Plugin, Api, Vendor, Dependencies) => {

    const { $, moment, _ } = Vendor;
    const { Events, Logger } = Api;
    const MonkeyPatch = Api.monkeyPatch;
    const getModuleByProps = Api.WebpackModules.getModuleByProperties;


    return class extends Plugin {
        onStart() {

            if (this.startup()) {
                return true;
            } else {
                return false;
            }
        }

        stopTracking() {
            Logger.log("Applying patch");
            MonkeyPatch(
                getModuleByProps('track')
            ).instead(
                'track',
                _ => {}
            );
        }

        onStop() {
            Logger.log("Removing patch");
            Api.unpatchAll();
            return true;
        }

        onUnload(reload) {
            Logger.log('Unloading plugin');
        }

        startup() {

            this.stopTracking();
            
        }
    };
};