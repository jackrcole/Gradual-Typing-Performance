//// [classConstructorParametersAccessibility3.ts]
class Base {
    constructor(protected p: number) { }
}

class Derived extends Base {
    constructor(public p: number) {
        super(p);
        this.p; // OK
    }
}

var d: Derived;
d.p;  // public, OK

//// [classConstructorParametersAccessibility3.js]
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Base = (function () {
    function Base(p) {
        this.p = p;
    }
    return Base;
})();
var Derived = (function (_super) {
    __extends(Derived, _super);
    function Derived(p) {
        _super.call(this, p);
        this.p = p;
        this.p; // OK
    }
    return Derived;
})(Base);
var d;
d.p; // public, OK
