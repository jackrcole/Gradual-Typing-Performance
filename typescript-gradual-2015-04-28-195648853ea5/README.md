# ConcreteTypeScript

This is a modified version of TypeScript which adds safe, concrete types using
the `!` type constructor. Types annotated with `!` are reliable and checked,
while normal TypeScript types are unchecked. Concrete and non-concrete types
may be mixed freely in a single program.

## Concrete types

Classes and primitive types may use the `!` type constructor. On other types,
including arrays, generics and unions, `!` is syntactically accepted but
ignored. Note that `!` binds tightly in type definitions, so `!number[]` is an
array of concrete numbers, not a concrete array of numbers (as concrete arrays
are unsupported regardless).

Concrete types are guaranteed correct at runtime. Because concrete types can be
members of non-concrete types or returns from non-concrete functions and
methods, typechecking can be incurred at the boundary. As such, accessing
members of concrete types can never fail, but accessing concrete members (or
returns) of non-concrete types can.

Classes protect their concrete members, and functions protect their concrete
parameters. This allows for mixing between concrete-aware and
non-concrete-aware code.

## Concrete semantics

`!T <: T`, and `T <: U => !T <: !U`. `undefined <: T` for all `T` including
concrete types, and `null <: T` for all object types T including concrete
object types.

Methods are unwritable in ConcreteTypeScript.

Many builtin operations are modified to evaluate to concrete types when their
JavaScript semantics assures this, including most operators and `new`.

## Numeric types

ConcreteTypeScript adds two numeric types: `floatNumber` and `intNumber`.
`floatNumber`, `intNumber`, `number`, `!floatNumber` and `!number` (but not
`!intNumber`) are all semantically identical, each compiling to JavaScript
numbers, with no checks on the non-concrete variants. `floatNumber` and
`intNumber` are subtypes of `number`. Since all mathematical operations yield
`number` or `!number`, the `floatNumber` and `intNumber` types are easily lost
and act principally as hints for the optimizer.

`!intNumber` does affect semantics, unlike the others: When a value is casted
to an `!intNumber`, whether through an explicit cast (`<!intNumber>`) or
implicit cast of assigning to an `!intNumber`-typed variable, parameter or
field, it will be coerced to a 32-bit integer, with the semantics of the
often-used double-negation in JavaScript, e.g. `~~(value)`. Since `!intNumber`
are assuredly always ints, an optimizer may be able to avoid checks of their
type, which is particularly important for e.g. indexing arrays.

## TypeScript

The complete, original README.md is included below, but note that many of the
links are irrelevant to this fork.

# TypeScript

[![Build Status](https://travis-ci.org/Microsoft/TypeScript.svg?branch=master)](https://travis-ci.org/Microsoft/TypeScript)
[![Issue Stats](http://issuestats.com/github/Microsoft/TypeScript/badge/pr)](http://issuestats.com/github/microsoft/typescript)
[![Issue Stats](http://issuestats.com/github/Microsoft/TypeScript/badge/issue)](http://issuestats.com/github/microsoft/typescript)

# TypeScript

[TypeScript](http://www.typescriptlang.org/) is a language for application-scale JavaScript. TypeScript adds optional types, classes, and modules to JavaScript. TypeScript supports tools for large-scale JavaScript applications for any browser, for any host, on any OS. TypeScript compiles to readable, standards-based JavaScript. Try it out at the [playground](http://www.typescriptlang.org/Playground), and stay up to date via [our blog](http://blogs.msdn.com/typescript) and [twitter account](https://twitter.com/typescriptlang).


## Contribute

There are many ways to [contribute](https://github.com/Microsoft/TypeScript/blob/master/CONTRIBUTING.md) to TypeScript.
* [Submit bugs](https://github.com/Microsoft/TypeScript/issues) and help us verify fixes as they are checked in.
* Review the [source code changes](https://github.com/Microsoft/TypeScript/pulls).
* Engage with other TypeScript users and developers on [StackOverflow](http://stackoverflow.com/questions/tagged/typescript). 
* Join the [#typescript](http://twitter.com/#!/search/realtime/%23typescript) discussion on Twitter.
* [Contribute bug fixes](https://github.com/Microsoft/TypeScript/blob/master/CONTRIBUTING.md).
* Read the language specification ([docx](http://go.microsoft.com/fwlink/?LinkId=267121), [pdf](http://go.microsoft.com/fwlink/?LinkId=267238)).


## Documentation

*  [Quick tutorial](http://www.typescriptlang.org/Tutorial)
*  [Programming handbook](http://www.typescriptlang.org/Handbook)
*  [Language specification](https://github.com/Microsoft/TypeScript/blob/master/doc/spec.md)
*  [Homepage](http://www.typescriptlang.org/)

## Building

In order to build the TypeScript compiler, ensure that you have [Git](http://git-scm.com/downloads) and [Node.js](http://nodejs.org/) installed.

Clone a copy of the repo:

```
git clone https://github.com/Microsoft/TypeScript.git
```

Change to the TypeScript directory:

```
cd TypeScript
```

Install Jake tools and dev dependencies:

```
npm install -g jake
npm install
```

Use one of the following to build and test:

```
jake local            # Build the compiler into built/local 
jake clean            # Delete the built compiler 
jake LKG              # Replace the last known good with the built one.
                      # Bootstrapping step to be executed when the built compiler reaches a stable state.
jake tests            # Build the test infrastructure using the built compiler. 
jake runtests         # Run tests using the built compiler and test infrastructure. 
                      # You can override the host or specify a test for this command. 
                      # Use host=<hostName> or tests=<testPath>. 
jake runtests-browser # Runs the tests using the built run.js file. Syntax is jake runtests. Optional
                        parameters 'host=', 'tests=[regex], reporter=[list|spec|json|<more>]'.
jake baseline-accept  # This replaces the baseline test results with the results obtained from jake runtests. 
jake -T               # List the above commands. 
```


## Usage

```shell
node built/local/tsc.js hello.ts
```


## Roadmap

For details on our planned features and future direction please refer to our [roadmap](https://github.com/Microsoft/TypeScript/wiki/Roadmap).
