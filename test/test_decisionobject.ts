import { expect } from "chai";
import "mocha";
import { DecisionObject } from "../src/author";
import { jlog, Rulesengine } from "../src/rulesengine";
import { canRetire, dtYearsToRetirement, yearsToGo } from "./setup_decisionobject";

const RETIREMENT_AGE = 60;
let BOM = {
    Age: 50,
    AgeToRetirement: RETIREMENT_AGE
};

const decisionObject = new DecisionObject(null, dtYearsToRetirement);
const engine = new Rulesengine(decisionObject.getRules().rules, BOM, decisionObject.name, decisionObject.version, decisionObject.schemaVersion(), decisionObject.getInputNames());

describe(`Retirement: DecisionObject`, () => {
    it(`10 years to go if retirement age is ${RETIREMENT_AGE}`, () => {
        BOM = {Age: 50, AgeToRetirement: RETIREMENT_AGE};
        engine.reset(BOM).run();
        const result = BOM[yearsToGo.relativePath];
        expect(result).to.equal(10);
    });
    it("Can retire, at last at 61", () => {
        BOM = {Age: 61, AgeToRetirement: RETIREMENT_AGE};
        engine.reset(BOM).run({withStats: true});
        const result = BOM[canRetire.relativePath];
        expect(result).to.equal(true);
    });
});
