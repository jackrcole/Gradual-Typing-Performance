//// [exportSameNameFuncVar.ts]
export var a = 10;
export function a() {
}

//// [exportSameNameFuncVar.js]
define(["require", "exports"], function (require, exports) {
    exports.a = 10;
    function a() {
    }
    exports.a = a;
});
