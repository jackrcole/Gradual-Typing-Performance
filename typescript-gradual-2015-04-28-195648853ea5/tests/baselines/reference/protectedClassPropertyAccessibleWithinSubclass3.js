//// [protectedClassPropertyAccessibleWithinSubclass3.ts]
class Base {
    protected x: string;
    method() {
        this.x;            // OK, accessed within their declaring class
    }
}

class Derived extends Base {
    method1() {
        this.x;            // OK, accessed within a subclass of the declaring class
        super.x;           // Error, x is not public
    }
}

//// [protectedClassPropertyAccessibleWithinSubclass3.js]
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Base = (function () {
    function Base() {
    }
    Base.prototype.method = function () {
        this.x; // OK, accessed within their declaring class
    };
    return Base;
})();
var Derived = (function (_super) {
    __extends(Derived, _super);
    function Derived() {
        _super.apply(this, arguments);
    }
    Derived.prototype.method1 = function () {
        this.x; // OK, accessed within a subclass of the declaring class
        _super.prototype.x; // Error, x is not public
    };
    return Derived;
})(Base);
