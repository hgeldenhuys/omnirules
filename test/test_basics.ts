import { expect } from "chai";
import "mocha";
import { DataTypeEnum, DecisionObject, RuleSet } from "../src/author";
import { engines, jlog, Rulesengine } from "../src/rulesengine";

describe(`Basics: Inputs`, () => {
    const tbuilder = new DecisionObject(undefined, {
        version: "1.0",
        name: "Type Inference",
        inputs: [{
            name: "rawInput"
        }],
        outputs: [
            {
                name: "possibleNumber",
                dataType: DataTypeEnum.Boolean,
                code: "!isNaN(eval(rawInput))",
                path: "possible.Number"
            },
            {
                name: "possibleString",
                dataType: DataTypeEnum.Boolean,
                code: "!!eval(rawInput) && !!eval(rawInput).length",
                path: "possible.String"
            },
            {
                name: "possibleId",
                dataType: DataTypeEnum.Boolean,
                code: "possibleNumber && possibleString",
                path: "possible.Id"
            },
            {
                name: "Length",
                dataType: DataTypeEnum.Integer,
                code: `possibleString && rawInput.length`
            },
            {
                name: "Is13Long",
                dataType: DataTypeEnum.Boolean,
                code: `possibleId && Length === 15`
            }
        ]
    });
    // jlog(tbuilder.getRules());
    // jlog(tbuilder.generateSampleBOM());
    engines.loadDecisionObject(tbuilder);
    const builder2 = new DecisionObject(undefined, {
        name: "Check ID",
        version: "1.0",
        inputs: [
            {
                name: "IDNumber",
                dataType: DataTypeEnum.Any
            }
        ],
        outputs: [
            {
                name: "IsValid",
                dataType: DataTypeEnum.Object,
                code: `
                const ti = engine.getEngine("${tbuilder.name}", "${tbuilder.version}").withBom({rawInput: "'" + IDNumber + "'"}).run();
                result = ti.Length === 15;`
            }
        ]
    });
    jlog(new Rulesengine(builder2.getRules().rules, {IDNumber: 8003075050084}).run({withStats: true}));

    const start = Date.now();
    const rules = {rules: [{name: "ToDoAskForTray", code: "result = bom.Drink.length > 2;", behaviour: 1}, {name: "Pay", code: "result = ((bom.ToDoAskForTray == false) || (bom.AskedForTray && bom.ToDoAskForTray)) && (bom.Drink.length > 0);", behaviour: 1}], Version: "3.2.0"};
    // @ts-ignore
    const engine = new Rulesengine(rules.rules, {}, "Test", "1.0", "ABC");
    for (let x = 0; x < 10000; x++) {
        const BOM = {Drink:
                [{Type: "Americano", Size: "Mezo"}, {Type: "Americano", Size: "Mezo"}, {Type: "Americano", Size: "Mezo"}],
            AskedForTray: false, ToDoAskForTray: false};
        engine.withBom(BOM);
        engine.run({withStats: true});
    }
    console.log(`Took: ${Date.now() - start}`);

    it(`Deserialize input`, () => {
        const decisionObjectStructure = {
            name: `Basic`,
            version: "1",
            inputs: [{name: "Name", dataType: DataTypeEnum.String}],
            outputs: [{name: "FullName", code: "Name + ' ' + LastName"}]
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        const BOM = decisionObject.generateSampleBOM();
        expect(BOM.getValue("Name")).to.equal("A string");
    });

    it(`Procedurally add input`, () => {
        const decisionObjectStructure = {
            name: `Basic`,
            version: "1",
            inputs: [{name: "Name", dataType: DataTypeEnum.String}],
            outputs: [{name: "FullName", code: "Name + ' ' + LastName"}]
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        decisionObject.builder.withInput("LastName").asString("Geldenhuys");

        const BOM = decisionObject.generateSampleBOM();

        expect(BOM.getValue("LastName")).to.equal("Geldenhuys");
    });

    it(`Deserialize output`, () => {
        const decisionObjectStructure = {
            name: `Basic`,
            version: "1",
            inputs: [{name: "Name", dataType: DataTypeEnum.String, mockValue: "'Herman'"}, {name: "LastName", dataType: DataTypeEnum.String, mockValue: "'Geldenhuys'"}],
            outputs: [{name: "FullName", code: "Name + ' ' + LastName", dataType: DataTypeEnum.String}]
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        const BOM = decisionObject.generateSampleBOM();
        const engine = new Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run();
        expect(BOM.getValue("FullName")).to.equal("Herman Geldenhuys");
    });

    it(`Procedurally add output`, () => {
        const decisionObjectStructure = {
            name: `Basic`,
            version: "1",
            inputs: [{name: "Name", dataType: DataTypeEnum.String, mockValue: "'Hendrik'"}, {name: "LastName", dataType: DataTypeEnum.String, mockValue: "'Geldenhuys'"}],
            outputs: []
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        decisionObject.builder.withOutput("FullName").asString().usingCode("Name + ' ' + LastName");
        const BOM = decisionObject.generateSampleBOM();
        const engine = new Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run({withStats: false});
        expect(BOM.getValue("FullName")).to.equal("Hendrik Geldenhuys");
    });

    it(`Schema Version Hash`, () => {
        const ruleSet = new RuleSet(undefined, {
            inputs: [],
            outputs: []
        });
        expect(ruleSet.generateSampleBOM().SchemaVersion).to.equals("d41d8cd98f00b204e9800998ecf8427e");
    });

    it(`DataTypes`, () => {
        const ruleSet = new RuleSet(undefined, {
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
            .withInput("AnObject").asObject({abc: 123});
        expect(ruleSet.getInput("AString").dataType).to.equals(DataTypeEnum.String);
        expect(ruleSet.getInput("ADecimal").dataType).to.equals(DataTypeEnum.Decimal);
        expect(ruleSet.getInput("AnInteger").dataType).to.equals(DataTypeEnum.Integer);
        expect(ruleSet.getInput("ABoolean").dataType).to.equals(DataTypeEnum.Boolean);
        expect(ruleSet.getInput("ADate").dataType).to.equals(DataTypeEnum.Date);
        expect(ruleSet.getInput("AnEnum").dataType).to.equals(DataTypeEnum.Enum);
        expect(ruleSet.getInput("AList").dataType).to.equals(DataTypeEnum.List);
        expect(ruleSet.getInput("AnObject").dataType).to.equals(DataTypeEnum.Object);

        ruleSet.builder
            .withInput("AnObject").remove().withInput("AString").remove();
        expect(ruleSet.getInput("AString")).to.equals(undefined);
        expect(ruleSet.getInput("AnObject")).to.equals(undefined);
    });

    it(`Calculating Peekaboo`, () => {
        const ruleSet = new RuleSet(undefined, {
            inputs: [],
            outputs: []
        });
        ruleSet.builder
            .withInput("PeekA").asString("BOO").comma()
            .withInput("options.ABoolean").asBoolean(true).comma()
            .withOutput("I").usingCode("'See You!'");

        const decisionObject = new DecisionObject(undefined, ruleSet);
        const bom = ruleSet.generateSampleBOM();
        const engine = new Rulesengine(decisionObject.getRules().rules, bom, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
        engine.run();
        expect(bom.getValue("I")).to.equals("See You!");
    });

    it(`Calculating Peekaboo with 1 conditional true then false`, () => {
        const ruleSet = new RuleSet(undefined, {
            inputs: [],
            outputs: []
        });
        ruleSet.builder
            .withInput("PeekA").asString("BOO").comma()
            .withInput("options.ABoolean").asBoolean(true).comma()
            .withOutput("I").usingCode("'See You!'");
        let bom = ruleSet.generateSampleBOM();
        let engine = new Rulesengine(ruleSet.getRules().rules, bom, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());
        engine.run();
        expect(bom.getValue("I")).to.equals("See You!");
        ruleSet.builder
            .withOutput("I").ifTrueThat("ABoolean");


        bom = ruleSet.generateSampleBOM();
        engine = new Rulesengine(ruleSet.getRules().rules, bom, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());
        engine.run();
        expect(bom.getValue("I")).to.equals("See You!");
        bom = ruleSet.generateSampleBOM();
        bom.setValue("options.ABoolean", false);
        engine = new Rulesengine(ruleSet.getRules().rules, bom, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());
        engine.run();
        expect(bom.getValue("I")).to.equals(undefined);
    });

    it(`Calculating Peekaboo with multiple conditional`, () => {
        const ruleSet = new RuleSet(undefined, {
            inputs: [],
            outputs: [],
            name: "Peekaboo"
        });
        ruleSet.builder
            .withInput("PeekA").asString("BOO").comma()
            .withInput("options.ABoolean").asBoolean(true).comma()
            .withOutput("I").usingCode("'See You!'")
                .ifTrueThat("ABoolean").and()
                .ifTrueThat("PeekA==='BOO'");

        let bom = ruleSet.generateSampleBOM();
        let engine = new Rulesengine(ruleSet.getRules().rules, bom, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());
        engine.run();
        expect(bom.getValue("I")).to.equals("See You!");

        ruleSet.builder
            .withOutput("I");
        bom = ruleSet.generateSampleBOM();
        engine = new Rulesengine(ruleSet.getRules().rules, bom, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());

        engine.run();
        expect(bom.getValue("I")).to.equals("See You!");

        bom = ruleSet.generateSampleBOM();
        bom.setValue("options.ABoolean", false);
        engine = new Rulesengine(ruleSet.getRules().rules, bom, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());
        engine.run({withStats: true});
        // bom.log();
        expect(bom.getValue("I")).to.equals(undefined);
        expect(bom.getValue("engine.Peekaboo.conditions.I_1_ABooleanIsTrue")).to.equals(false);
        expect(bom.getValue("engine.Peekaboo.conditions.I_2_PeekAIsEqualTo_BOO_IsTrue")).to.equals(true);
    });
});
