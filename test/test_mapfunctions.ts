import { expect } from "chai";
import "mocha";
import { DataTypeEnum, DecisionObject } from "../src/author";
import { Rulesengine} from "../src/rulesengine";

describe(`Map Functions: Map Run`, () => {

    it(`Map without path`, () => {
        const decisionObjectStructure = {
            name: `MapRun`,
            version: "1",
            inputs: [{token: "BrandIndex", dataType: DataTypeEnum.Integer}],
            outputs: [{token: "BrandPriority", calculation: "BrandIndex + 1"}]
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        const bomArray = [
            {
                Name: "Brand A",
                BrandIndex: 1
            },
            {
                Name: "Brand B",
                BrandIndex: 2
            },
            {
                Name: "Brand C",
                BrandIndex: 3
            }
        ];
        const rules = decisionObject.getRules(),
            engine = new Rulesengine(rules.rules, {}, `MapRun`, `1.0.0`),
            newBomArray = engine.mapRun(bomArray, undefined, {withStats: true});

        expect(newBomArray.length).to.equal(bomArray.length, `Map Run didn't product the correct length of ${bomArray.length} but got ${newBomArray.length}`);
        expect(newBomArray[0].BrandPriority).to.equal(2, `Map Run didn't detect BrandPriority in ${JSON.stringify(newBomArray[0])}`);
    });
    it(`Map with path`, () => {
        const decisionObjectStructure = {
            name: `MapRun`,
            version: "2",
            inputs: [{token: "BrandIndex", dataType: DataTypeEnum.Integer}],
            outputs: [{token: "BrandPriority", calculation: "BrandIndex + 1"}]
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        const bomArray = [
            {
                Name: "Brand A",
                BrandIndex: 1
            },
            {
                Name: "Brand B",
                BrandIndex: 2
            },
            {
                Name: "Brand C",
                BrandIndex: 3
            }
        ];
        console.log(JSON.stringify(decisionObject.getRules(), null, 2));
        const rules = decisionObject.getRules(),
            engine = new Rulesengine(rules.rules, {}, `MapRun`, `2.0.0`);
        const newBomArray = engine.mapRun(bomArray, "bom.BrandPriority");
        expect(newBomArray.length).to.equal(bomArray.length, `Map Run didn't product the correct length of ${bomArray.length} but got ${newBomArray.length}`);
        expect(newBomArray[0]).to.equal(2, `Map Run didn't detect value 0 in ${JSON.stringify(newBomArray)}`);
    });
    it(`Filter without path`, () => {
        const decisionObjectStructure = {
            name: `FilterRun`,
            version: "2",
            inputs: [{token: "BrandIndex", dataType: DataTypeEnum.Integer}],
            outputs: [{token: "BrandPriority", calculation: "BrandIndex + 1"}, {token: "Odd", calculation: "BrandIndex % 2 === 1"}]
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        const bomArray = [
            {
                Name: "Brand A",
                BrandIndex: 1
            },
            {
                Name: "Brand B",
                BrandIndex: 2
            },
            {
                Name: "Brand C",
                BrandIndex: 3
            }
        ];
        const rules = decisionObject.getRules(),
            engine = new Rulesengine(rules.rules, {}, `FilterRun`, `2.0.0`);
        const newBomArray = engine.filterRun(bomArray, `bom.Odd === true`);

        expect(newBomArray.length).to.equal(2, `Filter Run didn't product the correct length of 2 but got ${newBomArray.length}`);
        expect(newBomArray[1].BrandPriority).to.equal(4, `Filter Run didn't detect value 1.BrandPriority in ${JSON.stringify(newBomArray)}`);
    });
    it(`Filter with path`, () => {
        const decisionObjectStructure = {
            name: `FilterRun`,
            version: "2",
            inputs: [{token: "BrandIndex", dataType: DataTypeEnum.Integer}],
            outputs: [{token: "BrandPriority", calculation: "BrandIndex + 1"}, {token: "Odd", calculation: "BrandIndex % 2 === 1"}]
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        const bomArray = [
            {
                Name: "Brand A",
                BrandIndex: 1
            },
            {
                Name: "Brand B",
                BrandIndex: 2
            },
            {
                Name: "Brand C",
                BrandIndex: 3
            }
        ];
        const rules = decisionObject.getRules(),
            engine = new Rulesengine(rules.rules, {}, `FilterRun`, `2.0.0`);
        const newBomArray = engine.filterRun(bomArray, `bom.Odd === true`, "bom.BrandPriority");

        expect(newBomArray.length).to.equal(2, `Filter Run didn't product the correct length of 2 but got ${newBomArray.length}`);
        expect(newBomArray[1]).to.equal(4, `Filter Run didn't detect value 1 in ${JSON.stringify(newBomArray)}`);
    });
});
