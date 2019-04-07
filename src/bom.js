"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getPath(path) {
    var paths = path.split(".").reverse();
    paths.pop();
    paths.reverse();
    return paths;
}
exports.getPath = getPath;
function addToBom(bom, path, defaultValue) {
    var root = bom;
    path = path.replace(/\[\]/g, ".?");
    var paths = getPath("bom." + path);
    var parentNode = {};
    var child = "";
    paths.forEach(function (path) {
        if (path !== "?") {
            parentNode = bom;
            try {
                if (bom[path] === undefined) {
                    bom[path] = {};
                }
            }
            catch (e) {
                console.error("Failed path " + paths + ": " + JSON.stringify(root, undefined, 2));
                throw e;
            }
            bom = bom[path];
        }
        else {
            if (parentNode[child][0] === undefined) {
                parentNode[child] = [{}];
            }
            bom = parentNode[child][0];
            parentNode = bom;
        }
        child = path;
    });
    if (defaultValue !== undefined) {
        parentNode[child] = defaultValue;
        if (child === "?") {
            parentNode[child] = undefined;
        }
    }
    else {
        delete parentNode[child];
    }
    return root;
}
exports.addToBom = addToBom;
function assertValueForPath(root, paths, testValue) {
    var _this = this;
    var object = root;
    if (paths.length !== 0) {
        var indexOfArray = paths.indexOf("?");
        indexOfArray = indexOfArray === -1 ? paths.length : indexOfArray;
        var normalPaths = indexOfArray === paths.length ? paths : paths.slice(0, indexOfArray);
        var remainderPaths_1 = indexOfArray === paths.length ? [] : paths.slice(paths.indexOf("?") + 1);
        normalPaths.forEach(function (path) {
            if (object !== undefined) {
                object = object[path];
            }
        });
        if (object !== undefined) {
            if (indexOfArray < paths.length) {
                var arr = object;
                var vals_1 = [];
                arr.forEach(function (item) {
                    var arrValue = _this.getValueForPath(item, remainderPaths_1);
                    if (arrValue !== undefined) {
                        vals_1.push(arrValue);
                    }
                });
                object = vals_1.length === 0 ? undefined : vals_1;
            }
        }
        return object + "" === testValue + "";
    }
    return false;
}
exports.assertValueForPath = assertValueForPath;
//# sourceMappingURL=bom.js.map