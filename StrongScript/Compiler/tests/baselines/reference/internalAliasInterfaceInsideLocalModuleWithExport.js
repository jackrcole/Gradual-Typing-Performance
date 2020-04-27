//// [internalAliasInterfaceInsideLocalModuleWithExport.ts]
export module a {
    export interface I {
    }
}

export module c {
    export import b = a.I;
    export var x: b;
}


//// [internalAliasInterfaceInsideLocalModuleWithExport.js]
define(["require", "exports"], function (require, exports) {
    var c;
    (function (c) {
        c.x;
    })(c = exports.c || (exports.c = {}));
});


//// [internalAliasInterfaceInsideLocalModuleWithExport.d.ts]
export declare module a {
    interface I {
    }
}
export declare module c {
    export import b = a.I;
    var x: b;
}
