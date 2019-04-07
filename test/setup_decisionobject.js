"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const author_1 = require("../src/author");
const rulesengine_1 = require("../src/rulesengine");
exports.eligibleOutput = {
    label: `Eligible`,
    token: `Eligible`,
    dataType: author_1.DataTypeEnum.Boolean,
    relativePath: `Eligible`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
    calculation: `Age > 18`,
    conditions: [],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};
exports.dtAgeGenderEligibility = {
    name: `Basic Decision Table`,
    version: "1",
    purpose: "AgeGenderEligibility",
    inputs: [{
            token: `Age`,
            dataType: author_1.DataTypeEnum.Integer,
            relativePath: `Age`,
            definition: undefined,
            mockValue: undefined
        }, {
            token: `Gender`,
            dataType: author_1.DataTypeEnum.Integer,
            relativePath: `Gender`,
            definition: undefined,
            mockValue: undefined
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
    cells: [
        {
            columnNumber: 1,
            rowNumber: 1,
            outputs: [{
                    token: `Eligible`,
                    dataType: author_1.DataTypeEnum.Boolean,
                    relativePath: `Eligible`,
                    definition: undefined,
                    mockValue: `false`,
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    calculation: `Age >= 18`,
                    conditions: [],
                    inputMappings: [],
                    rawValue: true,
                    decisionObject: undefined
                }]
        },
        {
            columnNumber: 2,
            rowNumber: 1,
            outputs: [{
                    token: `Eligible`,
                    dataType: author_1.DataTypeEnum.Boolean,
                    relativePath: `Eligible`,
                    definition: undefined,
                    mockValue: `false`,
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    calculation: `Age >= 21`,
                    conditions: [],
                    inputMappings: [],
                    rawValue: true,
                    decisionObject: undefined
                }]
        }
    ],
    decisionObjectType: author_1.DecisionObjectType.MultiAxisTable
};
exports.yearsToGo = {
    label: `YearsToGo`,
    token: `YearsToGo`,
    dataType: author_1.DataTypeEnum.Integer,
    relativePath: `YearsToGo`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
    calculation: `result = AgeToRetirement - Age; result = result < 0 ? 0 : result;`,
    conditions: [],
    inputMappings: [],
    rawValue: false,
    decisionObject: undefined
};
exports.canRetire = {
    label: `CanRetire`,
    token: `CanRetire`,
    dataType: author_1.DataTypeEnum.Integer,
    relativePath: `CanRetire`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
    calculation: `YearsToGo <= 0`,
    conditions: [],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};
exports.insuranceEligibility = {
    label: `InsuranceEligibility`,
    token: `InsuranceEligibility`,
    dataType: author_1.DataTypeEnum.Integer,
    relativePath: `InsuranceEligibility`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
    calculation: ``,
    conditions: [],
    inputMappings: [{ To: "Age", From: "YearsToGo" }, { To: "Gender", From: "'Unknown'" }],
    rawValue: true,
    decisionObject: exports.dtAgeGenderEligibility
};
exports.offerInsurance = {
    label: `OfferInsurance`,
    token: `OfferInsurance`,
    dataType: author_1.DataTypeEnum.Boolean,
    relativePath: `Offer.Insurance`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
    calculation: `true`,
    conditions: [{
            conditionType: author_1.ConditionTypeEnum.Boolean,
            expression: "CanRetire === true",
            includeTo: false,
            includeFrom: false,
            from: undefined,
            to: undefined,
            number: undefined,
            token: "CannotRetire"
        }],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};
exports.offers = {
    label: `Offers`,
    token: `Offers`,
    dataType: author_1.DataTypeEnum.List,
    relativePath: `Offers`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: rulesengine_1.RuleBehaviour.Always,
    calculation: `result = []; if (getBOMValue(bom, "OfferInsurance")) result.push("You are eligible for insurance");`,
    conditions: [],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};
exports.dtYearsToRetirement = {
    name: `Years to retirement`,
    version: "1",
    inputs: [{
            label: `Age`,
            token: `Age`,
            dataType: author_1.DataTypeEnum.Integer,
            relativePath: `Age`,
            definition: undefined,
            mockValue: undefined
        }, {
            label: `AgeToRetirement`,
            token: `AgeToRetirement`,
            dataType: author_1.DataTypeEnum.Integer,
            relativePath: `AgeToRetirement`,
            definition: undefined,
            mockValue: undefined
        }],
    outputs: [exports.yearsToGo, exports.canRetire, exports.insuranceEligibility, exports.offerInsurance, exports.offers],
    decisionObjectType: author_1.DecisionObjectType.RuleSet
};
//# sourceMappingURL=setup_decisionobject.js.map