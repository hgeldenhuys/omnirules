"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var author_1 = require("../src/author");
describe("Exceptions", function () {
    it("Check Circular Reference", function () {
        var decisionObjectStructure = {
            name: "Basic",
            version: "1",
            inputs: [],
            outputs: [{ name: "Calculation1", code: "Calculation2", dataType: author_1.DataTypeEnum.String }, { name: "Calculation2", code: "Calculation1", dataType: author_1.DataTypeEnum.String }]
        };
        var decisionObject = new author_1.DecisionObject(null, decisionObjectStructure);
        try {
            decisionObject.getRules();
        }
        catch (error) {
            chai_1.expect(error.toString()).contains("[RULE01]");
        }
    });
});
//# sourceMappingURL=test_exceptions.js.map