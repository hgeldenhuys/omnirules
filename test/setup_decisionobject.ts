import {
    ConditionTypeEnum,
    DataTypeEnum,
    IDecisionObject,
    DecisionObjectType,
    IOutput,
    IMultiAxisTable
} from "../src/author";
import { RuleBehaviour } from "../src/rulesengine";

// === Eligibility

export const eligibleOutput: IOutput = {
    label: `Eligible`,
    token: `Eligible`,
    dataType: DataTypeEnum.Boolean,
    relativePath: `Eligible`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Normal,
    calculation: `Age > 18`,
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
        token: `Age`,
        dataType: DataTypeEnum.Integer,
        relativePath: `Age`,
        definition: undefined,
        mockValue: undefined
    }, {
        token: `Gender`,
        dataType: DataTypeEnum.Integer,
        relativePath: `Gender`,
        definition: undefined,
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
            token: "Female"
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
            token: "Male"
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
                dataType: DataTypeEnum.Boolean,
                relativePath: `Eligible`,
                definition: undefined,
                mockValue: `false`,
                ruleBehaviour: RuleBehaviour.Normal,
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
            dataType: DataTypeEnum.Boolean,
            relativePath: `Eligible`,
            definition: undefined,
            mockValue: `false`,
            ruleBehaviour: RuleBehaviour.Normal,
            calculation: `Age >= 21`,
            conditions: [],
            inputMappings: [],
            rawValue: true,
            decisionObject: undefined
        }]
    }],
    decisionObjectType: DecisionObjectType.MultiAxisTable
};


// === Retirement


export const yearsToGo: IOutput = {
    label: `YearsToGo`,
    token: `YearsToGo`,
    dataType: DataTypeEnum.Integer,
    relativePath: `YearsToGo`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Normal,
    calculation: `result = AgeToRetirement - Age; result = result < 0 ? 0 : result;`,
    conditions: [],
    inputMappings: [],
    rawValue: false,
    decisionObject: undefined
};


export const canRetire: IOutput = {
    label: `CanRetire`,
    token: `CanRetire`,
    dataType: DataTypeEnum.Integer,
    relativePath: `CanRetire`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Normal,
    calculation: `YearsToGo <= 0`,
    conditions: [],
    inputMappings: [],
    rawValue: true,
    decisionObject: undefined
};

export const insuranceEligibility: IOutput = {
    label: `InsuranceEligibility`,
    token: `InsuranceEligibility`,
    dataType: DataTypeEnum.Integer,
    relativePath: `InsuranceEligibility`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Normal,
    calculation: ``,
    conditions: [],
    inputMappings: [{To: "Age", From: "YearsToGo"}, {To: "Gender", From: "'Unknown'"}],
    rawValue: true,
    decisionObject: dtAgeGenderEligibility
};

export const offerInsurance: IOutput = {
    label: `OfferInsurance`,
    token: `OfferInsurance`,
    dataType: DataTypeEnum.Boolean,
    relativePath: `Offer.Insurance`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Normal,
    calculation: `true`,
    conditions: [{
        conditionType: ConditionTypeEnum.Boolean,
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


export const offers: IOutput = {
    label: `Offers`,
    token: `Offers`,
    dataType: DataTypeEnum.List,
    relativePath: `Offers`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Always,
    calculation: `result = []; if (getBOMValue(bom, "OfferInsurance")) result.push("You are eligible for insurance");`,
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
        token: `Age`,
        dataType: DataTypeEnum.Integer,
        relativePath: `Age`,
        definition: undefined,
        mockValue: undefined
    }, {
        label: `AgeToRetirement`,
        token: `AgeToRetirement`,
        dataType: DataTypeEnum.Integer,
        relativePath: `AgeToRetirement`,
        definition: undefined,
        mockValue: undefined
    }],
    outputs: [yearsToGo, canRetire, insuranceEligibility, offerInsurance, offers],
    decisionObjectType: DecisionObjectType.RuleSet
};
