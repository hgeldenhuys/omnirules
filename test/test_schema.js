"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var author_1 = require("../src/author");
var rulesengine_1 = require("../src/rulesengine");
describe("Schema: Input Paths", function () {
    it("Level 0 Input: Name=Ransom", function () {
        var decision = {
            decisionObjectType: author_1.DecisionObjectType.RuleSet,
            version: "1",
            name: "Schema",
            inputs: [{
                    mockValue: "'Ransom'",
                    definition: "",
                    path: "Name",
                    dataType: author_1.DataTypeEnum.String,
                    name: "Name",
                }],
            outputs: [{
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    mockValue: undefined,
                    definition: "",
                    path: "Echo.Echo",
                    dataType: author_1.DataTypeEnum.String,
                    name: "Echo",
                    decisionObject: undefined,
                    rawValue: false,
                    code: "Name + Name",
                    inputMappings: [],
                    conditions: []
                }]
        };
        var decisionObject = new author_1.DecisionObject(undefined, decision), BOM = decisionObject.generateSampleBOM(), engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run();
        var result = rulesengine_1.getBOMValue(BOM, "bom.Name");
        chai_1.expect(result).to.equal("Ransom");
    });
    it("Level 1 Input: Client.Name=Ransom", function () {
        var decision = {
            decisionObjectType: author_1.DecisionObjectType.RuleSet,
            version: "1",
            name: "Schema",
            inputs: [{
                    mockValue: "'Ransom'",
                    definition: "",
                    path: "Client.Name",
                    dataType: author_1.DataTypeEnum.String,
                    name: "Name",
                }],
            outputs: [{
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    mockValue: undefined,
                    definition: "",
                    path: "Echo.Echo",
                    dataType: author_1.DataTypeEnum.String,
                    name: "Echo",
                    decisionObject: undefined,
                    rawValue: false,
                    code: "Name + Name",
                    inputMappings: [],
                    conditions: [{
                            to: undefined,
                            includeTo: false,
                            includeFrom: false,
                            from: undefined,
                            expression: "Name === 'Ransom'",
                            conditionType: author_1.ConditionTypeEnum.Boolean,
                            number: undefined,
                            name: "Name is Ransom"
                        }]
                }]
        };
        var decisionObject = new author_1.DecisionObject(undefined, decision);
        var BOM = decisionObject.generateSampleBOM();
        decisionObject = new author_1.DecisionObject(undefined, decision);
        var engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run({ withStats: true });
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.Client.Name")).to.equal("Ransom");
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.Echo.Echo")).to.equal("RansomRansom");
        decision.outputs[0].conditions[0].expression = "Name !== 'Ransom'";
        decisionObject = new author_1.DecisionObject(undefined, decision);
        BOM = decisionObject.generateSampleBOM();
        engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run({ withStats: true });
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.Client.Name")).to.equals("Ransom");
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.Echo.Echo")).to.equals(undefined);
    });
});
describe("Conditions: Simple", function () {
    it("Boolean = true", function () {
        var decision = {
            decisionObjectType: author_1.DecisionObjectType.RuleSet,
            version: "1",
            name: "Schema",
            inputs: [{
                    mockValue: "'Ransom'",
                    definition: "",
                    path: "Client.Name",
                    dataType: author_1.DataTypeEnum.String,
                    name: "Name",
                }],
            outputs: [{
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    mockValue: undefined,
                    definition: "",
                    path: "Echo.Echo",
                    dataType: author_1.DataTypeEnum.String,
                    name: "Echo",
                    decisionObject: undefined,
                    rawValue: false,
                    code: "Name + Name",
                    inputMappings: [],
                    conditions: [{
                            to: undefined,
                            includeTo: false,
                            includeFrom: false,
                            from: undefined,
                            expression: "Name === 'Ransom'",
                            conditionType: author_1.ConditionTypeEnum.Boolean,
                            number: undefined,
                            name: "Name is Ransom"
                        }]
                }]
        };
        var decisionObject = new author_1.DecisionObject(undefined, decision);
        var BOM = decisionObject.generateSampleBOM();
        decisionObject = new author_1.DecisionObject(undefined, decision);
        var engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run({ withStats: true });
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.Client.Name")).to.equal("Ransom");
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.engine.Schema.conditions.Echo.Echo_1_Name_is_Ransom")).to.equal(true);
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.Echo.Echo")).to.equal("RansomRansom");
    });
    it("Boolean = false", function () {
        var decision = {
            decisionObjectType: author_1.DecisionObjectType.RuleSet,
            version: "1",
            name: "Schema",
            inputs: [{
                    mockValue: "'Ransom'",
                    definition: "",
                    path: "Client.Name",
                    dataType: author_1.DataTypeEnum.String,
                    name: "Name",
                }],
            outputs: [{
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    mockValue: undefined,
                    definition: "",
                    path: "Echo.Echo",
                    dataType: author_1.DataTypeEnum.String,
                    name: "Echo",
                    decisionObject: undefined,
                    rawValue: false,
                    code: "Name + Name",
                    inputMappings: [],
                    conditions: [{
                            to: undefined,
                            includeTo: false,
                            includeFrom: false,
                            from: undefined,
                            expression: "Name !== 'Ransom'",
                            conditionType: author_1.ConditionTypeEnum.Boolean,
                            number: undefined,
                            name: "Name is Ransom"
                        }]
                }]
        };
        var decisionObject = new author_1.DecisionObject(undefined, decision);
        var BOM = decisionObject.generateSampleBOM();
        decisionObject = new author_1.DecisionObject(undefined, decision);
        var engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run({ withStats: true });
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.Client.Name")).to.equal("Ransom");
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.engine.Schema.conditions.Echo.Echo_1_Name_is_Ransom")).to.equal(false);
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.Echo.Echo")).to.equals(undefined);
    });
});
describe("Conditionals: GreaterThan, LessThan, Between, Outside", function () {
    var decision = {
        decisionObjectType: author_1.DecisionObjectType.RuleSet,
        version: "1",
        name: "Schema",
        inputs: [{
                mockValue: "5",
                definition: "",
                path: "Number.Bottom",
                dataType: author_1.DataTypeEnum.Integer,
                name: "Bottom",
            }, {
                mockValue: "10",
                definition: "",
                path: "Number.Top",
                dataType: author_1.DataTypeEnum.Integer,
                name: "Top",
            }],
        outputs: [{
                ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                path: "Results.GreaterThan",
                dataType: author_1.DataTypeEnum.String,
                name: "GreaterThan",
                decisionObject: undefined,
                rawValue: false,
                code: "'6 is greater than Bottom'",
                inputMappings: [],
                conditions: [{
                        to: undefined,
                        includeTo: false,
                        includeFrom: false,
                        from: undefined,
                        expression: "6",
                        conditionType: author_1.ConditionTypeEnum.GreaterThan,
                        number: "Bottom",
                        name: "6 > Bottom"
                    }]
            },
            {
                ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                path: "Results.LessThan",
                dataType: author_1.DataTypeEnum.String,
                name: "LessThan",
                decisionObject: undefined,
                rawValue: false,
                code: "'6 is less than Top'",
                inputMappings: [],
                conditions: [{
                        to: undefined,
                        includeTo: false,
                        includeFrom: false,
                        from: undefined,
                        expression: "6",
                        conditionType: author_1.ConditionTypeEnum.LessThan,
                        number: "Top",
                        name: "6 < Top"
                    }]
            },
            {
                ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                path: "Results.GreaterThanOrEqualTo",
                dataType: author_1.DataTypeEnum.String,
                name: "GreaterThanOrEqualTo",
                decisionObject: undefined,
                rawValue: false,
                code: "'6 is greater than or equal to Bottom'",
                inputMappings: [],
                conditions: [{
                        to: undefined,
                        includeTo: false,
                        includeFrom: false,
                        from: undefined,
                        expression: "6",
                        conditionType: author_1.ConditionTypeEnum.GreaterThanOrEqualTo,
                        number: "Bottom",
                        name: "6 >= Bottom"
                    }]
            },
            {
                ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                path: "Results.LessThanOrEqualTo",
                dataType: author_1.DataTypeEnum.String,
                name: "LessThanOrEqualTo",
                decisionObject: undefined,
                rawValue: false,
                code: "'6 is less than or equal to Top'",
                inputMappings: [],
                conditions: [{
                        to: undefined,
                        includeTo: false,
                        includeFrom: false,
                        from: undefined,
                        expression: "6",
                        conditionType: author_1.ConditionTypeEnum.LessThanOrEqualTo,
                        number: "Top",
                        name: "6 <= Top"
                    }]
            },
            {
                ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                path: "Results.Between",
                dataType: author_1.DataTypeEnum.String,
                name: "Between",
                decisionObject: undefined,
                rawValue: false,
                code: "'6 is between Bottom and Top'",
                inputMappings: [],
                conditions: [{
                        to: "10",
                        includeTo: true,
                        includeFrom: true,
                        from: "6",
                        expression: "6",
                        conditionType: author_1.ConditionTypeEnum.Between,
                        number: undefined,
                        name: "Bottom <= 6 <= Top"
                    }]
            }]
    };
    var decisionObject = new author_1.DecisionObject(undefined, decision);
    var BOM = decisionObject.generateSampleBOM();
    decisionObject = new author_1.DecisionObject(undefined, decision);
    var engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
    engine.run({ withStats: true });
    it("GreaterThan", function () {
        chai_1.expect(BOM.Results.GreaterThan).to.equal("6 is greater than Bottom");
    });
    it("LessThan", function () {
        chai_1.expect(BOM.Results.LessThan).to.equal("6 is less than Top");
    });
    it("GreaterThan", function () {
        chai_1.expect(BOM.Results.GreaterThanOrEqualTo).to.equal("6 is greater than or equal to Bottom");
    });
    it("LessThan", function () {
        chai_1.expect(BOM.Results.LessThanOrEqualTo).to.equal("6 is less than or equal to Top");
    });
    it("Between", function () {
        chai_1.expect(BOM.Results.Between).to.equal("6 is between bom.Number.Bottom and Top");
    });
});
//# sourceMappingURL=test_schema.js.map