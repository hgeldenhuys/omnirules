"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var author_1 = require("../src/author");
var rulesengine_1 = require("../src/rulesengine");
describe("Basics: Inputs", function () {
    var start = Date.now();
    var rules = { rules: [{ name: "ToDoAskForTray", code: "result = bom.Drink.length > 2;", behaviour: 1 }, { name: "Pay", code: "result = ((bom.ToDoAskForTray == false) || (bom.AskedForTray && bom.ToDoAskForTray)) && (bom.Drink.length > 0);", behaviour: 1 }], Version: "3.2.0" };
    var engine = new rulesengine_1.Rulesengine(rules.rules, {}, "Test", "1.0", "ABC");
    for (var x = 0; x < 10000; x++) {
        var BOM = { Drink: [{ Type: "Americano", Size: "Mezo" }, { Type: "Americano", Size: "Mezo" }, { Type: "Americano", Size: "Mezo" }],
            AskedForTray: false, ToDoAskForTray: false };
        engine.reset(BOM);
        engine.run({ withStats: true });
    }
    console.log("Took: " + (Date.now() - start));
    it("Deserialize input", function () {
        var decisionObjectStructure = {
            name: "Basic",
            version: "1",
            inputs: [{ token: "Name", dataType: author_1.DataTypeEnum.String }],
            outputs: [{ token: "FullName", calculation: "Name + ' ' + LastName" }]
        };
        var decisionObject = new author_1.DecisionObject(undefined, decisionObjectStructure);
        var BOM = decisionObject.generateSampleBOM();
        chai_1.expect(BOM.getValue("Name")).to.equal("A string");
    });
    it("Procedurally add input", function () {
        var decisionObjectStructure = {
            name: "Basic",
            version: "1",
            inputs: [{ token: "Name", dataType: author_1.DataTypeEnum.String }],
            outputs: [{ token: "FullName", calculation: "Name + ' ' + LastName" }]
        };
        var decisionObject = new author_1.DecisionObject(undefined, decisionObjectStructure);
        decisionObject.builder.withInput("LastName").asString("Geldenhuys");
        var BOM = decisionObject.generateSampleBOM();
        chai_1.expect(BOM.getValue("LastName")).to.equal("Geldenhuys");
    });
    it("Deserialize output", function () {
        var decisionObjectStructure = {
            name: "Basic",
            version: "1",
            inputs: [{ token: "Name", dataType: author_1.DataTypeEnum.String, mockValue: "'Herman'" }, { token: "LastName", dataType: author_1.DataTypeEnum.String, mockValue: "'Geldenhuys'" }],
            outputs: [{ token: "FullName", calculation: "Name + ' ' + LastName", dataType: author_1.DataTypeEnum.String }]
        };
        var decisionObject = new author_1.DecisionObject(undefined, decisionObjectStructure);
        var BOM = decisionObject.generateSampleBOM();
        var engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run();
        chai_1.expect(BOM.getValue("FullName")).to.equal("Herman Geldenhuys");
    });
    it("Procedurally add output", function () {
        var decisionObjectStructure = {
            name: "Basic",
            version: "1",
            inputs: [{ token: "Name", dataType: author_1.DataTypeEnum.String, mockValue: "'Hendrik'" }, { token: "LastName", dataType: author_1.DataTypeEnum.String, mockValue: "'Geldenhuys'" }],
            outputs: []
        };
        var decisionObject = new author_1.DecisionObject(undefined, decisionObjectStructure);
        decisionObject.builder.withOutput("FullName").asString().usingCalculation("Name + ' ' + LastName");
        var BOM = decisionObject.generateSampleBOM();
        var engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run({ withStats: false });
        chai_1.expect(BOM.getValue("FullName")).to.equal("Hendrik Geldenhuys");
    });
    it("Schema Version Hash", function () {
        var ruleSet = new author_1.RuleSet(undefined, {
            inputs: [],
            outputs: []
        });
        chai_1.expect(ruleSet.generateSampleBOM().SchemaVersion).to.equals("d41d8cd98f00b204e9800998ecf8427e");
    });
    it("DataTypes", function () {
        var ruleSet = new author_1.RuleSet(undefined, {
            inputs: [],
            outputs: [],
            ruleContext: {
                name: "Testing",
                enumerations: [{
                        name: "Colour",
                        values: [{
                                value: "Green"
                            }]
                    }]
            }
        });
        ruleSet.builder
            .withInput("AString").asString("ABC").comma()
            .withInput("ADecimal").asDecimal(12.3).comma()
            .withInput("AnInteger").asInteger(123).comma()
            .withInput("ABoolean").asBoolean(true).comma()
            .withInput("ADate").asDate().comma()
            .withInput("AnEnum").asEnum("Colour", "Green").comma()
            .withInput("AList").asList([123, 456]).comma()
            .withInput("AnObject").asObject({ abc: 123 });
        chai_1.expect(ruleSet.getInput("AString").dataType).to.equals(author_1.DataTypeEnum.String);
        chai_1.expect(ruleSet.getInput("ADecimal").dataType).to.equals(author_1.DataTypeEnum.Decimal);
        chai_1.expect(ruleSet.getInput("AnInteger").dataType).to.equals(author_1.DataTypeEnum.Integer);
        chai_1.expect(ruleSet.getInput("ABoolean").dataType).to.equals(author_1.DataTypeEnum.Boolean);
        chai_1.expect(ruleSet.getInput("ADate").dataType).to.equals(author_1.DataTypeEnum.Date);
        chai_1.expect(ruleSet.getInput("AnEnum").dataType).to.equals(author_1.DataTypeEnum.Enum);
        chai_1.expect(ruleSet.getInput("AList").dataType).to.equals(author_1.DataTypeEnum.List);
        chai_1.expect(ruleSet.getInput("AnObject").dataType).to.equals(author_1.DataTypeEnum.Object);
        ruleSet.builder
            .withInput("AnObject").remove().withInput("AString").remove();
        chai_1.expect(ruleSet.getInput("AString")).to.equals(undefined);
        chai_1.expect(ruleSet.getInput("AnObject")).to.equals(undefined);
    });
    it("Calculating Peekaboo", function () {
        var ruleSet = new author_1.RuleSet(undefined, {
            inputs: [],
            outputs: []
        });
        ruleSet.builder
            .withInput("PeekA").asString("BOO").comma()
            .withInput("options.ABoolean").asBoolean(true).comma()
            .withOutput("I").usingCalculation("'See You!'");
        var decisionObject = new author_1.DecisionObject(undefined, ruleSet);
        var bom = ruleSet.generateSampleBOM();
        var engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, bom, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run();
        chai_1.expect(bom.getValue("I")).to.equals("See You!");
    });
    it("Calculating Peekaboo with 1 conditional true then false", function () {
        var ruleSet = new author_1.RuleSet(undefined, {
            inputs: [],
            outputs: []
        });
        ruleSet.builder
            .withInput("PeekA").asString("BOO").comma()
            .withInput("options.ABoolean").asBoolean(true).comma()
            .withOutput("I").usingCalculation("'See You!'");
        var bom = ruleSet.generateSampleBOM();
        var engine = new rulesengine_1.Rulesengine(ruleSet.getRules().rules, bom, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());
        engine.run();
        chai_1.expect(bom.getValue("I")).to.equals("See You!");
        ruleSet.builder
            .withOutput("I").ifTrueThat("ABoolean");
        bom = ruleSet.generateSampleBOM();
        engine = new rulesengine_1.Rulesengine(ruleSet.getRules().rules, bom, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());
        engine.run();
        chai_1.expect(bom.getValue("I")).to.equals("See You!");
        bom = ruleSet.generateSampleBOM();
        bom.setValue("options.ABoolean", false);
        engine = new rulesengine_1.Rulesengine(ruleSet.getRules().rules, bom, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());
        engine.run();
        chai_1.expect(bom.getValue("I")).to.equals(undefined);
    });
    it("Calculating Peekaboo with multiple conditional", function () {
        var ruleSet = new author_1.RuleSet(undefined, {
            inputs: [],
            outputs: [],
            name: "Peekaboo"
        });
        ruleSet.builder
            .withInput("PeekA").asString("BOO").comma()
            .withInput("options.ABoolean").asBoolean(true).comma()
            .withOutput("I").usingCalculation("'See You!'")
            .ifTrueThat("ABoolean").and()
            .ifTrueThat("PeekA==='BOO'");
        var bom = ruleSet.generateSampleBOM();
        var engine = new rulesengine_1.Rulesengine(ruleSet.getRules().rules, bom, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());
        engine.run();
        chai_1.expect(bom.getValue("I")).to.equals("See You!");
        ruleSet.builder
            .withOutput("I");
        bom = ruleSet.generateSampleBOM();
        engine = new rulesengine_1.Rulesengine(ruleSet.getRules().rules, bom, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());
        engine.run();
        chai_1.expect(bom.getValue("I")).to.equals("See You!");
        bom = ruleSet.generateSampleBOM();
        bom.setValue("options.ABoolean", false);
        engine = new rulesengine_1.Rulesengine(ruleSet.getRules().rules, bom, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());
        engine.run({ withStats: true });
        chai_1.expect(bom.getValue("I")).to.equals(undefined);
        chai_1.expect(bom.getValue("engine.Peekaboo.conditions.I_1_ABooleanIsTrue")).to.equals(false);
        chai_1.expect(bom.getValue("engine.Peekaboo.conditions.I_2_PeekAIsEqualTo_BOO_IsTrue")).to.equals(true);
    });
});
//# sourceMappingURL=test_basics.js.map