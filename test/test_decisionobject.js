"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("mocha");
const author_1 = require("../src/author");
const rulesengine_1 = require("../src/rulesengine");
const setup_decisionobject_1 = require("./setup_decisionobject");
const RETIREMENT_AGE = 60;
let BOM = {
    Age: 50,
    AgeToRetirement: RETIREMENT_AGE
};
const decisionObject = new author_1.DecisionObject(null, setup_decisionobject_1.dtYearsToRetirement);
const engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
describe(`Retirement: DecisionObject`, () => {
    it(`10 years to go if retirement age is ${RETIREMENT_AGE}`, () => {
        BOM = { Age: 50, AgeToRetirement: RETIREMENT_AGE };
        engine.reset(BOM).run();
        const result = BOM[setup_decisionobject_1.yearsToGo.relativePath];
        chai_1.expect(result).to.equal(10);
    });
    it("Can retire, at last at 61", () => {
        BOM = { Age: 61, AgeToRetirement: RETIREMENT_AGE };
        engine.reset(BOM).run({ withStats: true });
        const result = BOM[setup_decisionobject_1.canRetire.relativePath];
        chai_1.expect(result).to.equal(true);
    });
});
//# sourceMappingURL=test_decisionobject.js.map