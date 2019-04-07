"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const author_1 = require("../src/author");
const rulesengine_1 = require("../src/rulesengine");
describe(`Schema: Input Paths`, () => {
    it(`Level 0 Input: Name=Ransom`, () => {
        const decision = {
            decisionObjectType: author_1.DecisionObjectType.RuleSet,
            version: "1",
            name: "Schema",
            inputs: [{
                    mockValue: "'Ransom'",
                    definition: "",
                    relativePath: "Name",
                    dataType: author_1.DataTypeEnum.String,
                    token: "Name",
                    name: "Name"
                }],
            outputs: [{
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    mockValue: undefined,
                    definition: "",
                    relativePath: "Echo.Echo",
                    dataType: author_1.DataTypeEnum.String,
                    token: "Echo",
                    name: "Echo",
                    decisionObject: undefined,
                    rawValue: false,
                    calculation: "Name + Name",
                    inputMappings: [],
                    conditions: []
                }]
        };
        const decisionObject = new author_1.DecisionObject(undefined, decision), BOM = decisionObject.generateSampleBOM(), engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run();
        const result = rulesengine_1.getBOMValue(BOM, "bom.Name");
        chai_1.expect(result).to.equal("Ransom");
    });
    it(`Level 1 Input: Client.Name=Ransom`, () => {
        const decision = {
            decisionObjectType: author_1.DecisionObjectType.RuleSet,
            version: "1",
            name: "Schema",
            inputs: [{
                    mockValue: "'Ransom'",
                    definition: "",
                    relativePath: "Client.Name",
                    dataType: author_1.DataTypeEnum.String,
                    token: "Name",
                    name: "Name"
                }],
            outputs: [{
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    mockValue: undefined,
                    definition: "",
                    relativePath: "Echo.Echo",
                    dataType: author_1.DataTypeEnum.String,
                    token: "Echo",
                    name: "Echo",
                    decisionObject: undefined,
                    rawValue: false,
                    calculation: "Name + Name",
                    inputMappings: [],
                    conditions: [{
                            to: undefined,
                            includeTo: false,
                            includeFrom: false,
                            from: undefined,
                            expression: "Name === 'Ransom'",
                            conditionType: author_1.ConditionTypeEnum.Boolean,
                            number: undefined,
                            token: "Name is Ransom"
                        }]
                }]
        };
        let decisionObject = new author_1.DecisionObject(undefined, decision);
        let BOM = decisionObject.generateSampleBOM();
        decisionObject = new author_1.DecisionObject(undefined, decision);
        let engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
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
describe(`Conditions: Simple`, () => {
    it(`Boolean = true`, () => {
        const decision = {
            decisionObjectType: author_1.DecisionObjectType.RuleSet,
            version: "1",
            name: "Schema",
            inputs: [{
                    mockValue: "'Ransom'",
                    definition: "",
                    relativePath: "Client.Name",
                    dataType: author_1.DataTypeEnum.String,
                    token: "Name",
                    name: "Name"
                }],
            outputs: [{
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    mockValue: undefined,
                    definition: "",
                    relativePath: "Echo.Echo",
                    dataType: author_1.DataTypeEnum.String,
                    token: "Echo",
                    name: "Echo",
                    decisionObject: undefined,
                    rawValue: false,
                    calculation: "Name + Name",
                    inputMappings: [],
                    conditions: [{
                            to: undefined,
                            includeTo: false,
                            includeFrom: false,
                            from: undefined,
                            expression: "Name === 'Ransom'",
                            conditionType: author_1.ConditionTypeEnum.Boolean,
                            number: undefined,
                            token: "Name is Ransom"
                        }]
                }]
        };
        let decisionObject = new author_1.DecisionObject(undefined, decision);
        const BOM = decisionObject.generateSampleBOM();
        decisionObject = new author_1.DecisionObject(undefined, decision);
        const engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run({ withStats: true });
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.Client.Name")).to.equal("Ransom");
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.engine.Schema.conditions.Echo.Echo_1_Name_is_Ransom")).to.equal(true);
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.Echo.Echo")).to.equal("RansomRansom");
    });
    it(`Boolean = false`, () => {
        const decision = {
            decisionObjectType: author_1.DecisionObjectType.RuleSet,
            version: "1",
            name: "Schema",
            inputs: [{
                    mockValue: "'Ransom'",
                    definition: "",
                    relativePath: "Client.Name",
                    dataType: author_1.DataTypeEnum.String,
                    token: "Name",
                    name: "Name"
                }],
            outputs: [{
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    mockValue: undefined,
                    definition: "",
                    relativePath: "Echo.Echo",
                    dataType: author_1.DataTypeEnum.String,
                    token: "Echo",
                    name: "Echo",
                    decisionObject: undefined,
                    rawValue: false,
                    calculation: "Name + Name",
                    inputMappings: [],
                    conditions: [{
                            to: undefined,
                            includeTo: false,
                            includeFrom: false,
                            from: undefined,
                            expression: "Name !== 'Ransom'",
                            conditionType: author_1.ConditionTypeEnum.Boolean,
                            number: undefined,
                            token: "Name is Ransom"
                        }]
                }]
        };
        let decisionObject = new author_1.DecisionObject(undefined, decision);
        const BOM = decisionObject.generateSampleBOM();
        decisionObject = new author_1.DecisionObject(undefined, decision);
        const engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run({ withStats: true });
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.Client.Name")).to.equal("Ransom");
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.engine.Schema.conditions.Echo.Echo_1_Name_is_Ransom")).to.equal(false);
        chai_1.expect(rulesengine_1.getBOMValue(BOM, "bom.Echo.Echo")).to.equals(undefined);
    });
});
describe(`Conditionals: GreaterThan, LessThan, Between, Outside`, () => {
    const decision = {
        decisionObjectType: author_1.DecisionObjectType.RuleSet,
        version: "1",
        name: "Schema",
        inputs: [{
                mockValue: "5",
                definition: "",
                relativePath: "Number.Bottom",
                dataType: author_1.DataTypeEnum.Integer,
                token: "Bottom",
                name: "The Bottom Number"
            }, {
                mockValue: "10",
                definition: "",
                relativePath: "Number.Top",
                dataType: author_1.DataTypeEnum.Integer,
                token: "Top",
                name: "The Top Number"
            }],
        outputs: [{
                ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                relativePath: "Results.GreaterThan",
                dataType: author_1.DataTypeEnum.String,
                token: "GreaterThan",
                name: "GreaterThan",
                decisionObject: undefined,
                rawValue: false,
                calculation: "'6 is greater than Bottom'",
                inputMappings: [],
                conditions: [{
                        to: undefined,
                        includeTo: false,
                        includeFrom: false,
                        from: undefined,
                        expression: "6",
                        conditionType: author_1.ConditionTypeEnum.GreaterThan,
                        number: "Bottom",
                        token: "6 > Bottom"
                    }]
            },
            {
                ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                relativePath: "Results.LessThan",
                dataType: author_1.DataTypeEnum.String,
                token: "LessThan",
                name: "LessThan",
                decisionObject: undefined,
                rawValue: false,
                calculation: "'6 is less than Top'",
                inputMappings: [],
                conditions: [{
                        to: undefined,
                        includeTo: false,
                        includeFrom: false,
                        from: undefined,
                        expression: "6",
                        conditionType: author_1.ConditionTypeEnum.LessThan,
                        number: "Top",
                        token: "6 < Top"
                    }]
            },
            {
                ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                relativePath: "Results.GreaterThanOrEqualTo",
                dataType: author_1.DataTypeEnum.String,
                token: "GreaterThanOrEqualTo",
                name: "GreaterThanOrEqualTo",
                decisionObject: undefined,
                rawValue: false,
                calculation: "'6 is greater than or equal to Bottom'",
                inputMappings: [],
                conditions: [{
                        to: undefined,
                        includeTo: false,
                        includeFrom: false,
                        from: undefined,
                        expression: "6",
                        conditionType: author_1.ConditionTypeEnum.GreaterThanOrEqualTo,
                        number: "Bottom",
                        token: "6 >= Bottom"
                    }]
            },
            {
                ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                relativePath: "Results.LessThanOrEqualTo",
                dataType: author_1.DataTypeEnum.String,
                token: "LessThanOrEqualTo",
                name: "LessThanOrEqualTo",
                decisionObject: undefined,
                rawValue: false,
                calculation: "'6 is less than or equal to Top'",
                inputMappings: [],
                conditions: [{
                        to: undefined,
                        includeTo: false,
                        includeFrom: false,
                        from: undefined,
                        expression: "6",
                        conditionType: author_1.ConditionTypeEnum.LessThanOrEqualTo,
                        number: "Top",
                        token: "6 <= Top"
                    }]
            },
            {
                ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                relativePath: "Results.Between",
                dataType: author_1.DataTypeEnum.String,
                token: "Between",
                name: "Between",
                decisionObject: undefined,
                rawValue: false,
                calculation: "'6 is between Bottom and Top'",
                inputMappings: [],
                conditions: [{
                        to: "10",
                        includeTo: true,
                        includeFrom: true,
                        from: "6",
                        expression: "6",
                        conditionType: author_1.ConditionTypeEnum.Between,
                        number: undefined,
                        token: "Bottom <= 6 <= Top"
                    }]
            }]
    };
    let decisionObject = new author_1.DecisionObject(undefined, decision);
    const BOM = decisionObject.generateSampleBOM();
    decisionObject = new author_1.DecisionObject(undefined, decision);
    const engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
    engine.run({ withStats: true });
    it(`GreaterThan`, () => {
        chai_1.expect(BOM.Results.GreaterThan).to.equal("6 is greater than Bottom");
    });
    it(`LessThan`, () => {
        chai_1.expect(BOM.Results.LessThan).to.equal("6 is less than Top");
    });
    it(`GreaterThan`, () => {
        chai_1.expect(BOM.Results.GreaterThanOrEqualTo).to.equal("6 is greater than or equal to Bottom");
    });
    it(`LessThan`, () => {
        chai_1.expect(BOM.Results.LessThanOrEqualTo).to.equal("6 is less than or equal to Top");
    });
    it(`Between`, () => {
        chai_1.expect(BOM.Results.Between).to.equal("6 is between bom.Number.Bottom and Top");
    });
});
//# sourceMappingURL=test_schema.js.map