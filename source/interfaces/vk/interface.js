var Interface = require("./../interface");
var VKApi = require("./api");

module.exports = class VKInterface extends Interface {

    startup(config) {
        super.addProcessor("message", require("./processors/message"));
        super.addProcessor("subscribe", require("./processors/subscribe"));

        var vk_config = config.put("vk",
        {
            group_id: null,
            secret_key: null,
            access_token: null,
            confirmation_code: null,
            use_https: false,
            album_name: "Bot Content Album",
            modify_online_status: false
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

        console.log("VK listener starts at port " + config.port + "!");
        this.api.startListener({
            port: config.port,
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