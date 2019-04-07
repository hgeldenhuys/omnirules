"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var author_1 = require("../src/author");
var rulesengine_1 = require("../src/rulesengine");
var setup_decisiontable_1 = require("./setup_decisiontable");
var decisionTable = new author_1.MultiAxisTable(undefined, setup_decisiontable_1.ageGenderEligibilityParams);
var BOM = { Age: 11, Gender: "Female" };
var engine = new rulesengine_1.Rulesengine(decisionTable.getRules().rules, BOM, decisionTable.name, decisionTable.version, decisionTable.schemaVersion(), decisionTable.getInputNames());
describe("Eligibility: DecisionTable", function () {
    it("11 year old female  = x", function () {
        BOM = { Age: 11, Gender: "Female" };
        engine.reset(BOM).run();
        var result = BOM[setup_decisiontable_1.eligibleOutput.relativePath];
        chai_1.expect(result).to.equal(false);
    });
    it("13 year old male    = x", function () {
        BOM = { Age: 13, Gender: "Male" };
        engine.reset(BOM).run();
        var result = BOM[setup_decisiontable_1.eligibleOutput.relativePath];
        chai_1.expect(result).to.equal(false);
    });
    it("18 year old female  = ✓", function () {
        BOM = { Age: 18, Gender: "Female" };
        engine.reset(BOM).run();
        var result = BOM[setup_decisiontable_1.eligibleOutput.token];
        chai_1.expect(result).to.equal(true);
    });
    it("18 year old male    = x", function () {
        BOM = { Age: 18, Gender: "Male" };
        engine.reset(BOM).run();
        var result = BOM[setup_decisiontable_1.eligibleOutput.relativePath];
        chai_1.expect(result).to.equal(false);
    });
    it("21 year old male    = ✓", function () {
        BOM = { Age: 21, Gender: "Male" };
        engine.reset(BOM).run();
        var result = BOM[setup_decisiontable_1.eligibleOutput.relativePath];
        chai_1.expect(result).to.equal(true);
    });
    it("18 year old them    = x", function () {
        var bom = { Age: 18, Gender: "Unknown" };
        engine.reset(bom).run();
        var result = bom[setup_decisiontable_1.eligibleOutput.relativePath];
        chai_1.expect(result).to.equal(false);
    });
});
describe("DecisionTables: Russian Nesting Dolls", function () {
    var BOM;
    var small = JSON.parse(JSON.stringify(setup_decisiontable_1.russianNestingDoll));
    var middle = JSON.parse(JSON.stringify(setup_decisiontable_1.russianNestingDoll));
    var big = JSON.parse(JSON.stringify(setup_decisiontable_1.russianNestingDoll));
    small.name = "Small";
    small.purpose = "SmallDollTable";
    middle.name = "Middle";
    middle.purpose = "MiddleDollTable";
    var smallTable, middleTable, bigTable;
    it("Small Doll (1 level)", function () {
        BOM = { StartWith: 0, Size: "Small", DollsInsideAndIncludingMe: undefined };
        smallTable = new author_1.MultiAxisTable(undefined, small);
        var engine = new rulesengine_1.Rulesengine(smallTable.getRules().rules, BOM, smallTable.name, smallTable.version, smallTable.schemaVersion(), smallTable.getInputNames());
        engine.run();
        var result = BOM.DollsInsideAndIncludingMe;
        chai_1.expect(result).to.equal(1);
    });
    it("Add Small Doll inside Medium Doll (2 levels)", function () {
        BOM = { StartWith: 0, Size: "Big" };
        middle.outputs.push({
            decisionObject: small,
            inputMappings: [{ To: "StartWith", From: "StartWith" }, { From: "Size", To: "Size" }],
            token: "SmallDoll",
            name: "SmallDoll",
            relativePath: "SmallDoll",
            conditions: [],
            ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
            mockValue: undefined,
            definition: "",
            rawValue: true,
            calculation: "StartWith + 1",
            dataType: author_1.DataTypeEnum.Object
        });
        middle.outputs[0].calculation = "SmallDoll.DollsInsideAndIncludingMe + 1";
    });
    it("Add Medium Doll inside BigDoll (3 levels)", function () {
        big.outputs.push({
            decisionObject: middle,
            inputMappings: [{ To: "StartWith", From: "StartWith" }, { From: "Size", To: "Size" }],
            token: "MediumDoll",
            name: "MediumDollName",
            relativePath: "MediumDollPath",
            conditions: [],
            ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
            mockValue: undefined,
            definition: "",
            rawValue: true,
            calculation: "StartWith + 1",
            dataType: author_1.DataTypeEnum.Object
        });
        big.outputs[0].calculation = "MediumDoll.DollsInsideAndIncludingMe + 1";
    });
    it("Add Big Doll", function () {
        middleTable = new author_1.MultiAxisTable(undefined, middle);
        var sampleBOM = middleTable.generateSampleBOM(true);
        var engine = new rulesengine_1.Rulesengine(middleTable.getRules().rules, sampleBOM, middleTable.name, middleTable.version, middleTable.schemaVersion(), middleTable.getInputNames());
        engine.run();
        chai_1.expect(sampleBOM.SmallDoll.DollsInsideAndIncludingMe).to.equal(2);
        bigTable = new author_1.MultiAxisTable(undefined, big);
    });
    it("Unpack the dolls", function () {
        var engine = new rulesengine_1.Rulesengine(bigTable.getRules().rules, BOM, bigTable.name, bigTable.version, bigTable.schemaVersion(), bigTable.getInputNames());
        engine.run({ withStats: true });
        var result = BOM.DollsInsideAndIncludingMe;
        chai_1.expect(result).to.equal(3);
    });
});
describe("Single-Axis Table", function () {
    it("Vertical Flight", function () {
        var vTable = new author_1.SingleAxisTable(undefined, {
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
                            conditionType: author_1.ConditionTypeEnum.Boolean
                        }, {
                            token: "FlightStatus",
                            expression: "'International'",
                            conditionType: author_1.ConditionTypeEnum.Boolean
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
                            conditionType: author_1.ConditionTypeEnum.Boolean
                        }, {
                            token: "FlightStatus",
                            expression: "'International'",
                            conditionType: author_1.ConditionTypeEnum.Boolean
                        }]
                }
            ],
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
                    dataType: author_1.DataTypeEnum.Enum,
                    enumerationSet: "Level",
                    mockValue: "'Executive'"
                }, {
                    token: "FlightStatus",
                    dataType: author_1.DataTypeEnum.Enum,
                    enumerationSet: "FlightStatus",
                    mockValue: "'International'"
                }],
            outputs: [{
                    token: "SeatUpgrade"
                }, {
                    token: "Points"
                }],
            parentName: "",
            decisionObjectType: author_1.DecisionObjectType.SingleAxisTable,
            purpose: ""
        });
        var sampleBOM = vTable.generateSampleBOM(true);
        var engine = new rulesengine_1.Rulesengine(vTable.getRules().rules, sampleBOM, vTable.name, vTable.version, vTable.schemaVersion(), vTable.getInputNames());
        engine.run({ withStats: true });
        chai_1.expect(sampleBOM.getValue("SeatUpgrade")).to.equal("Approved");
        vTable.getInput("Level").mockValue = "'Manager'";
        sampleBOM = vTable.generateSampleBOM(true);
        engine.reset(sampleBOM).run({ withStats: true });
        chai_1.expect(sampleBOM.getValue("SeatUpgrade")).to.equal("Not Approved");
    });
});
describe("Multi Axis Table Defaults", function () {
    it("4 Defaults on Table, Row, Column and cell", function () {
        var elements = new author_1.MultiAxisTable(undefined, {
            name: "Defaults",
            version: "0.1-in-house",
            purpose: "All Purpose",
            decisionObjectType: author_1.DecisionObjectType.MultiAxisTable,
            ruleContext: {
                name: "Default",
                enumerations: []
            },
            inputs: [],
            outputs: [
                {
                    token: "Earth",
                    dataType: author_1.DataTypeEnum.String,
                    mockValue: "'EARTH'",
                    calculation: "'Earth is read from the Table'"
                },
                {
                    token: "Air",
                    dataType: author_1.DataTypeEnum.String,
                    mockValue: "'AIR'",
                    calculation: "'Table has Air'"
                },
                {
                    token: "Fire",
                    dataType: author_1.DataTypeEnum.String,
                    mockValue: "'FIRE'",
                    calculation: "'Table has Fire'"
                },
                {
                    token: "Water",
                    dataType: author_1.DataTypeEnum.String,
                    mockValue: "'WATER'",
                    calculation: "'Table has Water'"
                }
            ],
            columns: [
                {
                    name: "AlwaysTrue",
                    conditions: [],
                    outputs: [
                        {
                            token: "Fire",
                            dataType: author_1.DataTypeEnum.String,
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
                            dataType: author_1.DataTypeEnum.String,
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
                            dataType: author_1.DataTypeEnum.String,
                            mockValue: "'WATER'",
                            calculation: "'Water is read from Cell'"
                        }
                    ]
                }]
        });
        var BOM = elements.generateSampleBOM();
        var engine = new rulesengine_1.Rulesengine(elements.getRules().rules, BOM, elements.name, elements.version, elements.schemaVersion(), elements.getInputNames());
        engine.run({ withStats: true });
        chai_1.expect(BOM.getValue("Earth")).to.equal("Earth is read from the Table");
        chai_1.expect(BOM.getValue("Air")).to.equal("Air is read from Row");
        chai_1.expect(BOM.getValue("Fire")).to.equal("Fire is read from Column");
        chai_1.expect(BOM.getValue("Water")).to.equal("Water is read from Cell");
    });
});
//# sourceMappingURL=test_decisiontables.js.map