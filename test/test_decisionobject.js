"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
require("mocha");
var author_1 = require("../src/author");
var rulesengine_1 = require("../src/rulesengine");
var setup_decisionobject_1 = require("./setup_decisionobject");
var RETIREMENT_AGE = 60;
var BOM = {
    Age: 50,
    AgeToRetirement: RETIREMENT_AGE
};
var decisionObject = new author_1.DecisionObject(undefined, setup_decisionobject_1.dtYearsToRetirement);
var engine = new rulesengine_1.Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());
describe("Retirement: DecisionObject", function () {
    it("10 years to go if retirement age is " + RETIREMENT_AGE, function () {
        BOM = { Age: 50, AgeToRetirement: RETIREMENT_AGE };
        engine.withBom(BOM).run();
        var result = BOM[setup_decisionobject_1.yearsToGo.path];
        chai_1.expect(result).to.equal(10);
    });
    it("Can retire, at last at 61", function () {
        BOM = { Age: 61, AgeToRetirement: RETIREMENT_AGE };
        engine.withBom(BOM).run({ withStats: true });
        var result = BOM[setup_decisionobject_1.canRetire.path];
        chai_1.expect(result).to.equal(true);
    });
});
//# sourceMappingURL=test_decisionobject.js.map