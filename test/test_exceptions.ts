import { expect } from "chai";
import "mocha";
import { DataTypeEnum, DecisionObject, RuleSet } from "../src/author";

describe(`Exceptions`, () => {

    it(`Check Circular Reference`, () => {
        const decisionObjectStructure = {
            name: `Basic`,
            version: "1",
            inputs: [],
            outputs: [{name: "Calculation1", code: "Calculation2", dataType: DataTypeEnum.String}, {name: "Calculation2", code: "Calculation1", dataType: DataTypeEnum.String}]
        };
        const decisionObject = new DecisionObject(null, decisionObjectStructure);
        try {
            decisionObject.getRules();
        } catch (error) {
            expect(error.toString()).contains("[RULE01]");
        }
    });
});
