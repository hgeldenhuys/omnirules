"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const author_1 = require("../src/author");
describe(`Exceptions`, () => {
    it(`Check Circular Reference`, () => {
        const decisionObjectStructure = {
            name: `Basic`,
            version: '1',
            inputs: [],
            outputs: [{ token: "Calculation1", calculation: "Calculation2", dataType: author_1.DataTypeEnum.String }, { token: "Calculation2", calculation: "Calculation1", dataType: author_1.DataTypeEnum.String }]
        };
        const decisionObject = new author_1.DecisionObject(null, decisionObjectStructure);
        try {
            decisionObject.getRules();
        }
        catch (error) {
            chai_1.expect(error.toString()).contains("[RULE01]");
        }
    });
});
//# sourceMappingURL=test_exceptions.js.map