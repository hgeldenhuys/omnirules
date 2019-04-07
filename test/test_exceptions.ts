import {expect} from 'chai';
import 'mocha';
import {DataTypeEnum, DecisionObject, RuleSet} from "../src/author";
import {jlog, Rulesengine} from "../src/rulesengine";

describe(`Exceptions`, () => {

    it(`Check Circular Reference`, () => {
        const decisionObjectStructure = {
            name: `Basic`,
            version: '1',
            inputs: [],
            outputs: [{token: "Calculation1", calculation: "Calculation2", dataType: DataTypeEnum.String}, {token: "Calculation2", calculation: "Calculation1", dataType: DataTypeEnum.String}]
        };
        const decisionObject = new DecisionObject(null, decisionObjectStructure);
        try {
            decisionObject.getRules();
        } catch (error) {
            expect(error.toString()).contains("[RULE01]");
        }
    });
});
