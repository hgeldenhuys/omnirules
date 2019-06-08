import { MultiAxisTable, RuleSet, SingleAxisTable } from "./author";
import { getEngine, jlog } from "./rulesengine";
import { processText, drawCloud, d3 } from "./d3cloud";
import { generateRulesEngine, generateRulesEngineRunner } from "./generate-java";

const express = require("express");
export const app = express();
const port = 3000,
    bodyParser = require("body-parser"),
    swaggerUi = require("swagger-ui-express"),
    swaggerDocument = require("./swagger.json");

/*
* Setup Swagger API Docs
* */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/*
* Setup JSON and Static Webpages
* */
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use("/", express.static("public"));

/*
* Generate DecisionObjects
* */
app.post("/api/generate/table/multi-axis", (request, response) => {
    console.debug(`Generating multi axis table for:
    ${JSON.stringify(request.body)}`);
    const multiAxisTable = new MultiAxisTable(undefined, request.body);
    response.send(multiAxisTable.getRules());
});

app.post("/api/generate/table/single-axis", (request, response) => {
    console.debug(`Generating single axis table for:
    ${JSON.stringify(request.body)}`);
    const singleAxisTable = new SingleAxisTable(undefined, request.body);
    response.send(singleAxisTable.getRules());
});

app.post("/api/generate/ruleset", (request, response) => {
    const ruleSet = new RuleSet(undefined, request.body);
    response.send(ruleSet.getRules());
});

/*
* Load and run engine(s)
* */
app.post("/api/load/engine", (request, response) => {
    try {
        getEngine(request.body.name, request.body.version, request.body.rules, request.body.SchemaVersion);
        response.json({loaded: true});
    } catch (e) {
        response.json({
            error: {
                message: e.message,
                stack: e.stack
            }
        });
    }
});

app.post("/api/run/engine", (request, response) => {
    try {
        const bom = request.body.bom;
        const engine = getEngine(request.body.name, request.body.version, void 0, request.body.SchemaVersion);
        engine.reset(bom).run(request.body.configuration);
        response.json(bom);
    } catch (e) {
        response.status(500);
        response.json({
            error: {
                message: e.message,
                stack: e.stack
            }
        });
    }
});

app.post("/api/run/engines", (request, response) => {
    try {
        const boms = request.body.boms;
        const engine = getEngine(request.body.name, request.body.version, void 0, request.body.SchemaVersion);
        boms.forEach((bom) => {
            engine.reset(bom).run(request.body.configuration);
        });
        response.json(boms);
    } catch (e) {
        response.json({
            error: {
                message: e.message,
                stack: e.stack
            }
        });
    }
});

app.get("/api/generate/java/rules-engine-runner", (request, response) => {
    const packageName = request.query.packageName;
    const javaFile = generateRulesEngineRunner(packageName);
    response.setHeader("Content-disposition", "attachment; filename=RulesEngineRunner.java");
    response.setHeader("Content-type", "text/plain");
    response.send(javaFile);
});

app.get("/api/generate/java/rules-engine", (request, response) => {
    const packageName = request.query.packageName;
    const javaFile = generateRulesEngine(packageName);
    response.setHeader("Content-disposition", "attachment; filename=RulesEngine.java");
    response.setHeader("Content-type", "text/plain");
    response.send(javaFile);
});


/*
* Misc Junk
* */
app.get("/api/wordmap", (request, response) => {
    const
        text = request.query.text,
        width = 250,
        height = 250,
        rotateWords = true,
        uniqueWordCounts = {},
        wordmap = processText(text);

    function writeSvgToFile(body) {
        const svgString = body.node().innerHTML;
        response.send(svgString);
    }

        const svg = d3.select("body").html("").append("svg")
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");

    drawCloud(wordmap, request.query.colourScheme ? parseInt(request.query.colourScheme) : 0, width, height, svg, rotateWords, writeSvgToFile);

});

app.listen(port, (err) => {
    if (err) {
        return console.error("something bad happened", err);
    }
});
