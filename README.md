# Introduction
Integrates remote controlling of devices via API.<br />
https://www.fully-kiosk.com/en/#rest

> [!IMPORTANT]  
> This plugin uses [Fully Kiosk](https://github.com/3cky/mbusd) Plus features.<br />

> [!NOTE]
> Change the IP Adress from `127.5.5.1` to your devices real IP
> Set the API password secret in vaults


# Installation
1) Create a new plugin over the OpenHaus backend HTTP API
2) Mount the plugin source code folder into the backend
3) run `npm install`

# Development
Add plugin item via HTTP API:<br />
[PUT] `http://{{HOST}}:{{PORT}}/api/plugins/`
```json
{
   "name":"Fully Kiosk Integration",
   "version": "1.0.0",
   "intents":[
      "devices",
      "endpoints"
   ],
   "uuid": "e973c5e3-9188-4381-8c04-59aa9c7e2f48"
}
```

Mount the source code into the backend plugins folder
```sh
sudo mount --bind ~/projects/OpenHaus/plugins/oh-plg-fully-kiosk/ ~/projects/OpenHaus/backend/plugins/e973c5e3-9188-4381-8c04-59aa9c7e2f48/
```