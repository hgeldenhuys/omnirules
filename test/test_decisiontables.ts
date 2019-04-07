import { expect } from "chai";
import "mocha";
import { ConditionTypeEnum, DataTypeEnum, DecisionObjectType, MultiAxisTable, SingleAxisTable } from "../src/author";
import { RuleBehaviour, Rulesengine } from "../src/rulesengine";
import { ageGenderEligibilityParams, eligibleOutput, russianNestingDoll } from "./setup_decisiontable";


const decisionTable = new MultiAxisTable(undefined, ageGenderEligibilityParams);
let BOM = {Age: 11,  Gender: "Female"};
const engine = new Rulesengine(decisionTable.getRules().rules, BOM, decisionTable.name, decisionTable.version, decisionTable.schemaVersion(), decisionTable.getInputNames());

describe(`Eligibility: DecisionTable`, () => {
    it("11 year old female  = x", () => {
        BOM = {Age: 11,  Gender: "Female"};
        engine.reset(BOM).run();
        const result = BOM[eligibleOutput.relativePath];
        expect(result).to.equal(false);
    });

    it("13 year old male    = x", () => {
        BOM = {Age: 13,  Gender: "Male"};
        engine.reset(BOM).run();
        const result = BOM[eligibleOutput.relativePath];
        expect(result).to.equal(false);
    });

    it("18 year old female  = ✓", () => {
        BOM = {Age: 18,  Gender: "Female"};
        engine.reset(BOM).run();
        const result = BOM[eligibleOutput.token];
        expect(result).to.equal(true);
    });

    it("18 year old male    = x", () => {
        BOM = {Age: 18,  Gender: "Male"};
        engine.reset(BOM).run();
        const result = BOM[eligibleOutput.relativePath];
        expect(result).to.equal(false);
    });

    it("21 year old male    = ✓", () => {
        BOM = {Age: 21,  Gender: "Male"};
        engine.reset(BOM).run();
        const result = BOM[eligibleOutput.relativePath];
        expect(result).to.equal(true);
    });

    it(`18 year old them    = x`, () => {
        const bom = {Age: 18,  Gender: "Unknown"};
        engine.reset(bom).run();
        const result = bom[eligibleOutput.relativePath];
        expect(result).to.equal(false);
    });
});

describe(`DecisionTables: Russian Nesting Dolls`, () => {
    let BOM;
    const small = JSON.parse(JSON.stringify(russianNestingDoll));
    const middle = JSON.parse(JSON.stringify(russianNestingDoll));
    const big = JSON.parse(JSON.stringify(russianNestingDoll));
    small.name = `Small`;
    small.purpose = `SmallDollTable`;
    middle.name = `Middle`;
    middle.purpose = `MiddleDollTable`;

    let smallTable, middleTable, bigTable;

    it(`Small Doll (1 level)`, () => {
        BOM = {StartWith: 0, Size: "Small", DollsInsideAndIncludingMe: undefined};

        smallTable = new MultiAxisTable(undefined, small);
        const engine = new Rulesengine(smallTable.getRules().rules, BOM, smallTable.name, smallTable.version, smallTable.schemaVersion(), smallTable.getInputNames());

        engine.run();
        const result = BOM.DollsInsideAndIncludingMe;
        expect(result).to.equal(1);
    });

    it(`Add Small Doll inside Medium Doll (2 levels)`, () => {
        BOM = {StartWith: 0, Size: "Big"};
        // Add Small Doll Inside Medium doll
        middle.outputs.push({
            decisionObject: small,
            inputMappings: [{To: "StartWith", From: "StartWith"}, {From: "Size", To: "Size"}],
            token: "SmallDoll",
            name: "SmallDoll",
            relativePath: "SmallDoll",
            conditions: [],
            ruleBehaviour: RuleBehaviour.Normal,
            mockValue: undefined,
            definition: "",
            rawValue: true,
            calculation: "StartWith + 1",
            dataType: DataTypeEnum.Object
        });
        // Small Doll
        middle.outputs[0].calculation = "SmallDoll.DollsInsideAndIncludingMe + 1";
    });

    it(`Add Medium Doll inside BigDoll (3 levels)`, () => {
        big.outputs.push({
            decisionObject: middle,
            inputMappings: [{To: "StartWith", From: "StartWith"}, {From: "Size", To: "Size"}],
            token: "MediumDoll",
            name: "MediumDollName",
            relativePath: "MediumDollPath",
            conditions: [],
            ruleBehaviour: RuleBehaviour.Normal,
            mockValue: undefined,
            definition: "",
            rawValue: true,
            calculation: "StartWith + 1",
            dataType: DataTypeEnum.Object
        });
        big.outputs[0].calculation = "MediumDoll.DollsInsideAndIncludingMe + 1";
    });

    it(`Add Big Doll`, () => {
        middleTable = new MultiAxisTable(undefined, middle);
        const sampleBOM = middleTable.generateSampleBOM(true);
        const engine = new Rulesengine(middleTable.getRules().rules, sampleBOM, middleTable.name, middleTable.version, middleTable.schemaVersion(), middleTable.getInputNames());
        engine.run();
        expect(sampleBOM.SmallDoll.DollsInsideAndIncludingMe).to.equal(2);
        bigTable = new MultiAxisTable(undefined, big);
    });

    it(`Unpack the dolls`, () => {
        const engine = new Rulesengine(bigTable.getRules().rules, BOM, bigTable.name, bigTable.version, bigTable.schemaVersion(), bigTable.getInputNames());
        engine.run({withStats: true});
        const result = BOM.DollsInsideAndIncludingMe;
        expect(result).to.equal(3);
    });
});

describe(`Single-Axis Table`, () => {
    it(`Vertical Flight`, () => {
        const vTable = new SingleAxisTable(undefined, {
            entries: [
                {
                    name: "",
                    outputs: [{
                        token: "SeatUpgrade",
                        calculation: "'Approved'"
                    }, {
                        token: "Points",
                        calculation: "100"
                    }],
                    conditions: [{
                        token: "Level",
                        expression: "'Executive'",
                        conditionType: ConditionTypeEnum.Boolean
                    }, {
                        token: "FlightStatus",
                        expression: "'International'",
                        conditionType: ConditionTypeEnum.Boolean
                    }]
                },
                {
                    name: "",
                    outputs: [{
                        token: "SeatUpgrade",
                        calculation: "'Not Approved'"
                    }, {
                        token: "Points",
                        calculation: "50"
                    }],
                    conditions: [{
                        token: "Level",
                        expression: "'Manager'",
                        conditionType: ConditionTypeEnum.Boolean
                    }, {
                        token: "FlightStatus",
                        expression: "'International'",
                        conditionType: ConditionTypeEnum.Boolean
                    }]
                }],
            version: "1",
            ruleContext: {
                name: "Testing",
                enumerations: [{
                    name: "Level",
                    values: [{
                        value: "Executive"
                    }, {
                        value: "Manager"
                    }]
                }, {
                    name: "FlightStatus",
                    values: [{
                        value: "International"
                    }, {
                        value: "Domestic"
                    }]
                }]
            },
            name: "VTable",
            inputs: [{
                token: "Level",
                dataType: DataTypeEnum.Enum,
                enumerationSet: "Level",
                mockValue: "'Executive'"
            }, {
                token: "FlightStatus",
                dataType: DataTypeEnum.Enum,
                enumerationSet: "FlightStatus",
                mockValue: "'International'"
            }],
            outputs: [{
                token: "SeatUpgrade"
            }, {
                token: "Points"
            }],
            parentName: "",
            decisionObjectType: DecisionObjectType.SingleAxisTable,
            purpose: ""
        });
        let sampleBOM = vTable.generateSampleBOM(true);

        const engine = new Rulesengine(vTable.getRules().rules, sampleBOM, vTable.name, vTable.version, vTable.schemaVersion(), vTable.getInputNames());
        engine.run({withStats: true});
        expect(sampleBOM.getValue("SeatUpgrade")).to.equal("Approved");

        vTable.getInput("Level").mockValue = "'Manager'";
        sampleBOM = vTable.generateSampleBOM(true);
        engine.reset(sampleBOM).run({withStats: true});

        expect(sampleBOM.getValue("SeatUpgrade")).to.equal("Not Approved");
    });
});

describe(`Multi Axis Table Defaults`, () => {
    it(`4 Defaults on Table, Row, Column and cell`, () => {

        const elements = new MultiAxisTable(undefined, {
            name: "Defaults",
            version: "0.1-in-house",
            purpose: "All Purpose",
            decisionObjectType: DecisionObjectType.MultiAxisTable,
            ruleContext: {
                name: "Default",
                enumerations: []
            },
            inputs: [],
            outputs: [
                {
                    token: "Earth",
                    dataType: DataTypeEnum.String,
                    mockValue: "'EARTH'",
                    calculation: "'Earth is read from the Table'"
                },
                {
                    token: "Air",
                    dataType: DataTypeEnum.String,
                    mockValue: "'AIR'",
                    calculation: "'Table has Air'"
                },
                {
                    token: "Fire",
                    dataType: DataTypeEnum.String,
                    mockValue: "'FIRE'",
                    calculation: "'Table has Fire'"
                },
                {
                    token: "Water",
                    dataType: DataTypeEnum.String,
                    mockValue: "'WATER'",
                    calculation: "'Table has Water'"
                }],
            columns: [
                {
                    name: "AlwaysTrue",
                    conditions: [],
                    outputs: [
                        {
                            token: "Fire",
                            dataType: DataTypeEnum.String,
                            mockValue: "'FIRE'",
                            calculation: "'Fire is read from Column'"
                        }
                    ]
                }
            ],
            rows: [
                {
                    name: "AlwaysTrue",
                    conditions: [],
                    outputs: [{
                        token: "Air",
                        dataType: DataTypeEnum.String,
                        mockValue: "'AIR'",
                        calculation: "'Air is read from Row'"
                    }]
                }
            ],
            cells: [{
                columnNumber: 1,
                rowNumber: 1,
                outputs: [
                    {
                        token: "Water",
                        dataType: DataTypeEnum.String,
                        mockValue: "'WATER'",
                        calculation: "'Water is read from Cell'"
                    }
                ]
            }]
        });
        const BOM = elements.generateSampleBOM();
        const engine = new Rulesengine(elements.getRules().rules, BOM, elements.name, elements.version, elements.schemaVersion(), elements.getInputNames());

        engine.run({withStats: true});

        expect(BOM.getValue("Earth")).to.equal("Earth is read from the Table");
        expect(BOM.getValue("Air")).to.equal("Air is read from Row");
        expect(BOM.getValue("Fire")).to.equal("Fire is read from Column");
        expect(BOM.getValue("Water")).to.equal("Water is read from Cell");
    });
});