let rulesengine = require("./rulesengine"),
    BOM = {
        BrandIndex: 23
    },
    rules = [
        {
            "behaviour": "Normal",
            "code": "result=bom.BrandIndex+1;",
            "name": "BrandPriority",
        },
    ];

var engine = new rulesengine.Rulesengine(rules, BOM, "Test", "1.0", "a00ece1df2b032c33d0fb6e8b60d10d1");
console.log(JSON.stringify(engine.run(BOM)));
