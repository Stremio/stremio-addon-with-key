# Stremio Addon with Key

This is an example for a [Stremio](https://stremio.com/) addon that requires a key from the user.

### Usage

- install and run:
```
npm install
npm start
```
- open `http://127.0.0.1:7700/` in a browser

### Objectives

- addon that uses the [addon sdk](https://github.com/Stremio/stremio-addon-sdk) (alternatively, there are also examples using [Node.js and Express](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#using-user-data-in-addons))
- addon will only be installable if it has a key provided by the user
- addon serves streams (public domain streams have been added as an example) only if the key provided by the user is valid

### Use cases

- user authentication
- account specific requirements: rate limiting / tracking usage
- addon monetization: **only monetize content that you are legally allowed to distribute** the addon developer can use his own payment platform and distribute API keys for enabling addon use

### Understanding the code

This is a simple example of using `manifest.config` with the [addon sdk](https://github.com/Stremio/stremio-addon-sdk) which will generate a configuration page for the users. If you would like to create a custom configuration page instead, there is [more information about that here](https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/advanced.md#using-user-data-in-addons).

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

We add the behavior hints to the addon manifest:
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

Pressing the "configure" button will take the user to the `/configure` URL path of your addon server, presuming that your addon manifest URL would be `https://my.addon.com/manifest.json`, the users will be sent to `https://my.addon.com/configure`, this is where a HTML configuration page should be available. In the example provided above, the HTML configuration page is generated by the addon sdk based on the `manifest.config` value.

---

_built with love and serious coding skills by the Stremio Team_

<img src="https://blog.stremio.com/wp-content/uploads/2023/08/stremio-code-footer.jpg" width="300" />
