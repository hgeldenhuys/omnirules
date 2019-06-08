"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var author_1 = require("../src/author");
var rulesengine_1 = require("../src/rulesengine");
exports.eligibleOutput = {
    label: "Eligible",
    name: "Eligible",
    dataType: author_1.DataTypeEnum.Boolean,
    path: "Eligible",
    doc: undefined,
    mockValue: "false",
    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
    code: "Age > 18",
    conditions: [],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};
exports.dtAgeGenderEligibility = {
    name: "Basic Decision Table",
    version: "1",
    purpose: "AgeGenderEligibility",
    inputs: [{
            name: "Age",
            dataType: author_1.DataTypeEnum.Integer,
            path: "Age",
            doc: undefined,
            mockValue: undefined
        }, {
            name: "Gender",
            dataType: author_1.DataTypeEnum.Integer,
            path: "Gender",
            doc: undefined,
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
                    name: "Female"
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
                    name: "Male"
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
                    name: "Default"
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
                    name: "Eligible",
                    dataType: author_1.DataTypeEnum.Boolean,
                    path: "Eligible",
                    doc: undefined,
                    mockValue: "false",
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    code: "Age >= 18",
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
                    name: "Eligible",
                    dataType: author_1.DataTypeEnum.Boolean,
                    path: "Eligible",
                    doc: undefined,
                    mockValue: "false",
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
                    code: "Age >= 21",
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
    label: "YearsToGo",
    name: "YearsToGo",
    dataType: author_1.DataTypeEnum.Integer,
    path: "YearsToGo",
    doc: undefined,
    mockValue: "false",
    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
    code: "result = AgeToRetirement - Age; result = result < 0 ? 0 : result;",
    conditions: [],
    inputMappings: [],
    rawValue: false,
    decisionObject: undefined
};
exports.canRetire = {
    label: "CanRetire",
    name: "CanRetire",
    dataType: author_1.DataTypeEnum.Integer,
    path: "CanRetire",
    doc: undefined,
    mockValue: "false",
    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
    code: "YearsToGo <= 0",
    conditions: [],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};
exports.insuranceEligibility = {
    label: "InsuranceEligibility",
    name: "InsuranceEligibility",
    dataType: author_1.DataTypeEnum.Integer,
    path: "InsuranceEligibility",
    doc: undefined,
    mockValue: "false",
    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
    code: "",
    conditions: [],
    inputMappings: [{ To: "Age", From: "YearsToGo" }, { To: "Gender", From: "'Any'" }],
    rawValue: true,
    decisionObject: exports.dtAgeGenderEligibility
};
exports.offerInsurance = {
    label: "OfferInsurance",
    name: "OfferInsurance",
    dataType: author_1.DataTypeEnum.Boolean,
    path: "Offer.Insurance",
    doc: undefined,
    mockValue: "false",
    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal,
    code: "true",
    conditions: [{
            conditionType: author_1.ConditionTypeEnum.Boolean,
            expression: "CanRetire === true",
            includeTo: false,
            includeFrom: false,
            from: undefined,
            to: undefined,
            number: undefined,
            name: "CannotRetire"
        }],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};
exports.offers = {
    label: "Offers",
    name: "Offers",
    dataType: author_1.DataTypeEnum.List,
    path: "Offers",
    doc: undefined,
    mockValue: "false",
    ruleBehaviour: rulesengine_1.RuleBehaviour.Always,
    code: "result = []; if (getBOMValue(bom, \"OfferInsurance\")) result.push(\"You are eligible for insurance\");",
    conditions: [],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};
exports.dtYearsToRetirement = {
    name: "Years to retirement",
    version: "1",
    inputs: [{
            label: "Age",
            name: "Age",
            dataType: author_1.DataTypeEnum.Integer,
            path: "Age",
            doc: undefined,
            mockValue: undefined
        }, {
            label: "AgeToRetirement",
            name: "AgeToRetirement",
            dataType: author_1.DataTypeEnum.Integer,
            path: "AgeToRetirement",
            doc: undefined,
            mockValue: undefined
        }],
    outputs: [exports.yearsToGo, exports.canRetire, exports.insuranceEligibility, exports.offerInsurance, exports.offers],
    decisionObjectType: author_1.DecisionObjectType.RuleSet
};
//# sourceMappingURL=setup_decisionobject.js.map