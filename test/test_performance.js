"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var author_1 = require("../src/author");
var rulesengine_1 = require("../src/rulesengine");
var decisionObjectStructure = {
    name: "FilterRun",
    version: "2",
    inputs: [{ name: "BrandIndex", dataType: author_1.DataTypeEnum.Integer }],
    outputs: [{ name: "BrandPriority", code: "BrandIndex + 1" }, { name: "Odd", code: "BrandIndex % 2 === 1" }]
};
var decisionObject = new author_1.DecisionObject(undefined, decisionObjectStructure);
var rules = decisionObject.getRules();
var bomArray = [];
for (var index = 0; index < 100000; index++) {
    bomArray.push({
        Name: "Brand " + index,
        BrandIndex: index
    });
}
describe("Performance", function () {
    it("1000 records getRules", function () {
        var ruleSet = new author_1.RuleSet(undefined, {
            inputs: [],
            outputs: [],
            name: "Peekaboo"
        });
        ruleSet.builder
            .withInput("Name").asString("Herman").thenNext()
            .withInput("LastName").asString("Geldenhuys").thenNext()
            .withInput("Age").asInteger(33).thenNext()
            .withOutput("FullName").asString().withCode("Name + ' ' + LastName").thenNext()
            .withOutput("Summary").withCode("FullName + ' is ' + Age + ' years old.'");
        var BOM = { Name: "Herman", LastName: "Geldenhuys", Age: 33, Summary: undefined };
        var engine = new rulesengine_1.Rulesengine(ruleSet.getRules().rules, BOM, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());
        var start = new Date();
        for (var iterator = 0; iterator < 1000; iterator++) {
            BOM = { Name: "Herman", LastName: "Geldenhuys", Age: iterator, Summary: undefined };
            engine.withBom(BOM).run();
        }
        var took = (new Date()).getTime() - start.getTime();
        console.log("took: " + took);
        chai_1.expect(BOM.Summary).to.equal("Herman Geldenhuys is 999 years old.");
        chai_1.expect(took).to.lessThan(40);
    });
    it("Performance: 100 000 - Map without path", function () {
        var decisionObjectStructure = {
            name: "MapRun",
            version: "1",
            inputs: [{ name: "BrandIndex", dataType: author_1.DataTypeEnum.Integer }],
            outputs: [{ name: "BrandPriority", code: "BrandIndex + 1" }]
        };
        var decisionObject = new author_1.DecisionObject(undefined, decisionObjectStructure);
        var bomArray = [];
        for (var index = 0; index < 100000; index++) {
            bomArray.push({
                Name: "Brand " + index,
                BrandIndex: index
            });
        }
        var rules = decisionObject.getRules(), engine = new rulesengine_1.Rulesengine(rules.rules, {}, "MapRun", "1.0.0"), newBomArray = engine.mapRun(bomArray, undefined, { withStats: true });
        chai_1.expect(newBomArray.length).to.equal(bomArray.length, "Map Run didn't product the correct length of " + bomArray.length + " but got " + newBomArray.length);
        chai_1.expect(newBomArray[10000].BrandPriority).to.equal(10001, "Map Run didn't detect BrandPriority in " + JSON.stringify(newBomArray[0]));
    });
    it("Performance: 100 000 - Map without path Using complex model", function () {
        var decisionObjectStructure = {
            name: "MapRun",
            version: "1",
            inputs: [{ name: "BrandIndex", dataType: author_1.DataTypeEnum.Integer }],
            outputs: [{ name: "BrandPriority", code: "BrandIndex + 1" }, { name: "Odd", code: "BrandIndex % 2 === 1" }, { name: "Even", code: "!Odd" }, { name: "Complex", code: "Odd + ':' + Even + ':' + BrandPriority" }]
        };
        var decisionObject = new author_1.DecisionObject(undefined, decisionObjectStructure);
        var bomArray = [];
        for (var index = 0; index < 100000; index++) {
            bomArray.push({
                Name: "Brand " + index,
                BrandIndex: index
            });
        }
        var rules = decisionObject.getRules(), engine = new rulesengine_1.Rulesengine(rules.rules, {}, "MapRun", "1.0.0"), newBomArray = engine.mapRun(bomArray, undefined, { withStats: true });
        chai_1.expect(newBomArray.length).to.equal(bomArray.length, "Map Run didn't product the correct length of " + bomArray.length + " but got " + newBomArray.length);
        chai_1.expect(newBomArray[10000].BrandPriority).to.equal(10001, "Map Run didn't detect BrandPriority in " + JSON.stringify(newBomArray[0]));
    });
    it("Performance: 100 000 - Map with path", function () {
        var decisionObjectStructure = {
            name: "MapRun",
            version: "1",
            inputs: [{ name: "BrandIndex", dataType: author_1.DataTypeEnum.Integer }],
            outputs: [{ name: "BrandPriority", code: "BrandIndex + 1" }]
        };
        var decisionObject = new author_1.DecisionObject(undefined, decisionObjectStructure);
        var bomArray = [];
        for (var index = 0; index < 100000; index++) {
            bomArray.push({
                Name: "Brand " + index,
                BrandIndex: index
            });
        }
        var rules = decisionObject.getRules(), engine = new rulesengine_1.Rulesengine(rules.rules, {}, "MapRun", "1.0.0"), newBomArray = engine.mapRun(bomArray, "bom.BrandPriority", { withStats: true });
        chai_1.expect(newBomArray.length).to.equal(bomArray.length, "Map Run didn't product the correct length of " + bomArray.length + " but got " + newBomArray.length);
        chai_1.expect(newBomArray[10000]).to.equal(10001, "Map Run didn't detect BrandPriority in " + JSON.stringify(newBomArray[0]));
    });
    it("Performance: 100 000 - Filter without path", function () {
        var decisionObjectStructure = {
            name: "FilterRun",
            version: "1",
            inputs: [{ name: "BrandIndex", dataType: author_1.DataTypeEnum.Integer }],
            outputs: [{ name: "BrandPriority", code: "BrandIndex + 1" }, { name: "Odd", code: "BrandIndex % 2 === 1" }]
        };
        var decisionObject = new author_1.DecisionObject(undefined, decisionObjectStructure);
        var bomArray = [];
        for (var index = 0; index < 100000; index++) {
            bomArray.push({
                Name: "Brand " + index,
                BrandIndex: index
            });
        }
        var rules = decisionObject.getRules(), engine = new rulesengine_1.Rulesengine(rules.rules, {}, "FilterRun", "1.0.0"), newBomArray = engine.filterRun(bomArray, "bom.Odd === true", undefined, { withStats: true });
        chai_1.expect(newBomArray.length).to.equal(50000, "Map Run didn't product the correct length of " + bomArray.length + " but got " + newBomArray.length);
        chai_1.expect(newBomArray[10000].BrandPriority).to.equal(20002, "Map Run didn't detect BrandPriority in " + JSON.stringify(newBomArray[0]));
    });
    it("Performance: 100 000 - Filter with path", function () {
        var decisionObjectStructure = {
            name: "FilterRun",
            version: "2",
            inputs: [{ name: "BrandIndex", dataType: author_1.DataTypeEnum.Integer }],
            outputs: [{ name: "BrandPriority", code: "BrandIndex + 1" }, { name: "Odd", code: "BrandIndex % 2 === 1" }]
        };
        var decisionObject = new author_1.DecisionObject(undefined, decisionObjectStructure);
        var bomArray = [];
        for (var index = 0; index < 100000; index++) {
            bomArray.push({
                Name: "Brand " + index,
                BrandIndex: index
            });
        }
        var rules = decisionObject.getRules(), engine = new rulesengine_1.Rulesengine(rules.rules, {}, "FilterRun", "2.0.0"), newBomArray = engine.filterRun(bomArray, "bom.Odd === true", "bom.BrandPriority", { withStats: true });
        chai_1.expect(newBomArray.length).to.equal(50000, "Map Run didn't product the correct length of " + bomArray.length + " but got " + newBomArray.length);
        chai_1.expect(newBomArray[10000]).to.equal(20002, "Map Run didn't detect BrandPriority in " + JSON.stringify(newBomArray[0]));
    });
});
//# sourceMappingURL=test_performance.js.map