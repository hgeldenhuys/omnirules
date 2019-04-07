export function getPath(path: string) {
    const paths = path.split(".").reverse();
    paths.pop();
    paths.reverse();
    return paths;
}

export function addToBom(bom, path, defaultValue: any) {
    const root = bom;
    path = path.replace(/\[\]/g, ".?");
    const paths = getPath(`bom.${path}`);
    let parentNode: any = {};
    let child = "";
    paths.forEach((path) => {
        if (path !== "?") {
            parentNode = bom;
            try {
                if (bom[path] === undefined) {
                    bom[path] = {};
                }
            } catch (e) {
                console.error(`Failed path ${paths}: ${JSON.stringify(root, undefined, 2)}`);
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

export function assertValueForPath(root: {}, paths: string[], testValue) {
    let object = root;
    if (paths.length !== 0) {
        let indexOfArray = paths.indexOf("?");
        indexOfArray = indexOfArray === -1 ? paths.length : indexOfArray;
        const normalPaths = indexOfArray === paths.length ? paths : paths.slice(0, indexOfArray);
        const remainderPaths = indexOfArray === paths.length ? [] : paths.slice(paths.indexOf("?") + 1);
        normalPaths.forEach((path: string) => {
            if (object !== undefined) {
                object = object[path];
            }
        });
        if (object !== undefined) {
            // We have an array
            if (indexOfArray < paths.length) {
                const arr: any[] = object as any[];
                const vals = [];
                arr.forEach((item) => {
                    const arrValue = this.getValueForPath(item, remainderPaths);
                    if (arrValue !== undefined) {
                        vals.push(arrValue);
                    }
                });
                object = vals.length === 0 ? undefined : vals;
            }
        }
        return object + "" === testValue + "";
    }
    return false;
}
