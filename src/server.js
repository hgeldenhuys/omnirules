"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var author_1 = require("./author");
var rulesengine_1 = require("./rulesengine");
var d3cloud_1 = require("./d3cloud");
var generate_java_1 = require("./generate-java");
var express = require("express");
exports.app = express();
var port = 3000, bodyParser = require("body-parser"), swaggerUi = require("swagger-ui-express"), swaggerDocument = require("./swagger.json");
exports.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
exports.app.use(bodyParser.urlencoded());
exports.app.use(bodyParser.json());
exports.app.use("/", express.static("public"));
exports.app.post("/api/generate/table/multi-axis", function (request, response) {
    console.debug("Generating multi axis table for:\n    " + JSON.stringify(request.body));
    var multiAxisTable = new author_1.MultiAxisTable(undefined, request.body);
    response.send(multiAxisTable.getRules());
});
exports.app.post("/api/generate/table/single-axis", function (request, response) {
    console.debug("Generating single axis table for:\n    " + JSON.stringify(request.body));
    var singleAxisTable = new author_1.SingleAxisTable(undefined, request.body);
    response.send(singleAxisTable.getRules());
});
exports.app.post("/api/generate/ruleset", function (request, response) {
    var ruleSet = new author_1.RuleSet(undefined, request.body);
    response.send(ruleSet.getRules());
});
exports.app.post("/api/load/engine", function (request, response) {
    try {
        rulesengine_1.getRulesEngine(request.body.name, request.body.version, request.body.rules, request.body.SchemaVersion);
        response.json({ loaded: true });
    }
    catch (e) {
        response.json({
            error: {
                message: e.message,
                stack: e.stack
            }
        });
    }
});
exports.app.post("/api/run/engine", function (request, response) {
    try {
        var bom = request.body.bom;
        var engine = rulesengine_1.getRulesEngine(request.body.name, request.body.version, void 0, request.body.SchemaVersion);
        engine.reset(bom).run(request.body.configuration);
        response.json(bom);
    }
    catch (e) {
        response.status(500);
        response.json({
            error: {
                message: e.message,
                stack: e.stack
            }
        });
    }
});
exports.app.post("/api/run/engines", function (request, response) {
    try {
        var boms = request.body.boms;
        var engine_1 = rulesengine_1.getRulesEngine(request.body.name, request.body.version, void 0, request.body.SchemaVersion);
        boms.forEach(function (bom) {
            engine_1.reset(bom).run(request.body.configuration);
        });
        response.json(boms);
    }
    catch (e) {
        response.json({
            error: {
                message: e.message,
                stack: e.stack
            }
        });
    }
});
exports.app.get("/api/generate/java/rules-engine-runner", function (request, response) {
    var packageName = request.query.packageName;
    var javaFile = generate_java_1.generateRulesEngineRunner(packageName);
    response.setHeader("Content-disposition", "attachment; filename=RulesEngineRunner.java");
    response.setHeader("Content-type", "text/plain");
    response.send(javaFile);
});
exports.app.get("/api/generate/java/rules-engine", function (request, response) {
    var packageName = request.query.packageName;
    var javaFile = generate_java_1.generateRulesEngine(packageName);
    response.setHeader("Content-disposition", "attachment; filename=RulesEngine.java");
    response.setHeader("Content-type", "text/plain");
    response.send(javaFile);
});
exports.app.get("/api/wordmap", function (request, response) {
    var text = request.query.text, width = 250, height = 250, rotateWords = true, uniqueWordCounts = {}, wordmap = d3cloud_1.processText(text);
    function writeSvgToFile(body) {
        var svgString = body.node().innerHTML;
        response.send(svgString);
    }
    var svg = d3cloud_1.d3.select("body").html("").append("svg")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");
    d3cloud_1.drawCloud(wordmap, request.query.colourScheme ? parseInt(request.query.colourScheme) : 0, width, height, svg, rotateWords, writeSvgToFile);
});
exports.app.listen(port, function (err) {
    if (err) {
        return console.error("something bad happened", err);
    }
});
//# sourceMappingURL=server.js.map