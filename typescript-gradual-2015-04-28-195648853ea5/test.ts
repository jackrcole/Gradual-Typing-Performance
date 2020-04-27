class A {
    constructor(public b: !floatNumber, c: !number) {}
    public f(c: !number) { return this.b + c; }
    public c: !A;
    public d:  A;
    public e: like A;
    public i: !intNumber;
}

class NoConstructor {
    public a: !number;
}

function f(x: !A) {}

var x: !A = new A(42, <any> 57);
var y:  A = x;
x.f(42);
y.f(42);
x.e = x.d;
x.d = x.c;
x.i = x.i + 2;
console.log(x.b);
f(x);
f(<!A> y);

var nc: !NoConstructor = new NoConstructor();

var z = x.f;

var fl: !floatNumber = 3;
x.f(fl);
