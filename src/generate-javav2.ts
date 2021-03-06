export const generateRulesEngineRunner = (packageName: string) => {
    const
        rulesEngineCode = `\\"use strict\\";var __awaiter=this&&this.__awaiter||function(e,t,n,i){return new(n||(n=Promise))(function(r,o){function a(e){try{u(i.next(e))}catch(e){o(e)}}function s(e){try{u(i.throw(e))}catch(e){o(e)}}function u(e){e.done?r(e.value):new n(function(t){t(e.value)}).then(a,s)}u((i=i.apply(e,t||[])).next())})},__generator=this&&this.__generator||function(e,t){var n,i,r,o,a={label:0,sent:function(){if(1&r[0])throw r[1];return r[1]},trys:[],ops:[]};return o={next:s(0),throw:s(1),return:s(2)},\\"function\\"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function s(o){return function(s){return function(o){if(n)throw new TypeError(\\"Generator is already executing.\\");for(;a;)try{if(n=1,i&&(r=2&o[0]?i.return:o[0]?i.throw||((r=i.return)&&r.call(i),0):i.next)&&!(r=r.call(i,o[1])).done)return r;switch(i=0,r&&(o=[2&o[0],r.value]),o[0]){case 0:case 1:r=o;break;case 4:return a.label++,{value:o[1],done:!1};case 5:a.label++,i=o[1],o=[0];continue;case 7:o=a.ops.pop(),a.trys.pop();continue;default:if(!(r=(r=a.trys).length>0&&r[r.length-1])&&(6===o[0]||2===o[0])){a=0;continue}if(3===o[0]&&(!r||o[1]>r[0]&&o[1]<r[3])){a.label=o[1];break}if(6===o[0]&&a.label<r[1]){a.label=r[1],r=o;break}if(r&&a.label<r[2]){a.label=r[2],a.ops.push(o);break}r[2]&&a.ops.pop(),a.trys.pop();continue}o=t.call(e,a)}catch(e){o=[6,e],i=0}finally{n=r=0}if(5&o[0])throw o[1];return{value:o[0]?o[1]:void 0,done:!0}}([o,s])}}};function getPath(e){var t=e.split(\\".\\").reverse();return t.pop(),t.reverse(),t}function addToBom(e,t,n){var i=e,r=getPath(\\"bom.\\"+(t=t.replace(/\\\\[\\\\]/g,\\".?\\"))),o={},a=\\"\\";return r.forEach(function(t){if(\\"?\\"!==t){o=e;try{void 0===e[t]&&(e[t]={})}catch(e){throw console.error(\\"Failed path \\"+r+\\": \\"+JSON.stringify(i,void 0,2)),e}e=e[t]}else void 0===o[a][0]&&(o[a]=[{}]),e=o[a][0],o=e;a=t}),void 0!==n?(o[a]=n,\\"?\\"===a&&(o[a]=void 0)):delete o[a],i}function assertValueForPath(e,t,n){var i=this,r=e;if(0!==t.length){var o=t.indexOf(\\"?\\"),a=(o=-1===o?t.length:o)===t.length?t:t.slice(0,o),s=o===t.length?[]:t.slice(t.indexOf(\\"?\\")+1);if(a.forEach(function(e){void 0!==r&&(r=r[e])}),void 0!==r&&o<t.length){var u=[];r.forEach(function(e){var t=i.getValueForPath(e,s);void 0!==t&&u.push(t)}),r=0===u.length?void 0:u}return r+\\"\\"==n+\\"\\"}return!1}var engines={};function getRulesEngine(e,t,n,i){return void 0===engines[e]&&(engines[e]={}),void 0===engines[e][t]&&(engines[e][t]=new Rulesengine(n,{},e,t,i)),engines[e][t]}function censor(e){var t=0;return function(n,i){return 0!==t&&\\"object\\"==typeof e&&\\"object\\"==typeof i&&e===i?\\"[Circular]\\":t>=100?\\"function\\"==typeof i?void 0:typeof i:(++t,i)}}function getAllPaths(e,t,n){for(var i in void 0===n&&(n=[]),t)t.hasOwnProperty(i)&&null!==t[i]&&\\"object\\"==typeof t[i]?n=getAllPaths(e+\\".\\"+i,t[i],n):n.push({path:e+\\".\\"+i,value:t[i]});return n}function getBOMValue(e,t){return getValueForPath(e,getPath(t))}function getValueForPath(e,t){var n=this,i=e;if(0!==t.length){var r=t.indexOf(\\"?\\"),o=(r=-1===r?t.length:r)===t.length?t:t.slice(0,r),a=r===t.length?[]:t.slice(t.indexOf(\\"?\\")+1);if(o.forEach(function(e){void 0!==i&&(i=i[e])}),void 0!==i&&r<t.length){var s=[];i.forEach(function(e){var t=n.getValueForPath(e,a);void 0!==t&&s.push(t)}),i=0===s.length?void 0:s}return i}}var Rule=function(){function Rule(e,t,n,i){var r=this;void 0===i&&(i=\\"Normal\\"),this.name=e,this.code=t,this.bom=n,this.behaviour=i,this.variables=[],this.valid=!1,this.usedValues={},this.path={},this.debug=!1,this.code=\\"var result;\\"+t,this.variables=Rule.findUsedBomVariablesInCode(t),this.variables.forEach(function(e){r.path[e]=getPath(e)})}return Rule.prototype.execute=function(rule,engine){if(\\"Never\\"!==rule.behaviour){var fs=\\"fn=function(o,r){try{var bom=r.bomRoot;\\"+this.code+';if(result===undefined){return;}var e=r.bomRoot,n=r.bomRoot,s=o.name;o.name.split(\\".\\").forEach(function(o){e[o]===undefined?(e[o]={}):e[o],n=e,s=o,e=e[o]}),n[s]=result}catch(e){console.error(\\"Error in \\"+o.name+\\"; Valid=\\"+o.valid+\\"; Error:\\"+e.message+\\" \\"+e.stack+\\"}\\"),console.error(\\"     \\"+o.usedVariables+\\": \\"+JSON.stringify(o.usedValues)),console.error(\\"     \\"+JSON.stringify(r.bomRoot)),console.error(\\"     Code: \\"+o.code),r.bomRoot.error=e}return o};',fn=void 0;return fn=function(e,t){},eval(fs),this.execute=fn,fn(this,engine)}this.execute=function(e,t){}},Rule.prototype.calculate=function(){var e=this;return this.valid=this.valid||0===this.variables.length,this.valid&&\\"Always\\"!==this.behaviour||(this.usedVariables=[],this.variables.forEach(function(t){e.usedValues[t]=getValueForPath(e.bom,e.path[t]),void 0!==e.usedValues[t]&&e.usedVariables.push(t)}),this.valid=this.variables.length===this.usedVariables.length||\\"Some\\"===this.behaviour&&this.variables.length>0||\\"Always\\"===this.behaviour),this},Rule.findUsedBomVariablesInCode=function(e){var t=e.match(/bom\\\\.([A-Za-z_])+([A-Za-z_0-9\\\\.\\\\[\\\\]])*/g),n=/\\\\[([A-Za-z0-9\\\\+_'' \\\\(\\\\)\\\\t\\\\n\\\\[\\\\]])+\\\\]/g;if(null===t)return[];for(var i=0;i<t.length;i++)t[i]=t[i].replace(n,\\".?\\");return t.filter(function(e,t,n){return n.lastIndexOf(e)===t})},Rule}(),Rulesengine=function(){function Rulesengine(e,t,n,i,r,o){var a=this;void 0===o&&(o=[]),this.inputRules=e,this.bomRoot=t,this.name=n,this.version=i,this.schemaVersion=r,this.validateInputs=o,this.usedRules=[],this.usedRuleNames=[],this.iterations=0,this.maxIterations=100,this.rules=[],this.addToBom=addToBom,this.placeBackInQueue=!1,this.runInputValidation(),e.forEach(function(e){a.rules.push(new Rule(e.name,e.code,t,e.behaviour))}),this.calculate()}return Rulesengine.prototype.runInputValidation=function(){var _this=this;this.validateInputs.forEach(function(inputRule){assertValueForPath(_this.bomRoot,getPath(\\"bom.\\"+inputRule),void 0)&&eval(\\"throw new Error('Input \\\\\\"\\"+inputRule+'\\" is missing a value for \\"'+_this.name+'\\": '+JSON.stringify(_this.bomRoot)+\\"')\\")})},Rulesengine.prototype.reset=function(e){var t=this;return this.bomRoot=e,this.usedRules=[],this.usedRuleNames=[],this.rules.forEach(function(n){n.valid=!1,n.bom=e,n.valid!==n.calculate().valid&&n.valid&&-1===t.usedRuleNames.indexOf(n.name)&&(t.usedRules.push(n),t.usedRuleNames.push(n.name))}),this},Rulesengine.prototype.instance=function(e){return new Rulesengine(this.inputRules,e)},Rulesengine.prototype.calculate=function(){var e=this;return this.rules.forEach(function(t){t.valid!==t.calculate().valid&&t.valid&&-1===e.usedRuleNames.indexOf(t.name)&&(e.usedRules.push(t),e.usedRuleNames.push(t.name))}),this},Rulesengine.prototype.run=function(e){var t=this;this.iterations=0;for(var n=new Date,i=\\"\\",r=this.usedRuleNames.toString();i!==r;){if(this.iterations>=this.maxIterations)throw new Error(\\"Max iterations of \\"+this.maxIterations+\\" reached.\\");this.iterations++,this.usedRules.forEach(function(e){try{e.execute(e,t)}catch(n){console.error(e.name+\\" \\"+n+\\" \\"+n.stack),t.bomRoot[e.name]=void 0,t.bomRoot.error=e.name+\\" threw an error: \\"+n.toString()}}),this.calculate(),i=r,r=this.usedRuleNames.toString()}if(e&&e.withStats){var o=new Date;this.bomRoot.engine||(this.bomRoot.engine={});var a={runtime:{version:this.version,schema:this.schemaVersion,executionTime:o.valueOf()-n.valueOf(),runIterations:this.iterations,usedRuleNames:this.usedRuleNames,unusedRules:this.rules.filter(function(e){return!e.valid}).map(function(e){return{name:e.name,missing:e.variables.filter(function(t){return-1===e.usedVariables.indexOf(t)})}})},tableResults:{},conditions:this.bomRoot._conditions};this.bomRoot.engine[this.name]=a;var s=[];this.usedRuleNames.forEach(function(e,n){if(e.indexOf(\\"DecisionTable_\\")>-1&&-1===s.indexOf(e)){s.push(e);var i=getValueForPath(t.bomRoot,getPath(\\"bom.\\"+e));i&&(a.tableResults[e]=i)}})}if(this.usedRuleNames.forEach(function(e,n){e.indexOf(\\"DecisionTable_\\")>-1&&addToBom(t.bomRoot,e,void 0)}),delete this.bomRoot._conditions,this.placeBackInQueue){var u=SafeWorkerFactory.waiting(this);u?u.resolve(this):(SafeWorkerFactory.placeBackInQueue(this),this.placeBackInQueue=!1)}return this.bomRoot},Rulesengine.prototype.mapRun=function(e,t,n){var i=this,r=[],o=t&&getPath(t);return e.forEach(function(e){var t=i.reset(e).run(n);o?r.push(getValueForPath(t,o)):r.push(t)}),r},Rulesengine.prototype.filterRun=function(bomArray,expression,path,configuration){var _this=this,result=[],paths=path&&getPath(path),bom={};return eval(expression),bomArray.forEach(function(bomInput){var bom=_this.reset(bomInput).run(configuration);eval(expression)&&(paths?result.push(getValueForPath(bom,paths)):result.push(bom))}),result},Rulesengine}(),SafeWorkerFactory=function(){function e(){}return e.waiting=function(t){return e.workers[t.name+\\".\\"+t.version].waiting.pop()},e.placeBackInQueue=function(t){try{e.workers[t.name+\\".\\"+t.version].available.unshift(t)}catch(n){console.error(t.name+\\".\\"+t.version+\\" \\"+JSON.stringify(e.workers[t.name+\\".\\"+t.version])+\\" \\"+n)}},e.registerWorkers=function(t,n,i,r){var o=[];e.workers[i+\\".\\"+r]={available:o,waiting:[]};for(var a=0;a<n;a++)o.push(new Rulesengine(t,{},i,r));return e.workers[i+\\".\\"+r]},e.getWorker=function(t,n){return __awaiter(this,void 0,void 0,function(){var i,r;return __generator(this,function(o){switch(o.label){case 0:return i=e.workers[t+\\".\\"+n],(r=i.available.pop())?[3,2]:[4,new Promise(function(e,t){i.waiting.push({resolve:e,reject:t})})];case 1:return[2,o.sent()];case 2:return r.placeBackInQueue=!0,[2,r]}})})},e.workers={},e}();`,
        javaFileTemplate = `package ${packageName};

import javax.script.Bindings;
import javax.script.Invocable;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

public class RulesEngineRunner {
    ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
    Invocable invocable = (Invocable) engine;
    Bindings bindings = engine.getBindings(ScriptContext.ENGINE_SCOPE);
    Integer index;
    String name;
    String rulesVersion;
    public static String version = "1.0";
    public RulesEngineRunner(Integer index, String name, String version, String rules, Object logger) throws ScriptException, NoSuchMethodException {
        bindings.put("stdout", System.out);
        this.index = index;
        this.name = name;
        this.rulesVersion = version;
        engine.eval("function setupLogger(logger) { console = {log: function(msg){logger.info(msg)}, warn: function(msg){logger.warn(msg)}, error: function(msg){logger.error(msg)}} }");
        invocable.invokeFunction("setupLogger", logger);
    
        engine.eval("${rulesEngineCode}");
        engine.eval("getRulesEngine('"+name+"', '"+version+"', "+rules+".rules, '');");
    }
    public String run(String BOM, boolean withStats) throws ScriptException {
        engine.eval("var engine = getRulesEngine('"+name+"', '"+rulesVersion+"');");
        engine.eval("engine.reset("+BOM+");");
        String result = (String)engine.eval("JSON.stringify(engine.run({"+(withStats? "withStats: true" : "")+"}), null, 2);");
        return result;
    }
}`;
    return javaFileTemplate;
};

export const generateRulesEngine = (packageName: string) => {
    const
        javaFileTemplate = `package ${packageName};

    import java.util.concurrent.BlockingQueue;
    import java.util.concurrent.ConcurrentHashMap;
    import java.util.concurrent.ConcurrentMap;
    import java.util.concurrent.LinkedBlockingDeque;

    public class RulesEngine {
        private static final ConcurrentMap<String, BlockingQueue<RulesEngineRunner>> concurrentMap = new ConcurrentHashMap<String, BlockingQueue<RulesEngineRunner>>();
        public static String run(String Rules, String BOM, String Name, String Version, boolean withStats, Object logger) {
        String key = Name + "." + Version;
        try {
            if (!concurrentMap.containsKey(key)) {
                BlockingQueue<RulesEngineRunner> engines = new LinkedBlockingDeque<>();
    
                for (int thread = 0; thread <10; thread++) {
                    RulesEngineRunner runner = new RulesEngineRunner(thread, Name, Version, Rules, logger);
                    engines.put(runner);
                }
                concurrentMap.putIfAbsent(key, engines);
            }
            RulesEngineRunner runner = concurrentMap.get(key).take();

            try {
                String result = runner.run(BOM, withStats);
                return result;
            } finally {
                concurrentMap.get(key).put(runner);
            }

        } catch (Exception e) {
            System.out.println(e);
            return e.getMessage();
        }
    }
}`;
    return javaFileTemplate;
};

