const COMMANDS = require("./commands.json");
const request = require("../../helper/request.js");

const { URL } = require("url");

const PASSWORD = "Pa$$w0rd";

module.exports = (info, logger, init) => {
    return init([
        "devices",
        "endpoints",
        "vault"
    ], (scope, [
        C_DEVICES,
        C_ENDPOINTS,
        C_VAULT
    ]) => {


        C_DEVICES.found({
            labels: [
                "app=fully",
                "type=kiosk"
            ]
        }, (device) => {

            C_ENDPOINTS.found({
                device: device._id,
                //labels: device.labels
            }, (endpoint) => {


                C_VAULT.found({
                    identifier: endpoint._id
                }, (vault) => {

                    let iface = device.interfaces[0];
                    let { host, port } = iface.settings;
                    let agent = iface.httpAgent();
                    let secret = vault.secrets[0];

                    endpoint.commands.forEach((command) => {
                        command.setHandler((cmd, iface, params, done) => {

                            let url = new URL(`http://${host}:${port}?cmd=${cmd.alias}&type=json&password=${secret.decrypt()}`);

                            if (cmd.alias === "textToSpeech") {

                                let today = new Date();
                                let day = today.toLocaleDateString('de-DE', { weekday: 'long' });
                                let month = today.toLocaleDateString('de-DE', { month: 'long' });

                                let text = "Guten Morgen Marc, ";
                                text += `Es ist ${day} der ${today.getDate()} ${month}. `;
                                text += "Zeit zum aufstehen.";

                                url.searchParams.set("text", text);

                            }

                            // handle settings key/value
                            if (["screenBrightness", "keepScreenOn"].includes(cmd.alias)) {

                                // param type = cmd value
                                // boolean = setBooleanSetting
                                // number = setStringSetting
                                // string = setStringSetting

                                let { type, value } = params[0];

                                switch (type) {
                                    case "string": url.searchParams.set("cmd", "setStringSetting"); break;
                                    case "number": url.searchParams.set("cmd", "setStringSetting"); break;
                                    case "boolean": url.searchParams.set("cmd", "setBooleanSetting"); break;
                                }

                                url.searchParams.set("key", cmd.alias);
                                url.searchParams.set("value", value);

                            }

                            console.log("UZRL", url.toString())

                            request(url.toString(), {
                                agent
                            }, (err, result) => {
                                if (err) {

                                    done(err);

                                } else {

                                    done(null, result.body?.status === "OK");

                                }
                            });

                        });
                    });

                }, async (filter) => {

                    let vault = await C_VAULT.add({
                        ...filter,
                        name: `Fully Kiosk Password (${device._id})`,
                        secrets: [{
                            name: "Password",
                            key: "password"
                        }]
                    });

                    logger.info(`Vault created for device ${device._id}`);

                });

            }, async (filter) => {

                let endpoint = await C_ENDPOINTS.add({
                    name: device.name,
                    icon: "fa-solid fa-tablet-screen-button",
                    ...filter,
                    commands: COMMANDS.map((cmd) => {

                        cmd.interface = device.interfaces[0]._id;

                        return cmd;

                    })
                });

                logger.info(`Endpoint "${endpoint.name}" added`);

            });

        }, async (filter) => {

            let device = await C_DEVICES.add({
                name: "Fully Kiosk App",
                icon: "fa-solid fa-tablet-screen-button",
                ...filter,
                interfaces: [{
                    settings: {
                        host: "127.5.5.1",
                        port: 2323
                    }
                }]
            });

            logger.info(`Device "${device.name}" added`);

        });


    });
};