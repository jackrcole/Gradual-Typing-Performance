﻿/// <reference path='fourslash.ts' />

//// var /*valueDeclaration1*/name = "hello";
//// var /*valueDeclaration2*/id = 100000;
//// declare var /*valueDeclaration3*/id;
//// var obj = {/*valueDefinition1*/name, /*valueDefinition2*/id};
//// obj./*valueReference1*/name;
//// obj./*valueReference2*/id;

goTo.marker("valueDefinition1");
goTo.definition();
verify.caretAtMarker("valueDeclaration1");

goTo.marker("valueDefinition2");
goTo.definition(0);
verify.caretAtMarker("valueDeclaration2");
goTo.definition(1);
verify.caretAtMarker("valueDeclaration3");

goTo.marker("valueReference1");
goTo.definition();
verify.caretAtMarker("valueDefinition1");
goTo.marker("valueReference2");
goTo.definition();
verify.caretAtMarker("valueDefinition2");
