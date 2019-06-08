import { getBOMValue, IRuleStructure, jlog, Rule, RuleBehaviour, Rulesengine } from "./rulesengine";
import { Md5 } from "ts-md5";
import { js_beautify } from "js-beautify";
import { addToBom } from "./bom";

const terser = require("terser");

const avro = require("avsc");

export function functionize(code: string, addFunction = false, rawValue = false) {
    if (!rawValue) {
        code = code || "";
        if (code.indexOf("result") === -1) {
            code = `var result=undefined; result = ${code}`;
        }
        if (addFunction) {
            code = `function() {${code}; return result}`;
        }
    }
    return code;
}

export function assert(expr, message, code) {
    if (!expr) {
        throw new Error(`[${code}]: ${message}`);
    }
    return assert;
}

export function replaceTokensWithPath(code, name, path) {
    const previousRegex = new RegExp(`\\b\\.${name}\\b`, "g");
    const nameRegEx = new RegExp(`(?!'|")\\b${name}\\b(?!'|")`, "g");
    const restorePreviousRegex = new RegExp(`\\b\\._${name}\\b`, "g");
    const restoreValuesBetweenSingleQuotesRegex = new RegExp(`\('\)\\b\(\[^'\]*\)\(bom.\)${name}\(\[\^'\]*\)\\b\('\)`, "g");
    const restoreValuesBetweenDoubleQuotesRegex = new RegExp(`\("\)\\b\(\[^"\]*\)\(bom.\)${name}\(\[\^"\]*\)\\b\("\)`, "g");
    code = code.replace(previousRegex, `._${name}`);
    code = code.replace(nameRegEx, `${path}`);
    code = code.replace(restorePreviousRegex, `.${name}`);
    code = code.replace(restoreValuesBetweenSingleQuotesRegex, `'$2${name}$4'`);
    code = code.replace(restoreValuesBetweenDoubleQuotesRegex, `"$2${name}$4"`);
    return code;
}

export function tokenizeString(input: string) {
    input = input
        .replace(/===/g, "IsEqualTo")
        .replace(/!==/g, "IsNotEqual")
        .replace(/==/g, "IsEqualTo")
        .replace(/!=/g, "IsNotEqualTo")
        .replace(/<>/g, "IsNotEqualTo")
        .replace(/>/g, "IsGreaterThan")
        .replace(/>=/g, "IsGreaterOrEqualTo")
        .replace(/</g, "IsLessThan")
        .replace(/<=/g, "IsLessOrEqualTo")
        .replace(/&&/g, "And")
        .replace(/\|\|/g, "Or")
        .replace(/!/g, "Not")
        .replace(/=/g, "Is")
        .replace(/\(/g, "With")
        .replace(/\)/g, "_params_")
        .replace(/\./g, "_via_")
        .replace(/,/g, "_and_")
        .replace(/,/g, "_and_")
        .replace(/[^\w]|_/g, "_");
    if ("0123456789".indexOf(input.charAt(0)) > -1) {
        input = "_" + input;
    }
    return input.replace(/__/g, "_");
}

export enum DecisionObjectType {
    RuleSet = "RuleSet",
    MultiAxisTable = "MultiAxisTable",
    SingleAxisTable = "SingleAxisTable"
}

export enum ConditionTypeEnum {
    Boolean = "Expression",
    LessThan = "LessThan",
    LessThanOrEqualTo = "LessThanOrEqualTo",
    GreaterThan = "GreaterThan",
    GreaterThanOrEqualTo = "GreaterThanOrEqualTo",
    Between = "Between",
    Outside = "Outside"
}

export enum DataTypeEnum {
    Any = "Unknown",
    String = "String",
    Integer = "Integer",
    Boolean = "Boolean",
    Date = "Date",
    Decimal = "Decimal",
    Enum = "Enum",
    List = "List",
    Object = "Object"
}

export interface IEnumeration {
    label?: string;
    value: string;
    range?: [number, number];
}

export class Enumeration implements IEnumeration {
    public label?: string;
    public value: string;
    public range?: [number, number];
    public constructor(jsonObj) {
        for (const propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }
    }
}

export interface IEnumerationSet {
    name: string;
    values: IEnumeration[];
}

export class EnumerationSet implements IEnumerationSet {
    public name: string;
    public values: Enumeration[];
    private valueLookup: {};
    private setupLookup() {
        this.valueLookup = {};
        this.values.forEach((value) => {
            this.valueLookup[value.value] = value;
        });
        this.setupLookup = () => {
            // Blank Method
        };
    }
    public validateTheValue(value: string) {
        this.setupLookup();
        return this.valueLookup[value] !== undefined;
    }
    public getLabel(value: string) {
        this.setupLookup();
        return this.valueLookup[value].label ? this.valueLookup[value].label : value;
    }
    public getRange(value: string) {
        this.setupLookup();
        return this.valueLookup[value].range;
    }
    public constructor(jsonObj) {
        for (const propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }
        this.values = this.values.map((value) => {
            return new Enumeration(value);
        });
    }
}

interface IRuleContext {
    name: string;
    enumerations?: IEnumerationSet[];
}

export class RuleContext implements IRuleContext {
    public name = "Generic";
    public enumerations?: EnumerationSet[] = [];
    public hasEnumerationSet(enumeration: string) {
        return this.enumerations.filter((enumerationSet) => {return enumerationSet.name === enumeration; }).length > 0;
    }
    public getEnumerationSet(enumeration: string): EnumerationSet {
        return this.enumerations.filter((enumerationSet) => {return enumerationSet.name === enumeration; })[0];
    }
    public constructor(jsonObj) {
        for (const propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }
        this.enumerations = this.enumerations.map((enumeration) => {return new EnumerationSet(enumeration); });
    }
}

const SAMPLEDATA = {};
SAMPLEDATA[DataTypeEnum.List] = [];
SAMPLEDATA[DataTypeEnum.Object] = {};
SAMPLEDATA[DataTypeEnum.String] = "A string";
SAMPLEDATA[DataTypeEnum.Boolean] = true;
SAMPLEDATA[DataTypeEnum.Date] = new Date();
SAMPLEDATA[DataTypeEnum.Decimal] = 3.142;
SAMPLEDATA[DataTypeEnum.Integer] = 7;
SAMPLEDATA[DataTypeEnum.Enum] = "Enumeration";
SAMPLEDATA[DataTypeEnum.Any] = undefined;

export interface IDataPoint {
    name?: string;
    label?: string;
    dataType?: DataTypeEnum;
    path?: string;
    doc?: string;
    mockValue?: string;
    enumerationSet?: string;
    id?: string;
}

abstract class DataPointBase implements IDataPoint {
    name: string;
    label?: string;
    dataType: DataTypeEnum = DataTypeEnum.Any;
    path?: string;
    doc?: string;
    mockValue?: string;
    enumerationSet?: string;
    id?: string;
    getFullPath(excludeRoot = false): string {
        let path = this.path;
        let root = this.getParent();
        while (root) {
            path = root.parentName + "." + path;
            root = root.getParent();
        }
        if (excludeRoot) {
            path = path.replace("bom.", "");
        }
        return path;
    }
    getParent(): InputsOutputsManager {
        return undefined;
    }
    protected constructor(jsonObj) {
        for (const propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }
        this.label = this.label || this.name;
        this.path = this.path || this.name;
        this.dataType = this.dataType !== undefined ? this.dataType : DataTypeEnum.Decimal;
        this.doc = this.doc || `This is a ${this.name} of type ${DataTypeEnum[this.dataType]} with default value of ${this.mockValue}`;
    }
}

export interface IOutput extends IInput {
    ruleBehaviour?: RuleBehaviour;
    code?: string;
    rawValue?: boolean;
    inputMappings?: {From: string, To: string}[];
    conditions?: ICondition[];
    decisionObject?: IRuleSet | ISingleAxisTable | IMultiAxisTable;
}

export class Output extends DataPointBase implements IOutput {
    decisionObject?: RuleSet | MultiAxisTable;
    code?: string;
    rawValue ? = false;
    inputMappings?: {From: string, To: string}[];
    conditions: ICondition[] = [];
    ruleBehaviour?: RuleBehaviour = RuleBehaviour.Normal;
    constructor(parent: InputsOutputsManager, jsonObj: IOutput) {
        super(jsonObj);
        assert(parent !== undefined, "Parent cannot be null for Output", "OUTPUT03");
        this.getParent = () => {
            return parent;
        };
        this.name = tokenizeString(this.name);
        this.conditions = [];
        if (!!jsonObj.conditions) {
            jsonObj.conditions.forEach((condition) => {
                const params: ICondition = condition as any;
                this.addCondition(params);
            });
        }
        if (this.code) {
            assert(
                replaceTokensWithPath(this.code, this.name, `bom.${this.name}`) === this.code,
                `Code cannot refer to itself for name "${this.name}" with "bom.${this.name}":
Code:
=====================
${this.code}
=====================
Replaced:
=====================
${replaceTokensWithPath(this.code, this.name, `bom.${this.name}`)}"
=====================`,
                "RULE02");
        } else {
            this.code = "result = undefined";
        }
    }
    addCondition(condition: ICondition) {
        const outputCondition = new Condition(this.getParent(), condition);
        outputCondition.name = `${tokenizeString(outputCondition.name)}`;
        outputCondition.path = `_conditions.${this.path}_${this.conditions.length + 1}_${outputCondition.name}`;
        this.conditions.push(outputCondition);
        this.getParent().addOutput(outputCondition);
        return outputCondition;
    }
    getRule(): string {
        let code = this.code;
        if (code.indexOf("result") === -1) {
            code = `result = ${code}`;
        }
        if (this.conditions.length > 0) {
            const conditions = [];
            this.conditions.forEach((condition) => {
                conditions.push(condition.name);
            });
            code = `if (${conditions.join(" && ")}) {${code}}`;
        }
        return terser.minify(code, {
            mangle: false,
            parse: {
                bare_returns: true
            },
            compress: {
                conditionals: false,
                dead_code: false,
                directives: false,
                evaluate: false,
                expression: true,
                hoist_funs: true,
                if_return: false,
                inline: 0
            }
        }).code;
    }
    public static findOutput(outputs: Output[], name: string): Output {
        for (const output of outputs) {
            if (output.name === name) {
                return output;
            }
        }
        return undefined;
    }

    setDecisionObject(decisionObject: DecisionObject | MultiAxisTable, inputMappings: {From: string, To: string}[]) {
        if (!!decisionObject && !!this.getParent()) {
            assert
                (this.inputMappings !== undefined, `Missing inputMappings for Decision Object ${decisionObject.name} on output ${this.label}`, "OUTPUT01");

            if (decisionObject.decisionObjectType === DecisionObjectType.MultiAxisTable) {
                decisionObject.parentName = this.path.split(".")[this.path.split(".").length - 1];
                decisionObject = new MultiAxisTable(this.getParent(), decisionObject as IMultiAxisTable);
            } else {
                decisionObject = new DecisionObject(this.getParent(), decisionObject);
            }
            this.decisionObject = decisionObject;
            this.inputMappings = inputMappings;
            decisionObject.parentName = this.path;
            decisionObject.inputs.forEach((input) => {
                const namees = this.inputMappings.filter((inputMapping) => {
                    return (inputMapping.To === input.name);
                });
                assert
                    (namees.length > 0, `No mapping found for input variable "${input.getFullPath()}" on rule set "${this.getParent().name}.${this.label}"`, "OUTPUT02");
            });
            this.inputMappings.forEach((mapping) => {
                const input = decisionObject.getInput(mapping.To);
                const dataPoint = this.getParent().getDataPoint(mapping.From);
                const code = dataPoint ? dataPoint.getFullPath() : mapping.From;
                const output = new Output(decisionObject, {
                    name: input.name,
                    code,
                    dataType: input.dataType,
                    doc: input.doc,
                    mockValue: input.mockValue,
                    label: input.label,
                    path: input.path,
                    ruleBehaviour: RuleBehaviour.Normal
                });
                decisionObject.addOutput(output);
            });
            decisionObject.inputs = [];
        }
    }
    getDecisionObject() {
        return this.decisionObject;
    }
    hasDecisionObject() {
        return !!this.decisionObject;
    }
}

export interface IInput extends IDataPoint {
}

export class Input  extends DataPointBase implements IInput {
    constructor(parent: InputsOutputsManager, jsonObj: IInput) {
        super(jsonObj);
        this.getParent = () => {
            return parent;
        };
    }
}

interface ICondition extends IOutput {
    conditionType: ConditionTypeEnum;
    expression?: string;
    number?: string;
    from?: string;
    to?: string;
    includeFrom?: boolean;
    includeTo?: boolean;
    name: string;
    label?: string;
    index?: number;
}

class Condition extends Output implements ICondition {
    from?: string;
    to?: string;
    number?: string;
    includeFrom?: boolean;
    includeTo?: boolean;
    conditionType: ConditionTypeEnum;
    expression?: string;
    mockValue?: string;
    code: string;
    rawValue?: boolean;
    label?: string;
    index?: number;
    getRule(): string {
        if (this.conditionType === ConditionTypeEnum.Boolean) {
            this.code = this.expression;
        } else if (this.conditionType === ConditionTypeEnum.LessThan) {
            this.code = `${this.expression} < ${this.number}`;
        } else if (this.conditionType === ConditionTypeEnum.LessThanOrEqualTo) {
            this.code = `${this.expression} <= ${this.number}`;
        } else if (this.conditionType === ConditionTypeEnum.GreaterThan) {
            this.code = `${this.expression} > ${this.number}`;
        } else if (this.conditionType === ConditionTypeEnum.GreaterThanOrEqualTo) {
            this.code = `${this.expression} >= ${this.number}`;
        } else if (this.conditionType === ConditionTypeEnum.Between) {
            const left = `<${this.includeFrom ? "=" : ""}`;
            const right = `<${this.includeTo ? "=" : ""}`;
            this.code = `${this.from} ${left} ${this.expression} ${right} ${this.to}`;
        } else if (this.conditionType === ConditionTypeEnum.Outside) {
            const left = `<${this.includeFrom ? "=" : ""}`;
            const right = `>${this.includeTo ? "=" : ""}`;
            this.code = `(${this.expression} ${left} ${this.from}) && (${this.expression} ${right} ${this.to})`;
        }
        return super.getRule();
    }
    constructor(parent: InputsOutputsManager, jsobObj: ICondition) {
        super(parent, jsobObj);
    }
}

function evaluateMockValue(input: IDataPoint) {
    if (input.mockValue) {
        assert(input.mockValue.indexOf("=") === -1, "Mock value should be simple types", "MOCK01");
        let mockValue: any = input.mockValue ? input.mockValue : false;
        if ((input.dataType === DataTypeEnum.Object) && mockValue) {
            const anObject = eval(`anObject = ${mockValue}`);
            mockValue = anObject;
        } else if (mockValue) {
            try {
                mockValue = eval(mockValue);
            } catch (e) {
                console.error(e, mockValue);
            }
        }
        return mockValue;
    } else {
        return undefined;
    }
}

class InputsOutputsManager {
    inputs: Input[] = [];
    outputs: Output[] = [];
    name?: string;
    version = "UnVersioned";
    parentName = "bom";
    constructor(parent: InputsOutputsManager, jsonObj: IDecisionObject) {
        for (const propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }

        // Set Parent
        this.getParent = () => {
            return parent;
        };
    }
    getParent(): InputsOutputsManager {
        return undefined;
    }
    validateDataPoints() {
        const namees = this.getDataPoints()
            .map((dataPoint) => {
                return {count: 1, name: dataPoint.name};
            })
            .reduce((accumulator, currentValue) => {
                accumulator[currentValue.name] = (accumulator[currentValue.name] || 0) + currentValue.count;
                return accumulator;
            }, {});
        const duplicateTokens = Object.keys(namees).filter((a) => namees[a] > 1);
        if (duplicateTokens.length !== 0) {
            jlog(this.outputs);
            jlog(this.inputs);
        }
        assert(duplicateTokens.length === 0, `Following name(es) are duplicated: '${duplicateTokens.join("', '")}' in BOM of '${this.name}'`, "DO01");
        const names = this.getDataPoints()
            .map((dataPoint) => {
                return {count: 1, name: dataPoint.label};
            })
            .reduce((accumulator, currentValue) => {
                accumulator[currentValue.name] = (accumulator[currentValue.name] || 0) + currentValue.count;
                return accumulator;
            }, {});
        const duplicateNames = Object.keys(names).filter((a) => names[a] > 1);
        assert(duplicateTokens.length === 0, `Following name(s) are duplicated: '${duplicateNames.join("', '")}' in BOM of '${this.name}'`, "DO02");
        const paths = this.getDataPoints()
            .map((dataPoint) => {
                return {count: 1, name: dataPoint.path};
            })
            .reduce((accumulator, currentValue) => {
                accumulator[currentValue.name] = (accumulator[currentValue.name] || 0) + currentValue.count;
                return accumulator;
            }, {});
        const duplicatePaths = Object.keys(paths).filter((a) => paths[a] > 1);
        assert(duplicateTokens.length === 0, `Following relative path(s) are duplicated: '${duplicatePaths.join("', '")}' in BOM of '${this.name}'`, "DO03");
    }
    getDataPoints(): DataPointBase[] {
        const dataPoints = [];
        this.inputs.forEach((input, index) => {
            dataPoints.push(this.inputs[index]);
        });
        this.outputs.forEach((output, index) => {
            dataPoints.push(this.outputs[index]);
        });
        return dataPoints;
    }
    generateSampleBOM(includeOutputs = false, addAnnotation = false): {getValue: any, setValue: any, log: any, SchemaVersion: string} {
        const bom = {
            getValue(path: string) {
                return getBOMValue(this, "bom." + path);
            },
            setValue(path: string, value: any) {
                return addToBom(this, path, value);
            },
            log() {
                console.error(JSON.stringify(this, undefined, 2));
            },
            SchemaVersion: ""
        };
        this.inputs.forEach((input, index) => {
            const sampleData = evaluateMockValue(input);
            const data = addAnnotation ? {sampleData: input.mockValue ? sampleData : SAMPLEDATA[input.dataType.replace("Type", "")], documentation: input.doc, dataType: DataTypeEnum[input.dataType.replace("Type", "")]} : input.mockValue ? sampleData : SAMPLEDATA[input.dataType.replace("Type", "")];
            addToBom(bom, `${input.path}`, data);
        });
        if (includeOutputs) {
            this.outputs.forEach((output, index) => {
                if (output.hasDecisionObject()) {
                    const dObject = output.getDecisionObject();
                    if (dObject.decisionObjectType === DecisionObjectType.MultiAxisTable) {
                        const root = output.path.split(".")[0];
                        const subBom = dObject.generateSampleBOM(includeOutputs, addAnnotation)[root];
                        getAllPaths(output.name, subBom).forEach((path) => {
                            const fullPath = root + "." + path.path.split(".").splice(1).join(".");
                            addToBom(bom, fullPath, path.value);
                        });
                    } else {
                        addToBom(bom, `${output.path}`, dObject.generateSampleBOM(includeOutputs, addAnnotation));
                    }
                } else if (output.name.indexOf("DecisionTable_") === -1) {
                    const sampleData = evaluateMockValue(output);
                    const data = addAnnotation ? {sampleData: sampleData ? sampleData : SAMPLEDATA[output.dataType.replace("Type", "")], documentation: output.doc, dataType: DataTypeEnum[output.dataType.replace("Type", "")]} : sampleData ? sampleData : SAMPLEDATA[output.dataType.replace("Type", "")];
                    // console.warn(`Adding to BOM: ${output.getFullPath()} = ${data}`);
                    addToBom(bom, output.path, data);
                }
            });
        }
        addToBom(bom, "SchemaVersion", this.schemaVersion());
        return bom;
    }
    schemaVersion() {
        let hash = "";
        this.getDataPoints().forEach((datapoint) => {
            hash += `${datapoint.path}:${datapoint.dataType}`;
        });
        return Md5.hashStr(hash).toString();
    }
    getInput(name: string): Input {
        return this.inputs.filter((input) => {
            return (input.name === name);
        })[0];
    }
    getOutput(name: string): Output {
        return this.outputs.filter((output) => {
            return (output.name === name);
        })[0];
    }
    getDataPoint(name: string): DataPointBase {
        return this.getDataPoints().filter((dataPoint) => {
            return (dataPoint.name === name);
        })[0];
    }
    addInput(input: IInput | Input): Input {
        this.inputs.forEach((iInput) => {
            assert(iInput.name !== input.name, `There's already an input with name ${input.name}"`, "INPUT01");
        });
        if (input instanceof Input) {
            this.inputs.push(input);
            return input;
        } else {
            const newInput = new Input(this, input);
            this.inputs.push(newInput);
            return newInput;
        }
    }
    addOutput(output: IOutput | Output): Output {
        this.outputs.forEach((iOutput) => {
            assert(iOutput.name !== output.name, `There's already an output with name ${output.name}"`, "OUTPUT04");
        });
        if (output instanceof Output) {
            this.outputs.push(output);
            return output;
        } else {
            const newOutput = new Output(this, output);
            this.outputs.push(newOutput);
            return newOutput;
        }
    }
}

class InputBuilder {
    constructor(public input: IInput, public decisionObjectBuilder: DecisionObjectBuilder) {
    }
    comma() {
        return this.decisionObjectBuilder;
    }
    thenNext() {
        return this.decisionObjectBuilder;
    }
    asEnum(ofType: string, withValue= "") {
        this.input.dataType = DataTypeEnum.Enum;
        assert(this.decisionObjectBuilder.decisionObject.ruleContext.hasEnumerationSet(ofType), `There is no enumeration of type ${ofType}`, "BUILD01");
        if (withValue) {
            assert(this.decisionObjectBuilder.decisionObject.ruleContext.getEnumerationSet(ofType).validateTheValue(withValue), `Invalid value of "${withValue}" for ${ofType}`, "ENUM01");
        }
        this.input.enumerationSet = ofType;
        this.input.mockValue = `"${withValue}"`;
        return this;
    }
    asString(withValue= "") {
        this.input.dataType = DataTypeEnum.String;
        this.input.mockValue = `"${withValue}"`;
        return this;
    }
    asInteger(withValue= 0) {
        this.input.dataType = DataTypeEnum.Integer;
        this.input.mockValue = `${withValue}`;
        return this;
    }
    asDecimal(withValue= 0) {
        this.input.dataType = DataTypeEnum.Decimal;
        this.input.mockValue = `${withValue}`;
        return this;
    }
    asDate(withValue: Date= new Date()) {
        this.input.dataType = DataTypeEnum.Date;
        this.input.mockValue = `"${withValue.getDate()}"`;
        return this;
    }
    asBoolean(withValue= false) {
        this.input.dataType = DataTypeEnum.Boolean;
        this.input.mockValue = `${!!withValue}`;
        return this;
    }
    asObject(withValue: {} = {}) {
        this.input.dataType = DataTypeEnum.Object;
        this.input.mockValue = `${JSON.stringify(withValue)}`;
        return this;
    }
    asList(withValue: any[] = []) {
        this.input.dataType = DataTypeEnum.List;
        this.input.mockValue = `${JSON.stringify(withValue)}`;
        return this;
    }
    remove() {
        this.decisionObjectBuilder.decisionObject.inputs = this.decisionObjectBuilder.decisionObject.inputs.filter((input) => {
            return input.name !== this.input.name;
        });
        return this.decisionObjectBuilder;
    }
}

class OutputBuilder extends InputBuilder {
    constructor(public output: Output, public decisionObjectBuilder: DecisionObjectBuilder) {
        super(output, decisionObjectBuilder);
    }
    using(calculator: string | DecisionObject) {
        if (typeof calculator === "string") {
            this.usingCode(calculator);
        } else {
            this.usingDecisionObject(calculator);
        }
        return this;
    }
    usingCode(code: string) {
        this.output.code = code;
        return this;
    }
    withCode(code: string) {
        return this.usingCode(code);
    }
    usingDecisionObject(decisionObject: DecisionObject) {
        this.output.decisionObject = decisionObject;
        this.output.inputMappings = [];
        return this;
    }
    withDecisionObject(decisionObject: DecisionObject) {
        return this.usingDecisionObject(decisionObject);
    }
    mappingInput(from: string, to: string) {
        assert(this.output.inputMappings !== undefined, "Please set the decision object before you map inputs", "BUILDER01");
        this.output.inputMappings.push({From: from, To: to});
        return this;
    }
    ifTrueThat(expression: string, withLabel?: string) {
        const condition = new Condition(this.decisionObjectBuilder.decisionObject, {
            expression,
            conditionType: ConditionTypeEnum.Boolean,
            label: withLabel,
            name: !!withLabel ? tokenizeString(withLabel) : tokenizeString(expression) + "IsTrue"
        });
        this.output.addCondition(condition);
        return this;
    }
    and() {
        return this;
    }
}

class DecisionObjectBuilder {
    constructor(public decisionObject: DecisionObject) {
    }
    withInput(input: string | Input) {
        if (typeof input === "string") {
            const path = input.split(".");
            const name = path[path.length - 1];
            input = this.decisionObject.getInput(name) || this.decisionObject.addInput({name, path: input});
        } else {
            input = this.decisionObject.getInput(input.name) || this.decisionObject.addInput(input);
        }
        return new InputBuilder(input, this);
    }
    withOutput(output: string | Output) {
        if (typeof output === "string") {
            const path = output.split(".");
            const name = path[path.length - 1];
            output = this.decisionObject.getOutput(name) || this.decisionObject.addOutput({name, path: output});
        } else {
            output = this.decisionObject.getOutput(output.name) || this.decisionObject.addOutput(output);
        }
        return new OutputBuilder(output, this);
    }
    also() {
        return this;
    }
    done() {
        return this.decisionObject;
    }
}

export interface IDecisionObject {
    name?: string;
    version?: string;
    inputs: IInput[];
    outputs: IOutput[];
    decisionObjectType?: DecisionObjectType;
    parentName?: string;
    ruleContext?: IRuleContext;
}

export class DecisionObject extends InputsOutputsManager implements IDecisionObject {
    parentName = "bom";
    decisionObjectType: DecisionObjectType;
    builder: DecisionObjectBuilder;
    name: "unnamed";
    ruleContext?: RuleContext;
    public getInputNames(): string[] {
        return this.inputs.map((input) => {
            return input.path;
        });
    }
    constructor(parent: InputsOutputsManager, jsonObj: IDecisionObject) {
        super(parent, jsonObj);
        this.builder = new DecisionObjectBuilder(this);
        // Super and copy JSON values to class
        this.decisionObjectType = DecisionObjectType.RuleSet;
        if (!this.ruleContext) {
            this.ruleContext = new RuleContext({});
        } else {
            this.ruleContext = new RuleContext(this.ruleContext);
        }

        // Initialize Inputs
        this.inputs.forEach((input, index) => {
            this.inputs[index] = new Input(this, input);
        });

        // Initialize Conditions + Outouts
        this.outputs = [];
        if (!!jsonObj.outputs) {
            jsonObj.outputs.forEach((output, index) => {
                const newOutput = new Output(this, output);
                this.addOutput(newOutput);
            });
        }
        if (jsonObj.decisionObjectType === DecisionObjectType.RuleSet) {
            this.validateDataPoints();
        }
        this.setupAdditionalRules();

        // Only setup sub decision objects if the model has been realised, ie, this is the root object
        // because full paths won't be relative but absolute in the context of the sub object
        if (!parent) {
            DecisionObject.setupSubDecisionObjects(this);
        }
    }
    public static setupSubDecisionObjects(decisionObject: DecisionObject) {
        decisionObject.outputs.forEach((output) => {
            if (output.hasDecisionObject()) {
                output.setDecisionObject(output.decisionObject, output.inputMappings);
            }
        });
        decisionObject.outputs.forEach((output) => {
            if (output.hasDecisionObject()) {
                this.setupSubDecisionObjects(output.decisionObject);
            }
        });
    }
    setupAdditionalRules() {
        // Blank Method
    }
    generateReadableRules() {
        const rules = [];
        this.outputs.forEach((output) => {
            // const x = `${output.path !=== output.name ? ' It will be saved under ${output.path}' : ''}`;
            const conditions = output.conditions.map((condition) => {return condition.name; }).join(" and ");
            rules.push(`${output.label}${output.label !== output.name ? `known as ${output.name} ` : ""} is defined as ${output.code}${output.path !== output.name ? `It will be saved under ${output.path}` : ""}` +
                (conditions ? ` when ${conditions} is true.` : "."));
        });
        return rules;
    }
    getRules(): {rules: IRuleStructure[], Version: string, Id: string, SchemaVersion: string} {
        const rules = {
            rules: [],
            Version: this.version || "unversioned",
            Id: this.name,
            SchemaVersion: this.schemaVersion().toString(),
            error: {},
            schemaDocumentation: this.generateSampleBOM(true, true),
            sampleSchema: this.generateSampleBOM(false, false)
        };
        this.outputs.forEach((output) => {
            if (output.hasDecisionObject()) {
                const subRules = output.getDecisionObject().getRules();
                // Rules have relative paths and relative paths work well at root-level, but absolute paths are required deeper down
                const mappings = [];
                subRules.rules.forEach((rule) => {
                    if (!rule.absolute) {
                        mappings.push({
                            oldName: rule.name,
                            newName: output.getFullPath() + "." + rule.name
                        });
                        rule.name = output.getFullPath(true) + "." + rule.name;
                        rule.absolute = true;
                    }
                    rules.rules.push(rule);
                });
                mappings.forEach((mapping) => {
                    subRules.rules.forEach((rule) => {
                        rule.code = replaceTokensWithPath(rule.code, mapping.oldName, mapping.newName);
                    });
                });
                const rule = {
                    name: output.path,
                    code: "//Sub Rules",
                    behaviour: RuleBehaviour.Never
                };
                assert(rule.name, `Rule doesn't have a name using '${output.path}'`, "RULE03");
                rules.rules.push(rule);
            } else {
                const rule = {
                    name: output.path,
                    code: output.getRule(),
                    behaviour: output.ruleBehaviour
                };
                assert(rule.name, `Rule doesn't have a name using '${output.path}'`, "RULE03");
                rules.rules.push(rule);
            }
        });
        if (!this.getParent()) {
            rules.rules.forEach((rule) => {
                this.getDataPoints().forEach((dataPoint) => {
                    rule.code = replaceTokensWithPath(rule.code, dataPoint.name, `${dataPoint.getFullPath()}`);
                });
            });
            const usedVariables = {};
            rules.rules.forEach((rule) => {
                usedVariables[`bom.${rule.name}`] = Rule.findUsedBomVariablesInCode(rule.code);
            });
            Object.keys(usedVariables).forEach((name) => {
                usedVariables[name].forEach((rule) => {
                    if (usedVariables[rule]) {
                        assert(usedVariables[rule].indexOf(name) === -1, `Circular reference detected in rule ${name} and ${rule}`, "RULE01");
                    }
                });
            });
        }
        return rules;
    }
}

interface IAxis {
    name?: string;
    outputs: IOutput[];
    conditions: ICondition[];
    index?: number;
}
export class Axis implements IAxis {
    public name?: string;
    public outputs: IOutput[];
    public conditions: ICondition[];
    public index?: number;
    public constructor(jsonObj: IAxis) {
        for (const propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }
        this.name = this.name || "unnamed";
    }
}

export class Cell {
    public outputs: Output[];
    public columnNumber: number;
    public rowNumber: number;
}

interface ICell {
    outputs: IOutput[];
    columnNumber: number;
    rowNumber: number;
}

interface IRuleSet extends IDecisionObject {}

export class RuleSet extends DecisionObject implements IRuleSet {

}

export interface IDecisionTable extends IDecisionObject {
    purpose: string;
}

export interface IMultiAxisTable extends IDecisionTable {
    columns: IAxis[];
    rows: IAxis[];
    cells: ICell[] | {string, Cell};
    purpose: string;
}

export class MultiAxisTable extends DecisionObject implements IMultiAxisTable {
    columns: Axis[];
    rows: Axis[];
    cells: Cell[];
    purpose: string;
    constructor(parent: InputsOutputsManager, jsonObj: IMultiAxisTable) {
        super(parent, jsonObj);
    }
    setupAdditionalRules() {
        if (this.purpose) {
            this.purpose = tokenizeString(this.purpose);
        }
        this.decisionObjectType = DecisionObjectType.MultiAxisTable;
        const cellCode = this.generateCellCode();
        const globalCode = `
        
        result = (function() {
        ${cellCode}
        return result;
        })()`;

        const purpose = this.purpose || "";
        const outputBase = new Output(this, {
            code: `${globalCode}`,
            name: "DecisionTable_" + (purpose ? tokenizeString(purpose) : ""),
            dataType: DataTypeEnum.Object,
            path: "DecisionTable_" + (purpose ? tokenizeString(purpose) : ""),
            decisionObject: undefined,
            rawValue: false,
            inputMappings: [],
            conditions: [],
            doc: "",
            mockValue: undefined,
            label: "Table",
            ruleBehaviour: RuleBehaviour.Normal
        });
        this.outputs.forEach((output) => {
            if (output.name.indexOf("DecisionTable_") === -1) {
                output.code = `result = ${outputBase.name}.${output.name}`;
            }
        });
        const decisionTableOutput = new Output(this, outputBase);
        this.addOutput(decisionTableOutput);
    }

    private generateCellCode() {
        let code = `var result = {};
        var evaluate = function(value) {
            var r1_ = value && (value.call || value) && (value.call && value.call());
            return r1_ === undefined ? value : r1_;
        }
        `;
        this.columns.forEach((column, index) => {
            const condition = column.conditions.map((condition) => {return functionize(condition.expression, true) + "()"; }).join(" && ");
            code += `
            var column${index}Condition = true;`;
            if (condition.length > 0) {
                code += `
            column${index}Condition = column${index}Condition && (${condition});
                `;
            }
        });
        this.rows.forEach((row, index) => {
            const condition = row.conditions.map((condition) => {return functionize(condition.expression, true) + "()"; }).join(" && ");
            code += `
            var row${index}Condition = true;
            `;
            if (condition.length > 0) {
                code += `
            row${index}Condition = row${index}Condition && (${condition});
                `;
            }
        });
        this.cells.forEach((cell, index) => {
            assert(this.rows[cell.rowNumber - 1], `There isn't a row with index ${cell.rowNumber}`, "CELL01");
            assert(this.columns[cell.columnNumber - 1], `There isn't a column with index ${cell.columnNumber}`, "CELL02");
            code += `
            if (row${cell.rowNumber - 1}Condition && column${cell.columnNumber - 1}Condition) {
            result.Match = {Column: {Index: ${cell.columnNumber - 1}, Name: "${this.columns[cell.columnNumber - 1].name}"}, Row: {Index: ${cell.rowNumber - 1}, Name: "${this.rows[cell.rowNumber - 1].name}"}};
            `;
            this.outputs.forEach((output, outputIndex) => {
                const cellOutput = cell.outputs.filter((cellOutput) => {return cellOutput.name === output.name; })[0];
                const cellValue = cellOutput ? functionize(cellOutput.code, true, cellOutput.rawValue) : "void 0";
                code += `
                var cell${output.name} = ${cellValue};
                cell${output.name} = evaluate(${cellValue});
                `;
            });
            this.rows[cell.rowNumber - 1].outputs.forEach((output, outputIndex) => {
                const columnFn = functionize(output.code, true, output.rawValue);
                    code += `
                if (cell${output.name} === void 0) {
                    var column = ${columnFn};
                    cell${output.name} = evaluate(column);                    
                }
                `;
            });
            this.columns[cell.columnNumber - 1].outputs.forEach((output, outputIndex) => {
                const columnFn = functionize(output.code, true, output.rawValue);
                code += `
                if (cell${output.name} === void 0) {
                    var column = ${columnFn};
                    cell${output.name} = evaluate(column);                    
                }
                `;
            });
            this.outputs.forEach((output) => {
                const tableFn = functionize(output.code, true, output.rawValue);
                code += `
                if (cell${output.name} === void 0) {
                    //raw=${output.rawValue}
                    var table = ${tableFn};
                    cell${output.name} = evaluate(table);
                }
                result["${output.name}"] = cell${output.name};
                `;
            });

            code += `} else 
            `;
        });

        code += ` {
            `;
        this.outputs.forEach((output) => {
            const tableFn = functionize(output.code, true, output.rawValue);
            code += `
                result.Match = {NoMatch: true};
                var table${output.name} = ${tableFn};
                result["${output.name}"] = evaluate(table${output.name});
                `;
        });

        code += `}
        result.TableName = "${(this.name && this.name.replace(/"/g, '\"')) || "Any"}";
        result.Purpose = "${(this.purpose && this.purpose.replace(/"/g, '\"')) || "Any"}";
        `;
        return code;
    }
}

interface ISingleAxisTable extends IDecisionTable {
    entries?: Axis[];
}

export class SingleAxisTable extends DecisionObject implements ISingleAxisTable {
    entries?: Axis[];
    conditions: Condition[];
    purpose: string;
    constructor(parent: InputsOutputsManager, jsonObj: ISingleAxisTable) {
        super(parent, jsonObj);
    }
    addEntry() {
        const conditions = this.inputs.map((input) => {
            return new Condition(undefined, {
                name: input.name,
                label: input.name,
                conditionType: ConditionTypeEnum.Boolean,
                expression: input.dataType === DataTypeEnum.Enum ? this.ruleContext.getEnumerationSet(input.enumerationSet).values[0].value : undefined
            });
        });
        const outputs = this.outputs.map((output) => {
            const newOutuput = new Output(undefined, output);
            if (output.dataType === DataTypeEnum.Enum) {
                output.code = `"${this.ruleContext.getEnumerationSet(output.enumerationSet).values[0].value}"`;
            }
            return newOutuput;
        });
        const newEntry = new Axis({
            conditions,
            name: (this.entries.length + 1) + "",
            outputs,
            index: this.entries.length
        });
        this.entries.push(newEntry);
    }
    setupAdditionalRules() {
        this.purpose = tokenizeString(this.purpose);
        this.decisionObjectType = DecisionObjectType.SingleAxisTable;
        this.entries = this.entries.map((entry) => {
            return new Axis(entry);
        });
        this.entries.forEach((entry, entryIndex) => {
            assert(((entry.conditions.length === this.inputs.length)),
                `Not enough conditions for entry #${entryIndex}, need ${this.inputs.length}`, "ENTRY01");
            this.inputs.forEach((input) => {
                assert(((entry.conditions.filter((condition) => {return condition.name === input.name; }).length > 0)),
                    `Missing the condition for ${input.name} on entry #${entryIndex}`, "ENTRY01");
            });
            this.outputs.forEach((output) => {
                assert((entry.outputs.length === this.outputs.length) && (entry.outputs.filter((entryOutput) => {return output.name === entryOutput.name; }).length > 0),
                    `Missing an output "${output.name}" for entry #${entryIndex}`, "ENTRY02");
            });
        });
        this.outputs.forEach((output) => {
            output.code = "";
        });
        // Create Table Outputs
        const tableCode = this.generateTableCode();
        const globalCode = `
        result = (function() {
        ${tableCode}
        return result;
        })()`;

        const purpose = this.purpose || "";
        const outputBase = new Output(this, {
            code: `${globalCode}`,
            name: "DecisionTable_" + (purpose ? tokenizeString(purpose) : ""),
            dataType: DataTypeEnum.Object,
            path: "DecisionTable_" + (purpose ? tokenizeString(purpose) : ""),
            decisionObject: undefined,
            rawValue: false,
            inputMappings: [],
            conditions: [],
            doc: "",
            mockValue: undefined,
            label: "Table",
            ruleBehaviour: RuleBehaviour.Normal
        });
        this.outputs.forEach((output) => {
            if (output.name.indexOf("DecisionTable_") === -1) {
                output.code = `result = ${outputBase.name}.${output.name}`;
            }
        });
        const decisionTableOutput = new Output(this, outputBase);
        this.addOutput(decisionTableOutput);
    }

    private generateTableCode() {
        return `var result = {"TableName": "${this.name}"};
        ${this.entries.map((entry, index) => {
            return `if (${entry.conditions.map((condition) => {
                return `${condition.name} === ${condition.expression}`;
            }).join(" && ")}) {
                ${entry.outputs.map((output) => {
                    return `result['${output.name}'] = ${functionize(output.code, true)}();`;
                }).join("\n")}
                result["Match"] = {"Name": "${entry.name}", "Index": ${index}};
            }`;
        }).join("\n")}`;
    }
}

export function getAllPaths(root, obj, result = []): {path: string, value: any}[] {
    for (const attr in obj) {
        if (obj.hasOwnProperty(attr) && obj[attr] !== null && typeof(obj[attr]) === "object") {
            result = getAllPaths(root + "." + attr, obj[attr], result);
        } else {
            result.push({path: root + "." + attr, value: obj[attr]});
        }
    }
    return result;
}
// const fullRuleSet: IRuleSet = {
//     decisionObjectType: DecisionObjectType.RuleSet,
//     inputs: [
//         {
//             name: "name",
//             dataType: DataTypeEnum.String,
//             doc: "doc",
//             enumerationSet: "enumeration",
//             label: "label",
//             mockValue: "mockvalue",
//             path: 'path'
//         }
//     ],
//     name: "name",
//     outputs: [
//         {
//             name: "name",
//             dataType: DataTypeEnum.String,
//             doc: "doc",
//             enumerationSet: "enumeration",
//             label: "label",
//             mockValue: "mockvalue",
//             path: 'path',
//             code: "code",
//             conditions: [
//                 {
//                     code: "code",
//                     to: "0.0",
//                     from: "0.0",
//                     number: "0.0",
//                     name: "name",
//                     conditionType: ConditionTypeEnum.Expression
//                 }
//             ],
//             decisionObject: null,
//             rawValue: false,
//             ruleBehaviour: RuleBehaviour.Normal,
//             inputMappings: [
//                 {
//                     From: "",
//                     To: ""
//                 }
//             ]
//         }
//     ],
//     parentName: "",
//     ruleContext: {
//         enumerations: [{
//             name: "",
//             values: [
//                 {
//                     label: "",
//                     value: "",
//                     range: [10, 10]
//                 }
//             ]
//         }],
//         name: ""
//     }
// };
//
// const bom = {
//     "SchemaVersion": "219b468a47bc7332df01ceba4d20cf56",
//     "TotalSales": 1000000,
//     "TotalAssets": 500000,
//     "AccountReceivable": 10,
//     "Inventory": 4000,
//     "AccountsPayable": 15,
//     "Purchases": 5,
//     "CostOfGoodsSold": 5000
// };
// //
// const ttt = new RuleSet(null,
//     {"decisionObjectType":"RuleSet","inputs":[{"name":"totalSales","dataType":"DecimalType","label":"Total Sales","path":"TotalSales"},{"name":"totalAssets","dataType":"DecimalType","label":"Total Assets","path":"TotalAssets"},{"name":"accountReceivable","dataType":"DecimalType","label":"Account Receivable","path":"AccountReceivable"},{"name":"inventory","dataType":"DecimalType","label":"Inventory","path":"Inventory"},{"name":"accountsPayable","dataType":"DecimalType","label":"Accounts Payable","path":"AccountsPayable"},{"name":"purchases","dataType":"DecimalType","label":"Purchases","path":"Purchases"},{"name":"costOfGoodsSold","dataType":"DecimalType","label":"Cost Of Goods Sold","path":"CostOfGoodsSold"}],"name":"Activity","outputs":[{"name":"assetTurnover","dataType":"DecimalType","label":"Asset Turnover","path":"AssetTurnover","code":"result = Math.round((totalSales / totalAssets) * 1000) / 1000","conditions":[]},{"name":"inventoryTurnover","dataType":"DecimalType","label":"Inventory Turnover","path":"InventoryTurnover","code":"result = Math.round((costOfGoodsSold / inventory) * 1000) / 1000","conditions":[]},{"name":"daysOnInventory","dataType":"DecimalType","label":"Days On Inventory","path":"DaysOnInventory","code":"result = Math.round(( 365 / inventoryTurnover) * 1000) / 1000","conditions":[]},{"name":"aPPaymentPeriod","dataType":"DecimalType","label":"A/P Payment Period","path":"aPPaymentPeriod","code":"result = Math.round(((accountsPayable - purchases)*365) * 1000) / 1000","conditions":[]},{"name":"aRCollectionPeriod","dataType":"DecimalType","label":"A/R Collection Period","path":"ARCollectionPeriod","code":"result = Math.round(((accountReceivable / totalSales) * 365) * 1000) / 1000","conditions":[]},{"name":"receivablesTurnover","dataType":"DecimalType","label":"Receivables Turnover","path":"ReceivablesTurnover","code":"result = Math.round((totalSales / accountReceivable) * 1000) / 1000","conditions":[]},{"name":"daysOfSalesOutstanding","dataType":"DecimalType","label":"Days Of Sales Outstanding","path":"DaysOfSalesOutstanding","code":"result = Math.round((365 / receivablesTurnover) * 1000) / 1000","conditions":[]}],"ruleContext":{"enumerations":[],"name":"Security2.png"}}
//     );
//
// // jlog(ttt.generateSampleBOM());
// // jlog(ttt.getRules());
//
// let engine = new Rulesengine(ttt.getRules().rules, bom, ttt.name, ttt.version, ttt.schemaVersion(), ttt.getInputNames());
//
// engine.run(true);
//
// // jlog(bom);
//
// const table = new MultiAxisTable(null,
//     {
//         parentName: "",
//         ruleContext: {
//             enumerations: [{
//                 name: "",
//                 values: [
//                     {
//                         label: "",
//                         value: "",
//                         range: [10, 10]
//                     }
//                 ]
//             }],
//             name: ""
//         },
//         outputs: [{
//             dataType: DataTypeEnum.Expression,
//             name: "IsOfAge",
//             code: "false"
//         }],
//         inputs: [{
//             name: "Age",
//             dataType: DataTypeEnum.Integer,
//             mockValue: "21"
//         },{
//             name: "Gender",
//             dataType: DataTypeEnum.String,
//             mockValue: "'Male'"
//         }],
//         name: "DecisionTable",
//         decisionObjectType: DecisionObjectType.MultiAxisTable,
//         version: "0.1",
//         cells: [{
//             columnNumber: 0,
//             rowNumber: 0,
//             outputs: [{
//                 dataType: DataTypeEnum.Expression,
//                 name: "IsOfAge",
//                 code: "true",
//                 rawValue: false
//             }]
//         }, {
//             columnNumber: 1,
//             rowNumber: 0,
//             outputs: [{
//                 dataType: DataTypeEnum.Expression,
//                 name: "IsOfAge",
//                 code: "true",
//                 rawValue: true
//             }]
//         }, {
//             columnNumber: 0,
//             rowNumber: 1,
//             outputs: [{
//                 dataType: DataTypeEnum.Expression,
//                 name: "IsOfAge",
//                 code: "true",
//                 rawValue: true
//             }]
//         }, {
//             columnNumber: 1,
//             rowNumber: 1,
//             outputs: [{
//                 dataType: DataTypeEnum.Expression,
//                 name: "IsOfAge",
//                 code: "true",
//                 rawValue: true
//             }]
//         }],
//         purpose: "Table",
//         columns: [{
//             outputs: [],
//             conditions: [{
//                 expression: "Age > 18",
//                 conditionType: ConditionTypeEnum.Expression,
//                 name: "AgeGreaterThan18",
//                 label: "Age Greater Than 18"
//             }],
//             name: "Age > 18"
//         }, {
//             outputs: [],
//             conditions: [{
//                 expression: "Age > 21",
//                 conditionType: ConditionTypeEnum.Expression,
//                 name: "AgeGreaterThan21",
//                 label: "Age Greater Than 21"
//             }],
//             name: "Age > 21"
//         }],
//         rows: [{
//             outputs: [{
//                 dataType: DataTypeEnum.Expression,
//                 name: "IsOfAge",
//                 code: "true",
//                 rawValue: true
//             }],
//             conditions: [{
//                 expression: "Gender === 'Male'",
//                 conditionType: ConditionTypeEnum.Expression,
//                 name: "Male",
//                 label: "GenderIsMale"
//             }],
//             name: "Gender = Male"
//         },{
//             outputs: [],
//             conditions: [{
//                 expression: "Gender === 'Female'",
//                 conditionType: ConditionTypeEnum.Expression,
//                 name: "Female",
//                 label: "GenderIsFemale"
//             }],
//             name: "Gender = Female"
//             name: "Gender = Female"
//         }]
//     });
//
// let ageBom = {
//     Age: 18,
//     Gender: "Male"
// };
//
// jlog(table.getRules().rules);
//
// engine = new Rulesengine(table.getRules().rules, ageBom, table.name, table.version, table.schemaVersion(), table.getInputNames());
// engine.run(true);
//
// ageBom = {
//     Age: 22,
//     Gender: "Male"
// };
// engine.reset(ageBom).run(true);
//
// jlog(ageBom);
// jlog(table);

// const appropriateAge = new MultiAxisTable(null,
//     {"inputs":[{"dataType":"IntegerType","name":"Age","label":"Age","path":"Age"},{"dataType":"EnumerationType","name":"Gender","label":"Gender","path":"Gender"}],"outputs":[],"version":"0.0.0.draft","ruleContext":{"enumerations":[{"name":"Gender","values":[{"value":"Male"},{"value":"Female"}]}]},"name":"Is Of Age","decisionObjectType":"DecisionTable","cells":[{"columnNumber":1,"rowNumber":1,"outputs":[]},{"columnNumber":1,"rowNumber":1,"outputs":[]},{"columnNumber":1,"rowNumber":1,"outputs":[]},{"columnNumber":1,"rowNumber":2,"outputs":[]}],"columns":[{"outputs":[],"conditions":[{"expression":"(\r\n)","conditionType":"Boolean_Expression","label":"Male"}],"name":"H1"},{"outputs":[],"conditions":[],"name":"H0"}],"rows":[{"outputs":[],"conditions":[{"expression":"(\r\n)","conditionType":"Boolean_Expression","label":"Older than 18"}],"name":"V1"},{"outputs":[],"conditions":[{"expression":"(\r\n)","conditionType":"Boolean_Expression","label":"Age > 21"}],"name":"V2"}]}
//     )

//
// const eligibility = new MultiAxisTable(undefined, {inputs: [{dataType: "DecimalType", name: "Age", label: "Age", path: "Age", guid: "8444249301322681"}, {dataType: "EnumerationType", name: "Gender", label: "Gender", path: "Gender", guid: "8444249301322682"}], outputs: [{dataType: "BooleanType", code: "undefined", name: "Eligible", path: "Eligible", conditions: [], label: "false", guid: "7318349394480257"}], version: "0.2.0.draft", ruleContext: {name: "noun_Coffee_472911.png", enumerations: [{name: "DrinkType", values: [{value: "Mocha"}, {value: "Flatwhite"}, {value: "Americano"}, {value: "Cappuccino"}]}, {name: "Products", values: [{label: "Mocha", value: "Mocha"}, {label: "Flatwhite", value: "Flatwhite"}, {label: "Americano", value: "Americano"}]}, {name: "Sizes", values: [{value: "Picollo"}, {value: "Mezo"}, {value: "Grande"}]}, {name: "Gender", values: [{value: "Male"}, {value: "Female"}]}]}, name: "OfAge", decisionObjectType: "DecisionTable", cells: [{columnNumber: 1, rowNumber: 1, guid: "1407374883557482", outputs: []}, {columnNumber: 1, rowNumber: 2, guid: "1407374883557481", outputs: []}, {columnNumber: 2, rowNumber: 1, guid: "1407374883557484", outputs: [{dataType: "BooleanType", name: "Eligible", code: "true", guid: "12384898975271873", active: true}]}, {columnNumber: 2, rowNumber: 2, guid: "1407374883557483", outputs: [{dataType: "BooleanType", name: "Eligible", code: "false", guid: "12384898975271872", active: true}]}, {columnNumber: 3, rowNumber: 1, guid: "1407374883557882", outputs: []}, {columnNumber: 3, rowNumber: 2, guid: "1407374883557881", outputs: []}], columns: [{guid: "6755399441059845", outputs: [{dataType: "BooleanType", name: "Eligible", code: "false", guid: "12384898975271865", active: true}], conditions: [{expression: "Age < 19", conditionType: "Boolean_Expression", label: "Age < 19", guid: "17169973579351717", index: 1}], name: "Younger than 19", index: 1}, {guid: "6755399441059846", outputs: [], conditions: [{expression: "(18 < Age) && (Age < 21)", conditionType: "Boolean_Expression", label: "18 < Age < 21", guid: "17169973579351817", index: 1}], name: "19-20", index: 2}, {guid: "6755399441060245", outputs: [{dataType: "BooleanType", name: "Eligible", code: "true", guid: "12384898975271867", active: true}], conditions: [{expression: "Age > 20", conditionType: "Boolean_Expression", label: "Age > 20", guid: "17169973579351818", index: 1}], name: "Older than 20", index: 3}], rows: [{guid: "14073748835536702", outputs: [{dataType: "BooleanType", name: "Eligible", code: "true", guid: "12384898975271869", active: true}], conditions: [{expression: "Gender === 'Female'", conditionType: "Boolean_Expression", label: "Gender === 'Female'", guid: "17169973579351819", index: 1}], name: "Women", index: 1}, {guid: "14073748835536701", outputs: [], conditions: [{expression: "Gender === 'Male'", conditionType: "Boolean_Expression", label: "Gender === 'Male'", guid: "17169973579351820", index: 1}], name: "Men", index: 2}]});
//
// const start = (new Date()).getTime();
//
// const bom = {
//     SchemaVersion: "49332091376571d22119d9dfc717fee6",
//     Age: 17,
//     Gender: "Male"
// };
// // bom.log();
// // jlog(eligibility.getRules().rules);
// const engine = new Rulesengine(eligibility.getRules().rules, bom, eligibility.name, eligibility.version, eligibility.schemaVersion(), eligibility.getInputNames());
// engine.run(false);
//
// for (let x = 0; x < 100000; x++) {
//     engine.reset({}).run(false);
// }
//
// console.log(`Time: ${(new Date()).getTime() - start} milliseconds`);
//
// jlog(bom);