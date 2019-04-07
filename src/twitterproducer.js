"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Twitter = require("twitter");
const rulesengine_1 = require("./rulesengine");
const client = new Twitter({
    consumer_key: "57L0tQn7P8gWhmEIYLWAgnODF",
    consumer_secret: "Chs7H82z26ImHD0IfQFDZHci4M5zMeH9sU9JeHWAxKb0q0xftH",
    access_token_key: "3305111-BQbTpQre9PrOQrzhcd4KAS1HYwZVoI1LZoVtjRxBUu",
    access_token_secret: "0CgysbqO8awrliT1W5QL6WfHMbu0aYkJj0Q3bUu7aYhMD"
});
const rules = {
    rules: [
        {
            name: "Segment",
            code: "if(bom.user.followers_count>99999)result=\"Epic\";else if(bom.user.followers_count>9999)result=\"Big Kahuna\";else if(bom.user.followers_count>999)result=\"Going somewhere\";else result=\"Small Fish\";",
            behaviour: rulesengine_1.RuleBehaviour.Normal
        }
    ],
    Version: "0.4.0.draft",
    Id: "Twitter.Segmentations",
    SchemaVersion: "d38292a6fc3bec0cffa03ce0a6367de8",
    error: {},
    schemaDocumentation: {
        SchemaVersion: "d38292a6fc3bec0cffa03ce0a6367de8",
        user: {
            followers_count: {
                sampleData: 7,
                documentation: "This is a FollowersCount of type undefined with default value of undefined",
                dataType: "Integer"
            }
        },
        Segment: {
            documentation: "This is a Segment of type undefined with default value of undefined"
        }
    },
    sampleSchema: {
        SchemaVersion: "d38292a6fc3bec0cffa03ce0a6367de8",
        user: {
            followers_count: 7
        }
    }
};
const engine = new rulesengine_1.Rulesengine(rules.rules, {}, rules.Id, rules.Version);
client.stream("statuses/filter", { track: "twitter" }, (stream) => {
    stream.on("data", (tweet) => {
        console.log(JSON.stringify(engine.reset(tweet).run(), null, 2).Segment);
    });
    stream.on("error", (error) => {
        console.log(error);
    });
});
//# sourceMappingURL=twitterproducer.js.map