import { expect } from "chai";
import "mocha";
import { DataTypeEnum, DecisionObject, RuleSet } from "../src/author";
import { Rulesengine } from "../src/rulesengine";
const decisionObjectStructure = {
    name: `FilterRun`,
    version: "2",
    inputs: [{name: "BrandIndex", dataType: DataTypeEnum.Integer}],
    outputs: [{name: "BrandPriority", code: "BrandIndex + 1"}, {name: "Odd", code: "BrandIndex % 2 === 1"}]
};
const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
const rules = decisionObject.getRules();
const bomArray = [
];
for (let index = 0; index < 100000; index++) {
    bomArray.push({
        Name: `Brand ${index}`,
        BrandIndex: index
    });
}

// SafeWorkerFactory.registerWorkers(rules.rules, 10000, `FilterRun`, `3.0.0`);

describe(`Performance`, () => {

    it(`1000 records getRules`, () => {
        const ruleSet = new RuleSet(undefined, {
            inputs: [],
            outputs: [],
            name: "Peekaboo"
        });
        ruleSet.builder
            .withInput("Name").asString("Herman").thenNext()
            .withInput("LastName").asString("Geldenhuys").thenNext()
            .withInput("Age").asInteger(33).thenNext()
            .withOutput("FullName").asString().withCode("Name + ' ' + LastName").thenNext()
            .withOutput("Summary").withCode("FullName + ' is ' + Age + ' years old.'");
        let BOM = {Name: "Herman", LastName: "Geldenhuys", Age: 33, Summary: undefined};
        const engine = new Rulesengine(ruleSet.getRules().rules, BOM, ruleSet.name, ruleSet.version, ruleSet.schemaVersion(), ruleSet.getInputNames());

        const start = new Date();
        for (let iterator = 0; iterator < 1000; iterator++) {
            BOM = {Name: "Herman", LastName: "Geldenhuys", Age: iterator, Summary: undefined};
            engine.withBom(BOM).run();
        }
        const took = (new Date()).getTime() - start.getTime();

        console.log(`took: ${took}`);

        expect(BOM.Summary).to.equal("Herman Geldenhuys is 999 years old.");
        expect(took).to.lessThan(40);
    });
    it(`Performance: 100 000 - Map without path`, () => {

        const decisionObjectStructure = {
            name: `MapRun`,
            version: "1",
            inputs: [{name: "BrandIndex", dataType: DataTypeEnum.Integer}],
            outputs: [{name: "BrandPriority", code: "BrandIndex + 1"}]
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        const bomArray = [
        ];
        for (let index = 0; index < 100000; index++) {
            bomArray.push({
                    Name: `Brand ${index}`,
                    BrandIndex: index
                });
        }
        const rules = decisionObject.getRules(),
            engine = new Rulesengine(rules.rules, {}, `MapRun`, `1.0.0`),
            newBomArray = engine.mapRun(bomArray, undefined, {withStats: true});

        expect(newBomArray.length).to.equal(bomArray.length, `Map Run didn't product the correct length of ${bomArray.length} but got ${newBomArray.length}`);
        expect(newBomArray[10000].BrandPriority).to.equal(10001, `Map Run didn't detect BrandPriority in ${JSON.stringify(newBomArray[0])}`);
    });
    it(`Performance: 100 000 - Map without path Using complex model`, () => {

        const decisionObjectStructure = {
            name: `MapRun`,
            version: "1",
            inputs: [{name: "BrandIndex", dataType: DataTypeEnum.Integer}],
            outputs: [{name: "BrandPriority", code: "BrandIndex + 1"}, {name: "Odd", code: "BrandIndex % 2 === 1"}, {name: "Even", code: "!Odd"}, {name: "Complex", code: "Odd + ':' + Even + ':' + BrandPriority"}]
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        const bomArray = [
        ];
        for (let index = 0; index < 100000; index++) {
            bomArray.push({
                    Name: `Brand ${index}`,
                    BrandIndex: index
                });
        }
        const rules = decisionObject.getRules(),
            engine = new Rulesengine(rules.rules, {}, `MapRun`, `1.0.0`),
            newBomArray = engine.mapRun(bomArray, undefined, {withStats: true});

        expect(newBomArray.length).to.equal(bomArray.length, `Map Run didn't product the correct length of ${bomArray.length} but got ${newBomArray.length}`);
        expect(newBomArray[10000].BrandPriority).to.equal(10001, `Map Run didn't detect BrandPriority in ${JSON.stringify(newBomArray[0])}`);
    });
    it(`Performance: 100 000 - Map with path`, () => {

        const decisionObjectStructure = {
            name: `MapRun`,
            version: "1",
            inputs: [{name: "BrandIndex", dataType: DataTypeEnum.Integer}],
            outputs: [{name: "BrandPriority", code: "BrandIndex + 1"}]
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        const bomArray = [
        ];
        for (let index = 0; index < 100000; index++) {
            bomArray.push({
                    Name: `Brand ${index}`,
                    BrandIndex: index
                });
        }
        const rules = decisionObject.getRules(),
            engine = new Rulesengine(rules.rules, {}, `MapRun`, `1.0.0`),
            newBomArray = engine.mapRun(bomArray, `bom.BrandPriority`, {withStats: true});

        expect(newBomArray.length).to.equal(bomArray.length, `Map Run didn't product the correct length of ${bomArray.length} but got ${newBomArray.length}`);
        expect(newBomArray[10000]).to.equal(10001, `Map Run didn't detect BrandPriority in ${JSON.stringify(newBomArray[0])}`);
    });
    it(`Performance: 100 000 - Filter without path`, () => {
        const decisionObjectStructure = {
            name: `FilterRun`,
            version: "1",
            inputs: [{name: "BrandIndex", dataType: DataTypeEnum.Integer}],
            outputs: [{name: "BrandPriority", code: "BrandIndex + 1"}, {name: "Odd", code: "BrandIndex % 2 === 1"}]
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        const bomArray = [
        ];
        for (let index = 0; index < 100000; index++) {
            bomArray.push({
                Name: `Brand ${index}`,
                BrandIndex: index
            });
        }
        const rules = decisionObject.getRules(),
            engine = new Rulesengine(rules.rules, {}, `FilterRun`, `1.0.0`),
            newBomArray = engine.filterRun(bomArray, `bom.Odd === true`, undefined, {withStats: true});

        expect(newBomArray.length).to.equal(50000, `Map Run didn't product the correct length of ${bomArray.length} but got ${newBomArray.length}`);
        expect(newBomArray[10000].BrandPriority).to.equal(20002, `Map Run didn't detect BrandPriority in ${JSON.stringify(newBomArray[0])}`);
    });
    it(`Performance: 100 000 - Filter with path`, () => {

        const decisionObjectStructure = {
            name: `FilterRun`,
            version: "2",
            inputs: [{name: "BrandIndex", dataType: DataTypeEnum.Integer}],
            outputs: [{name: "BrandPriority", code: "BrandIndex + 1"}, {name: "Odd", code: "BrandIndex % 2 === 1"}]
        };
        const decisionObject = new DecisionObject(undefined, decisionObjectStructure);
        const bomArray = [
        ];
        for (let index = 0; index < 100000; index++) {
            bomArray.push({
                Name: `Brand ${index}`,
                BrandIndex: index
            });
        }
        const rules = decisionObject.getRules(),
            engine = new Rulesengine(rules.rules, {}, `FilterRun`, `2.0.0`),
            newBomArray = engine.filterRun(bomArray, `bom.Odd === true`, `bom.BrandPriority`, {withStats: true});

        expect(newBomArray.length).to.equal(50000, `Map Run didn't product the correct length of ${bomArray.length} but got ${newBomArray.length}`);
        expect(newBomArray[10000]).to.equal(20002, `Map Run didn't detect BrandPriority in ${JSON.stringify(newBomArray[0])}`);
    });
    // it(`Performance: 100 000 - Filter withBom path USING Workers`, () => {
    //     bomArray.forEach((bom) => {
    //         SafeWorkerFactory.getWorker(`FilterRun`, `3.0.0`)
    //             .then((re) => {
    //                 // console.log(`EngineWorker.workers[\`FilterRun.3.0.0\`].available.length = ${EngineWorker.workers[`FilterRun.3.0.0`].available.length}`);
    //                 re.run(bom);
    //             });
    //     });
    // });
});
