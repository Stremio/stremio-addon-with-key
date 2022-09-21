const { addonBuilder } = require("stremio-addon-sdk");

// we set some valid keys
const keys = [
    '6Jw5MyQx',
    'T2TEPAbj',
    'KG9Cx2R2',
    'n2v9ZZms',
    'jhw3wEAY'
]

const manifest = { 
    "id": "org.stremio.withkey",
    "version": "1.0.0",

    "name": "Stremio Addon with Key",
    "description": "Stremio addon example that requires a key from the user, you can test with key: 6Jw5MyQx",

    // set what type of resources we will return
    "resources": [
        "catalog",
        "stream"
    ],

    // your addon will be preferred for those content types
    "types": ["movie"],

    // set catalogs, only 1 for movies
    "catalogs": [
        {
            "type": "movie",
            "id": "withkeymovies"
        }
    ],

    // prefix of item IDs (ie: "tt0032138")
    "idPrefixes": [ "tt" ],

    // we state that this addon will not work without user configuration
    // see https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#other-metadata
    "behaviorHints": {
        "configurable": true,
        "configurationRequired": true
    },

    // we state that we only need an addon key from the user
    // see https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#user-data
    "config": [
        {
            "key": "key",
            "title": "Addon Key",
            "type": "text",
            "required": true
        }
    ]
};

// this data is protected, it will only be served to the user if the addon key is valid
const dataset = {
    "tt1254207": { name: "Big Buck Bunny", type: "movie", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
    "tt0807840": { name: "Elephants Dream", type: "movie", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
    "tt1727587": { name: "Sintel", type: "movie", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
    "tt2285752": { name: "Tears of Steel", type: "movie", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
};

const builder = new addonBuilder(manifest);

// Streams handler
builder.defineStreamHandler(function(args) {
    // ensure key exists and is valid
    if ((args.config || {}).key && keys.includes(args.config.key)) {
        // serve response
        if (dataset[args.id]) {
            return Promise.resolve({ streams: [dataset[args.id]] });
        } else {
            return Promise.resolve({ streams: [] });
        }
    } else {
        return Promise.reject(Error('Addon key missing or invalid.'))
    }
})

const METAHUB_URL = "https://images.metahub.space"

const generateMetaPreview = function(value, key) {
    // To provide basic meta for our movies for the catalog
    // we'll fetch the poster from Stremio's MetaHub
    // see https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/meta.md#meta-preview-object
    return {
        id: key,
        type: value.type,
        name: value.name,
        poster: METAHUB_URL+"/poster/medium/"+key+"/img",
    }
}

builder.defineCatalogHandler(function(args) {
    // ensure key exists and is valid
    if ((args.config || {}).key && keys.includes(args.config.key)) {
        const metas = Object.entries(dataset)
        .map(([key, value]) => generateMetaPreview(value, key))
        return Promise.resolve({ metas: metas })
    } else {
        return Promise.reject(Error('Addon key missing or invalid.'))
    }
})

module.exports = builder.getInterface()
