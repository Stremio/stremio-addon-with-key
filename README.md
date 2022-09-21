# Stremio Addon with Key

This is an example for a [Stremio](https://stremio.com/) addon that requires a key from the user.

### Usage

- install and run:
```
npm install
npm start
```
- open `http://127.0.0.1:7000/` in a browser

### Objectives

- addon that uses the addon sdk (alternatively, you can check the [RPDB Addon](https://github.com/jaruba/stremio-rpdb-addon) for an example addon using Node.js and Express)
- addon will only be installable if it has a key provided by the user
- addon serves streams (public domain streams have been added as an example) only if the key provided by the user is valid

### Use cases could be

- user authentication
- account specific requirements: rate limiting / tracking usage
- addon monetization: **only monetize content that you are legally allowed to distribute** the addon developer can use his own payment platform and distribute api keys for enabling addon use

### Understanding the code

This is a simple example of using `manifest.config` with the [addon sdk](https://github.com/Stremio/stremio-addon-sdk) which will generate a configuration page for the users. If you would like to create a custom configuration page instead, there is [more information about that here](#custom-configuration-pages).

These docs presume that you already have an understanding of [a basic addon using the addon sdk](https://github.com/Stremio/addon-helloworld).

We hardcode some valid addon keys:
```javascript
const keys = [
    '6Jw5MyQx',
    'T2TEPAbj',
    'KG9Cx2R2',
    'n2v9ZZms',
    'jhw3wEAY'
]
```

First we will add the behavior hints to the addon manifest:
```json
    "behaviorHints": {
        "configurable": true,
        "configurationRequired": true
    },
```
[link to docs](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#other-metadata)

Then we state what user data we require in the addon manifest (an "addon key" in our case):
```json
    "config": [
        {
            "key": "key",
            "title": "Addon Key",
            "type": "text",
            "required": true
        }
    ]
```
[link to docs](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#user-data)

*Note: by using the addon sdk to generate configuration pages instead of creating a custom one, you are limited to only the simplest of form validation, in the example code above the value can only be validated against being a string and being a required value*

Then we check if the user provided addon key is valid on resource request:
```javascript
builder.defineStreamHandler(function(args) {
    // ensure key exists and is valid
    if ((args.config || {}).key && keys.includes(args.config.key)) {
        // serve response
        // ...
    } else {
        return Promise.reject(Error('Addon key missing or invalid.'))
    }
})
```

You can see the [full example here](https://github.com/Stremio/stremio-addon-with-key/blob/main/addon.js).

### How Stremio handles user data

The first things that you should know of are `manifest.behaviorHints.configurable` and `manifest.behaviorHints.configurationRequired`, see the [behaviorHints docs](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#other-metadata).

An addon can state that it supports configuration with the `manifest.behaviorHints.configurable` property (this will add a configuration button next to the install button in the apps), an addon can also state that it is not installable without user data with `manifest.behaviorHints.configurationRequired` (this will remove the install button in the apps for the addon, and show only a configure button).

Pressing the "configure" button will take the user to the `/configure` URL path of your addon server, presuming that your addon manifest URL would be https://my.addon.com/manifest.json, the users will be sent to https://my.addon.com/configure, this is where a HTML configuration page should be available. In the example provided above, the HTML configuration page is generated by the addon sdk based on the `manifest.config` value.

### Custom configuration pages

The following docs are not required in order to make this example work, they explain addon user data at a deeper level for use outside of this example / the addon sdk.

On the configuration page (`/configure` URL path), you should ask users for any additional data you need, let's presume that your configuration page requires an api key and a username, let's say that a user inserts api key "ja189tg" and his username is "testuser", you will need to add these values to the addon url, so the install button in this case, after the user filled the fields, should be changed to point to `stremio://my.addon.com/ja189tg/testuser/manifest.json`. The user chosen data will always be sent through the URL for all addon requests. (the `stremio://` protocol is supported in both Desktop and Android Mobile, opening such a link will open the app with a pop-up to install the addon from that manifest URL, see [this link](https://github.com/Stremio/stremio-addon-sdk/blob/6ec2a1b7e9731688eee7329f6ee097f7bdc5d3c0/docs/deep-links.md#to-addons))

There are various addon projects that use custom configuration pages, see:
- https://github.com/jaruba/stremio-imdb-watchlist/
- https://github.com/jaruba/stremio-rpdb-addon/
