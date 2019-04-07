"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var author_1 = require("../src/author");
var rulesengine_1 = require("../src/rulesengine");
exports.eligibleOutput = {
    name: "Eligible",
    token: "Eligible",
    dataType: author_1.DataTypeEnum.Boolean,
    relativePath: "Eligible",
    definition: undefined,
    mockValue: "false",
    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
    calculation: "Age > 18",
    conditions: [],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};
exports.ageGenderEligibilityParams = {
    name: "Basic Decision Table",
    version: "1",
    purpose: "CHeck Age Gender Eligibility",
    inputs: [{
            token: "Age",
            dataType: author_1.DataTypeEnum.Integer,
        }, {
            token: "Gender",
            dataType: author_1.DataTypeEnum.Integer
        }],
    outputs: [exports.eligibleOutput],
    columns: [{
            name: "Female",
            conditions: [{
                    conditionType: author_1.ConditionTypeEnum.Boolean,
                    expression: "Gender === 'Female'",
                    from: undefined,
                    to: undefined,
                    number: undefined,
                    includeFrom: false,
                    includeTo: false,
                    token: "Female"
                }],
            outputs: []
        }, {
            name: "Male",
            conditions: [{
                    conditionType: author_1.ConditionTypeEnum.Boolean,
                    expression: "Gender === 'Male'",
                    from: undefined,
                    to: undefined,
                    number: undefined,
                    includeFrom: false,
                    includeTo: false,
                    token: "Male"
                }],
            outputs: []
        }, {
            name: "Default",
            conditions: [{
                    conditionType: author_1.ConditionTypeEnum.Boolean,
                    expression: "true",
                    from: undefined,
                    to: undefined,
                    number: undefined,
                    includeFrom: false,
                    includeTo: false,
                    token: "Default"
                }],
            outputs: []
        }],
    rows: [{
            name: "Default",
            conditions: [],
            outputs: []
        }],
    cells: [{
            columnNumber: 1,
            rowNumber: 1,
            outputs: [{
                    name: "Eligible",
                    token: "Eligible",
                    dataType: author_1.DataTypeEnum.Boolean,
                    relativePath: "Eligible",
                    definition: undefined,
                    mockValue: "false",
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    calculation: "Age >= 18",
                    conditions: [],
                    inputMappings: [],
                    rawValue: true,
                    decisionObject: undefined
                }]
        }, {
            columnNumber: 2,
            rowNumber: 1,
            outputs: [{
                    name: "Eligible",
                    token: "Eligible",
                    dataType: author_1.DataTypeEnum.Boolean,
                    relativePath: "Eligible",
                    definition: undefined,
                    mockValue: "false",
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    calculation: "Age >= 21",
                    conditions: [],
                    inputMappings: [],
                    rawValue: true,
                    decisionObject: undefined
                }]
        }],
    decisionObjectType: author_1.DecisionObjectType.MultiAxisTable
};
exports.russianNestingDoll = {
    name: "Russian Nesting Doll",
    rootName: "bom",
    version: "1",
    purpose: "Please define",
    inputs: [{
            name: "StartWith",
            token: "StartWith",
            dataType: author_1.DataTypeEnum.Integer,
            relativePath: "StartWith",
            definition: undefined,
            mockValue: "1"
        }, {
            name: "Size",
            token: "Size",
            dataType: author_1.DataTypeEnum.Enum,
            relativePath: "Size",
            definition: undefined,
            mockValue: '"Small"'
        }],
    outputs: [{
            name: "DollsInsideAndIncludingMe",
            token: "DollsInsideAndIncludingMe",
            dataType: author_1.DataTypeEnum.Integer,
            relativePath: "DollsInsideAndIncludingMe",
            definition: undefined,
            mockValue: "1",
            ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
            calculation: "StartWith + 1",
            conditions: [],
            inputMappings: [],
            rawValue: true,
            decisionObject: undefined
        }, {
            name: "Inside",
            token: "Inside",
            dataType: author_1.DataTypeEnum.Integer,
            relativePath: "Inside",
            definition: undefined,
            mockValue: "\"Nothing. I'm on the outside!\"",
            ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
            calculation: "\"Nothing. I'm on the outside!\"",
            conditions: [],
            inputMappings: [],
            rawValue: true,
            decisionObject: undefined
        }],
    columns: [{
            name: "Default",
            conditions: [],
            outputs: []
        }],
    rows: [{
            name: "Default",
            conditions: [],
            outputs: []
        }],
    cells: [],
    decisionObjectType: author_1.DecisionObjectType.MultiAxisTable
};
//# sourceMappingURL=setup_decisiontable.js.map