// In the true expression of a conditional expression, 
// the type of a variable or parameter is narrowed by any type guard in the condition when true, 
// provided the true expression contains no assignments to the variable or parameter.
// In the false expression of a conditional expression, 
// the type of a variable or parameter is narrowed by any type guard in the condition when false, 
// provided the false expression contains no assignments to the variable or parameter.

function foo(x: number | string) {
    return typeof x === "string"
        ? x.length // string
        : x++; // number
}
function foo2(x: number | string) {
    // x is assigned in the if true branch, the type is not narrowed
    return typeof x === "string"
        ? (x = 10 && x)// string | number
        : x; // string | number
}
function foo3(x: number | string) {
    // x is assigned in the if false branch, the type is not narrowed
    // even though assigned using same type as narrowed expression
    return typeof x === "string"
        ? (x = "Hello" && x) // string | number
        : x; // string | number
}
function foo4(x: number | string) {
    // false branch updates the variable - so here it is not number
    // even though assigned using same type as narrowed expression
    return typeof x === "string"
        ? x // string | number
        : (x = 10 && x); // string | number
}
function foo5(x: number | string) {
    // false branch updates the variable - so here it is not number
    return typeof x === "string"
        ? x // string | number
        : (x = "hello" && x); // string | number
}
function foo6(x: number | string) {
    // Modify in both branches
    return typeof x === "string"
        ? (x = 10 && x) // string | number
        : (x = "hello" && x); // string | number
}
function foo7(x: number | string | boolean) {
    return typeof x === "string"
        ? x === "hello" // string
        : typeof x === "boolean"
        ? x // boolean
        : x == 10; // number
}
function foo8(x: number | string | boolean) {
    var b: number | boolean;
    return typeof x === "string"
        ? x === "hello"
        : ((b = x) && //  number | boolean
        (typeof x === "boolean"
        ? x // boolean
        : x == 10)); // number
}
function foo9(x: number | string) {
    var y = 10;
    // usage of x or assignment to separate variable shouldn't cause narrowing of type to stop
    return typeof x === "string"
        ? ((y = x.length) && x === "hello") // string
        : x === 10; // number
}
function foo10(x: number | string | boolean) {
    // Mixing typeguards
    var b: boolean | number;
    return typeof x === "string"
        ? x // string
        : ((b = x) // x is number | boolean
        && typeof x === "number"
        && x.toString()); // x is number
}
function foo11(x: number | string | boolean) {
    // Mixing typeguards
    // Assigning value to x deep inside another guard stops narrowing of type too
    var b: number | boolean | string;
    return typeof x === "string"
        ? x // number | boolean | string - changed in the false branch
        : ((b = x) // x is number | boolean | string - because the assignment changed it
        && typeof x === "number"
        && (x = 10) // assignment to x
        && x); // x is number | boolean | string
}
function foo12(x: number | string | boolean) {
    // Mixing typeguards
    // Assigning value to x in outer guard shouldn't stop narrowing in the inner expression
    var b: number | boolean | string;
    return typeof x === "string"
        ? (x = 10 && x.toString().length) // number | boolean | string - changed here
        : ((b = x) // x is number | boolean | string  - changed in true branch
        && typeof x === "number"
        && x); // x is number
}