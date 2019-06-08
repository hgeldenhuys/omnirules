import {
    ConditionTypeEnum,
    DataTypeEnum,
    DecisionObjectType
} from "../src/author";
import { RuleBehaviour } from "../src/rulesengine";


// === Eligibility

export const eligibleOutput = {
    name: `Eligible`,
    dataType: DataTypeEnum.Boolean,
    path: `Eligible`,
    definition: undefined,
    mockValue: `false`,
    ruleBehaviour: RuleBehaviour.Normal,
    code: `Age > 18`,
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
        name: `Age`,
        dataType: DataTypeEnum.Integer,
    }, {
        name: `Gender`,
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
    cells: [{
        columnNumber: 1,
        rowNumber: 1,
        outputs: [{
            name: `Eligible`,
            dataType: DataTypeEnum.Boolean,
            path: `Eligible`,
            definition: undefined,
            mockValue: `false`,
            ruleBehaviour: RuleBehaviour.Normal,
            code: `Age >= 18`,
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
            dataType: DataTypeEnum.Boolean,
            path: `Eligible`,
            definition: undefined,
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


export const russianNestingDoll = {
    name: `Russian Nesting Doll`,
    rootName: `bom`,
    version: "1",
    purpose: "Please define",
    inputs: [{
        name: `StartWith`,
        dataType: DataTypeEnum.Integer,
        path: `StartWith`,
        definition: undefined,
        mockValue: "1"
    }, {
        name: `Size`,
        dataType: DataTypeEnum.Enum,
        path: `Size`,
        definition: undefined,
        mockValue: '"Small"'
    }],
    outputs: [{
        name: `DollsInsideAndIncludingMe`,
        dataType: DataTypeEnum.Integer,
        path: `DollsInsideAndIncludingMe`,
        definition: undefined,
        mockValue: `1`,
        ruleBehaviour: RuleBehaviour.Normal,
        code: `StartWith + 1`,
        conditions: [],
        inputMappings: [],
        rawValue: true,
        decisionObject: undefined
    }, {
        name: `Inside`,
        dataType: DataTypeEnum.Integer,
        path: `Inside`,
        definition: undefined,
        mockValue: `"Nothing. I'm on the outside!"`,
        ruleBehaviour: RuleBehaviour.Normal,
        code: `"Nothing. I'm on the outside!"`,
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
