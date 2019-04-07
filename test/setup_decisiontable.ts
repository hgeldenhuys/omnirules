import {
    ConditionTypeEnum,
    DataTypeEnum,
    DecisionObjectType
} from "../src/author";
import { RuleBehaviour } from "../src/rulesengine";


// === Eligibility

export const eligibleOutput = {
    name: `Eligible`,
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

export const ageGenderEligibilityParams = {
    name: `Basic Decision Table`,
    version: "1",
    purpose: "CHeck Age Gender Eligibility",
    inputs: [{
        token: `Age`,
        dataType: DataTypeEnum.Integer,
    }, {
        token: `Gender`,
        dataType: DataTypeEnum.Integer
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
    cells: [{
        columnNumber: 1,
        rowNumber: 1,
        outputs: [{
            name: `Eligible`,
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
    }, {
        columnNumber: 2,
        rowNumber: 1,
        outputs: [{
            name: `Eligible`,
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


export const russianNestingDoll = {
    name: `Russian Nesting Doll`,
    rootName: `bom`,
    version: "1",
    purpose: "Please define",
    inputs: [{
        name: `StartWith`,
        token: `StartWith`,
        dataType: DataTypeEnum.Integer,
        relativePath: `StartWith`,
        definition: undefined,
        mockValue: "1"
    }, {
        name: `Size`,
        token: `Size`,
        dataType: DataTypeEnum.Enum,
        relativePath: `Size`,
        definition: undefined,
        mockValue: '"Small"'
    }],
    outputs: [{
        name: `DollsInsideAndIncludingMe`,
        token: `DollsInsideAndIncludingMe`,
        dataType: DataTypeEnum.Integer,
        relativePath: `DollsInsideAndIncludingMe`,
        definition: undefined,
        mockValue: `1`,
        ruleBehaviour: RuleBehaviour.Normal,
        calculation: `StartWith + 1`,
        conditions: [],
        inputMappings: [],
        rawValue: true,
        decisionObject: undefined
    }, {
        name: `Inside`,
        token: `Inside`,
        dataType: DataTypeEnum.Integer,
        relativePath: `Inside`,
        definition: undefined,
        mockValue: `"Nothing. I'm on the outside!"`,
        ruleBehaviour: RuleBehaviour.Normal,
        calculation: `"Nothing. I'm on the outside!"`,
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
    decisionObjectType: DecisionObjectType.MultiAxisTable
};
