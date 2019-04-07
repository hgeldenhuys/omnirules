import { expect } from "chai";
import "mocha";
import { ConditionTypeEnum, DataTypeEnum, DecisionObject, DecisionObjectType } from "../src/author";
import { getBOMValue, RuleBehaviour, Rulesengine } from "../src/rulesengine";


describe(`Schema: Input Paths`, () => {
    it(`Level 0 Input: Name=Ransom`, () => {
        const decision = {
            decisionObjectType: DecisionObjectType.RuleSet,
            version: "1",
            name: "Schema",
            inputs: [{
                mockValue: "'Ransom'",
                definition: "",
                relativePath: "Name",
                dataType: DataTypeEnum.String,
                token: "Name",
                name: "Name"
            }],
            outputs: [{
                ruleBehaviour: RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                relativePath: "Echo.Echo",
                dataType: DataTypeEnum.String,
                token: "Echo",
                name: "Echo",
                decisionObject: undefined,
                rawValue: false,
                calculation: "Name + Name",
                inputMappings: [],
                conditions: []
            }]
        };
        const decisionObject = new DecisionObject(undefined, decision),
            BOM = decisionObject.generateSampleBOM(),
            engine = new Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run();
        const result = getBOMValue(BOM, "bom.Name");
        expect(result).to.equal("Ransom");
    });
    it(`Level 1 Input: Client.Name=Ransom`, () => {
        const decision = {
            decisionObjectType: DecisionObjectType.RuleSet,
            version: "1",
            name: "Schema",
            inputs: [{
                mockValue: "'Ransom'",
                definition: "",
                relativePath: "Client.Name",
                dataType: DataTypeEnum.String,
                token: "Name",
                name: "Name"
            }],
            outputs: [{
                ruleBehaviour: RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                relativePath: "Echo.Echo",
                dataType: DataTypeEnum.String,
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
                    conditionType: ConditionTypeEnum.Boolean,
                    number: undefined,
                    token: "Name is Ransom"
                }]
            }]
        };
        let decisionObject = new DecisionObject(undefined, decision);
        let BOM = decisionObject.generateSampleBOM();
        decisionObject = new DecisionObject(undefined, decision);
        let engine = new Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run({withStats: true});

        expect(getBOMValue(BOM, "bom.Client.Name")).to.equal("Ransom");
        expect(getBOMValue(BOM, "bom.Echo.Echo")).to.equal("RansomRansom");

        decision.outputs[0].conditions[0].expression = "Name !== 'Ransom'";
        decisionObject = new DecisionObject(undefined, decision);
        BOM = decisionObject.generateSampleBOM();
        engine = new Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run({withStats: true});
        expect(getBOMValue(BOM, "bom.Client.Name")).to.equals("Ransom");
        expect(getBOMValue(BOM, "bom.Echo.Echo")).to.equals(undefined);
    });
});

describe(`Conditions: Simple`, () => {
    it(`Boolean = true`, () => {
        const decision = {
            decisionObjectType: DecisionObjectType.RuleSet,
            version: "1",
            name: "Schema",
            inputs: [{
                mockValue: "'Ransom'",
                definition: "",
                relativePath: "Client.Name",
                dataType: DataTypeEnum.String,
                token: "Name",
                name: "Name"
            }],
            outputs: [{
                ruleBehaviour: RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                relativePath: "Echo.Echo",
                dataType: DataTypeEnum.String,
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
                    conditionType: ConditionTypeEnum.Boolean,
                    number: undefined,
                    token: "Name is Ransom"
                }]
            }]
        };
        let decisionObject = new DecisionObject(undefined, decision);
        const BOM = decisionObject.generateSampleBOM();
        decisionObject = new DecisionObject(undefined, decision);
        const engine = new Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run({withStats: true});
        expect(getBOMValue(BOM, "bom.Client.Name")).to.equal("Ransom");
        expect(getBOMValue(BOM, "bom.engine.Schema.conditions.Echo.Echo_1_Name_is_Ransom")).to.equal(true);
        expect(getBOMValue(BOM, "bom.Echo.Echo")).to.equal("RansomRansom");
    });
    it(`Boolean = false`, () => {
        const decision = {
            decisionObjectType: DecisionObjectType.RuleSet,
            version: "1",
            name: "Schema",
            inputs: [{
                mockValue: "'Ransom'",
                definition: "",
                relativePath: "Client.Name",
                dataType: DataTypeEnum.String,
                token: "Name",
                name: "Name"
            }],
            outputs: [{
                ruleBehaviour: RuleBehaviour.Normal,
                mockValue: undefined,
                definition: "",
                relativePath: "Echo.Echo",
                dataType: DataTypeEnum.String,
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
                    conditionType: ConditionTypeEnum.Boolean,
                    number: undefined,
                    token: "Name is Ransom"
                }]
            }]
        };
        let decisionObject = new DecisionObject(undefined, decision);
        const BOM = decisionObject.generateSampleBOM();
        decisionObject = new DecisionObject(undefined, decision);
        const engine = new Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run({withStats: true});
        expect(getBOMValue(BOM, "bom.Client.Name")).to.equal("Ransom");

        expect(getBOMValue(BOM, "bom.engine.Schema.conditions.Echo.Echo_1_Name_is_Ransom")).to.equal(false);
        expect(getBOMValue(BOM, "bom.Echo.Echo")).to.equals(undefined);
    });
});

describe(`Conditionals: GreaterThan, LessThan, Between, Outside`, () => {
    const decision = {
        decisionObjectType: DecisionObjectType.RuleSet,
        version: "1",
        name: "Schema",
        inputs: [{
            mockValue: "5",
            definition: "",
            relativePath: "Number.Bottom",
            dataType: DataTypeEnum.Integer,
            token: "Bottom",
            name: "The Bottom Number"
        }, {
            mockValue: "10",
            definition: "",
            relativePath: "Number.Top",
            dataType: DataTypeEnum.Integer,
            token: "Top",
            name: "The Top Number"
        }],
        outputs: [{
            ruleBehaviour: RuleBehaviour.Normal,
            mockValue: undefined,
            definition: "",
            relativePath: "Results.GreaterThan",
            dataType: DataTypeEnum.String,
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
                conditionType: ConditionTypeEnum.GreaterThan,
                number: "Bottom",
                token: "6 > Bottom"
            }]
        },
            {
            ruleBehaviour: RuleBehaviour.Normal,
            mockValue: undefined,
            definition: "",
            relativePath: "Results.LessThan",
            dataType: DataTypeEnum.String,
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
                conditionType: ConditionTypeEnum.LessThan,
                number: "Top",
                token: "6 < Top"
            }]
        },
            {
            ruleBehaviour: RuleBehaviour.Normal,
            mockValue: undefined,
            definition: "",
            relativePath: "Results.GreaterThanOrEqualTo",
            dataType: DataTypeEnum.String,
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
                conditionType: ConditionTypeEnum.GreaterThanOrEqualTo,
                number: "Bottom",
                token: "6 >= Bottom"
            }]
        },
            {
            ruleBehaviour: RuleBehaviour.Normal,
            mockValue: undefined,
            definition: "",
            relativePath: "Results.LessThanOrEqualTo",
            dataType: DataTypeEnum.String,
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
                conditionType: ConditionTypeEnum.LessThanOrEqualTo,
                number: "Top",
                token: "6 <= Top"
            }]
        },
            {
            ruleBehaviour: RuleBehaviour.Normal,
            mockValue: undefined,
            definition: "",
            relativePath: "Results.Between",
            dataType: DataTypeEnum.String,
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
                conditionType: ConditionTypeEnum.Between,
                number: undefined,
                token: "Bottom <= 6 <= Top"
            }]
        }]
    };
    let decisionObject = new DecisionObject(undefined, decision);
    const BOM = decisionObject.generateSampleBOM();

    decisionObject = new DecisionObject(undefined, decision);
    const engine = new Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
    engine.run({withStats: true});

    it(`GreaterThan`, () => {
        // @ts-ignore
        expect(BOM.Results.GreaterThan).to.equal("6 is greater than Bottom");
    });
    it(`LessThan`, () => {
        // @ts-ignore
        expect(BOM.Results.LessThan).to.equal("6 is less than Top");
    });
    it(`GreaterThan`, () => {
        // @ts-ignore
        expect(BOM.Results.GreaterThanOrEqualTo).to.equal("6 is greater than or equal to Bottom");
    });
    it(`LessThan`, () => {
        // @ts-ignore
        expect(BOM.Results.LessThanOrEqualTo).to.equal("6 is less than or equal to Top");
    });
    it(`Between`, () => {
        // @ts-ignore
        expect(BOM.Results.Between).to.equal("6 is between bom.Number.Bottom and Top");
    });
});
