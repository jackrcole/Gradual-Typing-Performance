//// [internalAliasEnumInsideLocalModuleWithoutExport.ts]
export module a {
    export enum weekend {
        Friday,
        Saturday,
        Sunday
    }
}

export module c {
    import b = a.weekend;
    export var bVal: b = b.Sunday;
}


//// [internalAliasEnumInsideLocalModuleWithoutExport.js]
var a;
(function (a) {
    (function (weekend) {
        weekend[weekend["Friday"] = 0] = "Friday";
        weekend[weekend["Saturday"] = 1] = "Saturday";
        weekend[weekend["Sunday"] = 2] = "Sunday";
    })(a.weekend || (a.weekend = {}));
    var weekend = a.weekend;
})(a = exports.a || (exports.a = {}));
var c;
(function (c) {
    var b = a.weekend;
    c.bVal = 2 /* Sunday */;
})(c = exports.c || (exports.c = {}));


//// [internalAliasEnumInsideLocalModuleWithoutExport.d.ts]
export declare module a {
    enum weekend {
        Friday = 0,
        Saturday = 1,
        Sunday = 2,
    }
}
export declare module c {
    import b = a.weekend;
    var bVal: b;
}
