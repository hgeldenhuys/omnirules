import {
    ConditionTypeEnum,
    DataTypeEnum,
    IDecisionObject,
    DecisionObjectType,
    IFact,
    IMultiAxisTable
} from "../src/author";
import { RuleBehaviour } from "../src/rulesengine";

// === Eligibility

export const eligibleOutput: IFact = {
    label: `Eligible`,
    name: `Eligible`,
    dataType: DataTypeEnum.Boolean,
    path: `Eligible`,
    doc: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Normal,
    code: `Age > 18`,
    conditions: [],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};

export const dtAgeGenderEligibility: IMultiAxisTable = {
    name: `Basic Decision Table`,
    version: "1",
    purpose: "AgeGenderEligibility",
    inputs: [{
        name: `Age`,
        dataType: DataTypeEnum.Integer,
        path: `Age`,
        doc: undefined,
        mockValue: undefined
    }, {
        name: `Gender`,
        dataType: DataTypeEnum.Integer,
        path: `Gender`,
        doc: undefined,
        mockValue: undefined
    }],
    outputs: [eligibleOutput],
    columns: [{
        name: "Female",
        conditions: [{
            conditionType: ConditionTypeEnum.Boolean,
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
            conditionType: ConditionTypeEnum.Boolean,
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
            conditionType: ConditionTypeEnum.Boolean,
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
                name: `Eligible`,
                dataType: DataTypeEnum.Boolean,
                path: `Eligible`,
                doc: undefined,
                mockValue: `false`,
                ruleBehaviour: RuleBehaviour.Normal,
                code: `Age >= 18`,
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
            name: `Eligible`,
            dataType: DataTypeEnum.Boolean,
            path: `Eligible`,
            doc: undefined,
            mockValue: `false`,
            ruleBehaviour: RuleBehaviour.Normal,
            code: `Age >= 21`,
            conditions: [],
            inputMappings: [],
            rawValue: true,
            decisionObject: undefined
        }]
    }],
    decisionObjectType: DecisionObjectType.MultiAxisTable
};


// === Retirement

// ToDo: Remove RawValues, they don't make sense
// ToDo: Remove decisionObject, try picking them up from the code. Make it implicit instead of explicit

export const yearsToGo: IFact = {
    label: `YearsToGo`,
    name: `YearsToGo`,
    dataType: DataTypeEnum.Integer,
    path: `YearsToGo`,
    doc: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Normal,
    code: `result = AgeToRetirement - Age; result = result < 0 ? 0 : result;`,
    conditions: [],
    inputMappings: [],
    rawValue: false,
    decisionObject: undefined
};


export const canRetire: IFact = {
    label: `CanRetire`,
    name: `CanRetire`,
    dataType: DataTypeEnum.Integer,
    path: `CanRetire`,
    doc: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Normal,
    code: `YearsToGo <= 0`,
    conditions: [],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};

export const insuranceEligibility: IFact = {
    label: `InsuranceEligibility`,
    name: `InsuranceEligibility`,
    dataType: DataTypeEnum.Integer,
    path: `InsuranceEligibility`,
    doc: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Normal,
    code: ``,
    conditions: [],
    inputMappings: [{To: "Age", From: "YearsToGo"}, {To: "Gender", From: "'Any'"}],
    rawValue: true,
    decisionObject: dtAgeGenderEligibility
};

export const offerInsurance: IFact = {
    label: `OfferInsurance`,
    name: `OfferInsurance`,
    dataType: DataTypeEnum.Boolean,
    path: `Offer.Insurance`,
    doc: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Normal,
    code: `true`,
    conditions: [{
        conditionType: ConditionTypeEnum.Boolean,
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


export const offers: IFact = {
    label: `Offers`,
    name: `Offers`,
    dataType: DataTypeEnum.List,
    path: `Offers`,
    doc: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Always,
    code: `result = []; if (getBOMValue(bom, "OfferInsurance")) result.push("You are eligible for insurance");`,
    conditions: [],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};

export const dtYearsToRetirement: IDecisionObject = {
    name: `Years to retirement`,
    version: "1",
    inputs: [{
        label: `Age`,
        name: `Age`,
        dataType: DataTypeEnum.Integer,
        path: `Age`,
        doc: undefined,
        mockValue: undefined
    }, {
        label: `AgeToRetirement`,
        name: `AgeToRetirement`,
        dataType: DataTypeEnum.Integer,
        path: `AgeToRetirement`,
        doc: undefined,
        mockValue: undefined
    }],
    outputs: [yearsToGo, canRetire, insuranceEligibility, offerInsurance, offers],
    decisionObjectType: DecisionObjectType.RuleSet
};
