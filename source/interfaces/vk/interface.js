const VKApi = require("#interfaces/vk/api");
const Interface = require("#interfaces/interface");
const ValueEntry = require("#config/entries/value_entry");
const Debug = require("#debug");

module.exports = class VKInterface extends Interface {

    startup(config) {
        super.addProcessor("message", require("#interfaces/vk/processors/message"));
        super.addProcessor("subscribe", require("#interfaces/vk/processors/subscribe"));

        var vk_config = config.retrieve("vk",
            {
                group_id: new ValueEntry("number", process.env.group_id),
                secret_key: new ValueEntry("string", process.env.secret_key),
                access_token: new ValueEntry("string", process.env.access_token),
                confirmation_code: new ValueEntry("string", process.env.confirmation_code),
                use_https: new ValueEntry("boolean", false),
                album_name: new ValueEntry("string", "Bot Album"),
                modify_online_status: new ValueEntry("boolean", false),
                port: new ValueEntry("number", process.env.PORT || 8000)
            });

        this.api = new VKApi({
            group_id: vk_config.group_id,
            token: vk_config.access_token,
            apiMode: "parallel_selected",
            webhookPath: "/",
            webhookSecret: vk_config.secret_key,
            webhookConfirmation: vk_config.confirmation_code
        });

        if (vk_config.modify_online_status) {
            this.api.setOnline(true);
            this.online_changed = true;
        }

        Debug.log("vk inteface", "VK listener starts at port {0}!", vk_config.port);
        this.api.startListener({
            port: vk_config.port,
            https: vk_config.use_https
        }, async (context, next) => {
            super.handle(context.type, context);
            await next();
        });
    }

    unload(config) {
        if (this.online_changed)
            this.api.setOnline(false);
    }
};