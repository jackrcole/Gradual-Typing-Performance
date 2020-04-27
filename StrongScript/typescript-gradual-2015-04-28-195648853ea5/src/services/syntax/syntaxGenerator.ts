///<reference path='..\..\compiler\sys.ts' />
///<reference path='..\..\services\core\arrayUtilities.ts' />
///<reference path='..\..\services\core\stringUtilities.ts' />
///<reference path='syntaxFacts.ts' />
///<reference path='syntaxKind.ts' />
// ///<reference path='..\..\..\tests\fidelity\es5compat.ts' />
 
var forPrettyPrinter = false;

interface ITypeDefinition {
    name: string;
    baseType: string;
    interfaces?: string[];
    children: IMemberDefinition[];
    isTypeScriptSpecific: boolean;
}

interface IMemberDefinition {
    name: string;
    type?: string;
    isToken?: boolean;
    isList?: boolean;
    isSeparatedList?: boolean;
    requiresAtLeastOneItem?: boolean;
    isOptional?: boolean;
    isTypeScriptSpecific: boolean;
    elementType?: string;
}

var interfaces: any = {
    IMemberDeclarationSyntax: 'IClassElementSyntax',
    IStatementSyntax: 'IModuleElementSyntax',
    INameSyntax: 'ITypeSyntax',
    IUnaryExpressionSyntax: 'IExpressionSyntax',
    IPostfixExpressionSyntax: 'IUnaryExpressionSyntax',
    ILeftHandSideExpressionSyntax: 'IPostfixExpressionSyntax',
    // Note: for simplicity's sake, we merge CallExpression, NewExpression and MemberExpression 
    // into IMemberExpression.
    IMemberExpressionSyntax: 'ILeftHandSideExpressionSyntax',
    ICallExpressionSyntax: 'ILeftHandSideExpressionSyntax',
    IPrimaryExpressionSyntax: 'IMemberExpressionSyntax',
};

var definitions: ITypeDefinition[] = [
    <any>{
        name: 'SourceUnitSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'moduleElements', isList: true, elementType: 'IModuleElementSyntax' },
            <any>{ name: 'endOfFileToken', isToken: true }
        ]
    },
    <any>{
        name: 'ExternalModuleReferenceSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IModuleReferenceSyntax'],
        children: [
            <any>{ name: 'requireKeyword', isToken: true },
            <any>{ name: 'openParenToken', isToken: true },
            <any>{ name: 'expression', type: 'IExpressionSyntax' },
            <any>{ name: 'closeParenToken', isToken: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ModuleNameModuleReferenceSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IModuleReferenceSyntax'],
        children: [
            <any>{ name: 'moduleName', type: 'INameSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ImportDeclarationSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IModuleElementSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken' },
            <any>{ name: 'importKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'identifier', isToken: true },
            <any>{ name: 'equalsToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'moduleReference', type: 'IModuleReferenceSyntax' },
            <any>{ name: 'semicolonToken', isToken: true, isOptional: true, excludeFromAST: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ExportAssignmentSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IModuleElementSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken' },
            <any>{ name: 'exportKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'equalsToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'identifier', isToken: true },
            <any>{ name: 'semicolonToken', isToken: true, isOptional: true, excludeFromAST: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ClassDeclarationSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IModuleElementSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken' },
            <any>{ name: 'classKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'identifier', isToken: true },
            <any>{ name: 'typeParameterList', type: 'TypeParameterListSyntax', isOptional: true },
            <any>{ name: 'heritageClauses', isList: true, elementType: 'HeritageClauseSyntax' },
            <any>{ name: 'openBraceToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'classElements', isList: true, elementType: 'IClassElementSyntax' },
            <any>{ name: 'closeBraceToken', isToken: true, excludeFromAST: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'InterfaceDeclarationSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IModuleElementSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken' },
            <any>{ name: 'interfaceKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'identifier', isToken: true },
            <any>{ name: 'typeParameterList', type: 'TypeParameterListSyntax', isOptional: true },
            <any>{ name: 'heritageClauses', isList: true, elementType: 'HeritageClauseSyntax' },
            <any>{ name: 'body', type: 'ObjectTypeSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any> {
        name: 'HeritageClauseSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'extendsOrImplementsKeyword', isToken: true },
            <any>{ name: 'typeNames', isSeparatedList: true, requiresAtLeastOneItem: true, elementType: 'INameSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ModuleDeclarationSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IModuleElementSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken' },
            <any>{ name: 'moduleKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'name', type: 'INameSyntax' },
            <any>{ name: 'openBraceToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'moduleElements', isList: true, elementType: 'IModuleElementSyntax' },
            <any>{ name: 'closeBraceToken', isToken: true, excludeFromAST: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'TypeAliasSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IModuleElementSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken' },
            <any>{ name: 'typeKeyword', isToken: true },
            <any>{ name: 'identifier', isToken: true },
            <any>{ name: 'equalsToken', isToken: true },
            <any>{ name: 'type', type: 'ITypeSyntax' },
            <any>{ name: 'semicolonToken', isToken: true, isOptional: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'FunctionDeclarationSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken', isTypeScriptSpecific: true },
            <any>{ name: 'functionKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'asterixToken', isToken: true, isOptional: true },
            <any>{ name: 'identifier', isToken: true },
            <any>{ name: 'callSignature', type: 'CallSignatureSyntax' },
            <any>{ name: 'body', type: 'BlockSyntax | ExpressionBody | ISyntaxToken', isOptional: true }
        ]
    },
    <any> {
        name: 'ExpressionBody',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'equalsGreaterThanToken', isToken: true, },
            <any>{ name: 'expression', type: 'IExpressionSyntax' }
        ]
    },
    <any>{
        name: 'VariableStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken', isTypeScriptSpecific: true },
            <any>{ name: 'variableDeclaration', type: 'VariableDeclarationSyntax' },
            <any>{ name: 'semicolonToken', isToken: true, isOptional: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'VariableDeclarationSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'varConstOrLetKeyword', isToken: true },
            <any>{ name: 'variableDeclarators', isSeparatedList: true, requiresAtLeastOneItem: true, elementType: 'VariableDeclaratorSyntax' }
        ]
    },
    <any>{
        name: 'VariableDeclaratorSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'propertyName', type: 'IPropertyNameSyntax' },
            <any>{ name: 'typeAnnotation', type: 'TypeAnnotationSyntax', isOptional: true, isTypeScriptSpecific: true },
            <any>{ name: 'equalsValueClause', type: 'EqualsValueClauseSyntax', isOptional: true }
        ]
    },
    <any>{
        name: 'EqualsValueClauseSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'equalsToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'value', type: 'IExpressionSyntax' }
        ]
    },
    <any>{
        name: 'PrefixUnaryExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IUnaryExpressionSyntax'],
        children: [
            <any>{ name: 'operatorToken', isToken: true },
            <any>{ name: 'operand', type: 'IUnaryExpressionSyntax' }
        ],
    },
    <any>{
        name: 'ArrayLiteralExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IPrimaryExpressionSyntax'],
        children: [
            <any>{ name: 'openBracketToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'expressions', isSeparatedList: true, elementType: 'IExpressionSyntax' },
            <any>{ name: 'closeBracketToken', isToken: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'OmittedExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IExpressionSyntax'],
        children: <any>[]
    },
    <any>{
        name: 'ParenthesizedExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IPrimaryExpressionSyntax'],
        children: [
            <any>{ name: 'openParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'expression', type: 'IExpressionSyntax' },
            <any>{ name: 'closeParenToken', isToken: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'SimpleArrowFunctionExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IUnaryExpressionSyntax'],
        children: [
            <any>{ name: 'asyncKeyword', isToken: true, isOptional: true },
            <any>{ name: 'parameter', type: 'ParameterSyntax' },
            <any>{ name: 'equalsGreaterThanToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'body', type: 'BlockSyntax | IExpressionSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ParenthesizedArrowFunctionExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IUnaryExpressionSyntax'],
        children: [
            <any>{ name: 'asyncKeyword', isToken: true, isOptional: true },
            <any>{ name: 'callSignature', type: 'CallSignatureSyntax' },
            <any>{ name: 'equalsGreaterThanToken', isToken: true, isOptional: true },
            <any>{ name: 'body', type: 'BlockSyntax | IExpressionSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'QualifiedNameSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['INameSyntax'],
        children: [
            <any>{ name: 'left', type: 'INameSyntax' },
            <any>{ name: 'dotToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'right', isToken: true }
        ],
        // Qualified names only show up in Types, which are TypeScript specific. Note that a dotted
        // expression (like A.B.Foo()) is a MemberAccessExpression, not a QualifiedName.
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'TypeArgumentListSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'lessThanToken', isToken: true },
            <any>{ name: 'typeArguments', isSeparatedList: true, elementType: 'ITypeSyntax' },
            <any>{ name: 'greaterThanToken', isToken: true, excludeFromAST: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ConstructorTypeSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeSyntax'],
        children: [
            <any>{ name: 'newKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'typeParameterList', type: 'TypeParameterListSyntax', isOptional: true },
            <any>{ name: 'parameterList', type: 'ParameterListSyntax' },
            <any>{ name: 'equalsGreaterThanToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'type', type: 'ITypeSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'FunctionTypeSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeSyntax'],
        children: [
            <any>{ name: 'typeParameterList', type: 'TypeParameterListSyntax', isOptional: true },
            <any>{ name: 'parameterList', type: 'ParameterListSyntax' },
            <any>{ name: 'equalsGreaterThanToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'type', type: 'ITypeSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ObjectTypeSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeSyntax'],
        children: [
            <any>{ name: 'openBraceToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'typeMembers', isList: true, elementType: 'ITypeMemberSyntax' },
            <any>{ name: 'closeBraceToken', isToken: true, excludeFromAST: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ArrayTypeSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeSyntax'],
        children: [
            <any>{ name: 'type', type: 'ITypeSyntax' },
            <any>{ name: 'openBracketToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'closeBracketToken', isToken: true, excludeFromAST: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'GenericTypeSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeSyntax'],
        children: [
            <any>{ name: 'name', type: 'INameSyntax' },
            <any>{ name: 'typeArgumentList', type: 'TypeArgumentListSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any> {
        name: 'TypeQuerySyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeSyntax'],
        children: [
            <any>{ name: 'typeOfKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'name', type: 'INameSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any> {
        name: 'TupleTypeSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeSyntax'],
        children: [
            <any>{ name: 'openBracketToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'types', isSeparatedList: true, elementType: 'ITypeSyntax' },
            <any>{ name: 'closeBracketToken', isToken: true, excludeFromAST: true }
        ],
        isTypeScriptSpecific: true
    },
    <any> {
        name: 'UnionTypeSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeSyntax'],
        children: [
            <any>{ name: 'left', type: 'ITypeSyntax' },
            <any>{ name: 'barToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'right', type: 'ITypeSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any> {
        name: 'ParenthesizedTypeSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeSyntax'],
        children: [
            <any>{ name: 'openParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'type', type: 'ITypeSyntax' },
            <any>{ name: 'closeParenToken', isToken: true, excludeFromAST: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'TypeAnnotationSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'colonToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'type', type: 'ITypeSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'BlockSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'equalsGreaterThanToken', isToken: true, isOptional: 'true' },
            <any>{ name: 'openBraceToken', isToken: true, },
            <any>{ name: 'statements', isList: true, elementType: 'IStatementSyntax' },
            <any>{ name: 'closeBraceToken', isToken: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'ParameterSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'dotDotDotToken', isToken: true, isOptional: true, isTypeScriptSpecific: true },
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken' },
            <any>{ name: 'identifier', isToken: true },
            <any>{ name: 'questionToken', isToken: true, isOptional: true, isTypeScriptSpecific: true },
            <any>{ name: 'typeAnnotation', type: 'TypeAnnotationSyntax', isOptional: true, isTypeScriptSpecific: true },
            <any>{ name: 'equalsValueClause', type: 'EqualsValueClauseSyntax', isOptional: true, isTypeScriptSpecific: true }
        ]
    },
    <any>{
        name: 'PropertyAccessExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IMemberExpressionSyntax', 'ICallExpressionSyntax'],
        children: [
            <any>{ name: 'expression', type: 'ILeftHandSideExpressionSyntax' },
            <any>{ name: 'dotToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'name', isToken: true }
        ]
    },
    <any>{
        name: 'PostfixUnaryExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IPostfixExpressionSyntax'],
        children: [
            <any>{ name: 'operand', type: 'ILeftHandSideExpressionSyntax' },
            <any>{ name: 'operatorToken', isToken: true }
        ],
    },
    <any>{
        name: 'ElementAccessExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IMemberExpressionSyntax', 'ICallExpressionSyntax'],
        children: [
            <any>{ name: 'expression', type: 'ILeftHandSideExpressionSyntax' },
            <any>{ name: 'openBracketToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'argumentExpression', type: 'IExpressionSyntax', isOptional: true },
            <any>{ name: 'closeBracketToken', isToken: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'TemplateAccessExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IMemberExpressionSyntax', 'ICallExpressionSyntax'],
        children: [
            <any>{ name: 'expression', type: 'ILeftHandSideExpressionSyntax' },
            <any>{ name: 'templateExpression', type: 'IPrimaryExpressionSyntax' }
        ]
    },
    <any>{
        name: 'TemplateExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IPrimaryExpressionSyntax'],
        children: [
            <any>{ name: 'templateStartToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'templateClauses', isList: true, elementType: 'TemplateClauseSyntax' }
        ]
    },
    <any>{
        name: 'TemplateClauseSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'expression', type: 'IExpressionSyntax' },
            <any>{ name: 'templateMiddleOrEndToken', isToken: true, elementType: 'TemplateSpanSyntax' }
        ]
    },
    <any>{
        name: 'InvocationExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ICallExpressionSyntax'],
        children: [
            <any>{ name: 'expression', type: 'ILeftHandSideExpressionSyntax' },
            <any>{ name: 'argumentList', type: 'ArgumentListSyntax' }
        ]
    },
    <any>{
        name: 'ArgumentListSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'typeArgumentList', type: 'TypeArgumentListSyntax', isOptional: true },
            <any>{ name: 'openParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'arguments', isSeparatedList: true, elementType: 'IExpressionSyntax' },
            <any>{ name: 'closeParenToken', isToken: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'BinaryExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IExpressionSyntax'],
        children: [
            <any>{ name: 'left', type: 'IExpressionSyntax' },
            <any>{ name: 'operatorToken', isToken: true },
            <any>{ name: 'right', type: 'IExpressionSyntax' }
        ],
    },
    <any>{
        name: 'ConditionalExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IExpressionSyntax'],
        children: [
            <any>{ name: 'condition', type: 'IExpressionSyntax' },
            <any>{ name: 'questionToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'whenTrue', type: 'IExpressionSyntax' },
            <any>{ name: 'colonToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'whenFalse', type: 'IExpressionSyntax' }
        ]
    },
    <any>{
        name: 'ConstructSignatureSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeMemberSyntax'],
        children: [
            <any>{ name: 'newKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'callSignature', type: 'CallSignatureSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'MethodSignatureSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeMemberSyntax'],
        children: [
            <any>{ name: 'propertyName', type: 'IPropertyNameSyntax' },
            <any>{ name: 'questionToken', isToken: true, isOptional: true, itTypeScriptSpecific: true },
            <any>{ name: 'callSignature', type: 'CallSignatureSyntax' }
        ]
    },
    <any>{
        name: 'IndexSignatureSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeMemberSyntax', 'IClassElementSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken' },
            <any>{ name: 'openBracketToken', isToken: true },
            <any>{ name: 'parameters', isSeparatedList: true, elementType: 'ParameterSyntax' },
            <any>{ name: 'closeBracketToken', isToken: true },
            <any>{ name: 'typeAnnotation', type: 'TypeAnnotationSyntax', isOptional: true },
            <any>{ name: 'semicolonOrCommaToken', isToken: true, isOptional: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'PropertySignatureSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeMemberSyntax'],
        children: [
            <any>{ name: 'propertyName', type: 'IPropertyNameSyntax' },
            <any>{ name: 'questionToken', isToken: true, isOptional: true },
            <any>{ name: 'typeAnnotation', type: 'TypeAnnotationSyntax', isOptional: true },
            <any>{ name: 'semicolonOrCommaToken', isToken: true, isOptional: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'CallSignatureSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ITypeMemberSyntax'],
        children: [
            <any>{ name: 'typeParameterList', type: 'TypeParameterListSyntax', isOptional: true, isTypeScriptSpecific: true },
            <any>{ name: 'parameterList', type: 'ParameterListSyntax' },
            <any>{ name: 'typeAnnotation', type: 'TypeAnnotationSyntax', isOptional: true, isTypeScriptSpecific: true },
            <any>{ name: 'semicolonOrCommaToken', isToken: true, isOptional: true }
        ]
    },
    <any>{
        name: 'ParameterListSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'openParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'parameters', isSeparatedList: true, elementType: 'ParameterSyntax' },
            <any>{ name: 'closeParenToken', isToken: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'TypeParameterListSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'lessThanToken', isToken: true },
            <any>{ name: 'typeParameters', isSeparatedList: true, elementType: 'TypeParameterSyntax' },
            <any>{ name: 'greaterThanToken', isToken: true, excludeFromAST: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'TypeParameterSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'identifier', isToken: true },
            <any>{ name: 'constraint', type: 'ConstraintSyntax', isOptional: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ConstraintSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'extendsKeyword', isToken: true, excludeFromAST: true },
            // Expression only in error cases.
            <any>{ name: 'typeOrExpression', type: 'ISyntaxNodeOrToken' }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ElseClauseSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'elseKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'statement', type: 'IStatementSyntax' }
        ]
    },
    <any>{
        name: 'IfStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'ifKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'openParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'condition', type: 'IExpressionSyntax' },
            <any>{ name: 'closeParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'statement', type: 'IStatementSyntax' },
            <any>{ name: 'elseClause', type: 'ElseClauseSyntax', isOptional: true }
        ]
    },
    <any>{
        name: 'ExpressionStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'expression', type: 'IExpressionSyntax' },
            <any>{ name: 'semicolonToken', isToken: true, isOptional: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'ConstructorDeclarationSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IClassElementSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken' },
            <any>{ name: 'constructorKeyword', isToken: true },
            <any>{ name: 'callSignature', type: 'CallSignatureSyntax' },
            <any>{ name: 'body', type: 'BlockSyntax | ExpressionBody | ISyntaxToken', isOptional: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'MethodDeclarationSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IMemberDeclarationSyntax', 'IPropertyAssignmentSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken' },
            <any>{ name: 'asterixToken', isToken: true, isOptional: true },
            <any>{ name: 'propertyName', type: 'IPropertyNameSyntax' },
            <any>{ name: 'callSignature', type: 'CallSignatureSyntax' },
            <any>{ name: 'body', type: 'BlockSyntax | ExpressionBody | ISyntaxToken', isOptional: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'GetAccessorSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IAccessorSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken', isTypeScriptSpecific: true },
            <any>{ name: 'getKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'propertyName', type: 'IPropertyNameSyntax' },
            <any>{ name: 'callSignature', type: 'CallSignatureSyntax' },
            <any>{ name: 'body', type: 'BlockSyntax | ExpressionBody | ISyntaxToken', isOptional: true }
        ]
    },
    <any>{
        name: 'SetAccessorSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IAccessorSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken', isTypeScriptSpecific: true },
            <any>{ name: 'setKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'propertyName', type: 'IPropertyNameSyntax' },
            <any>{ name: 'callSignature', type: 'CallSignatureSyntax' },
            <any>{ name: 'body', type: 'BlockSyntax | ExpressionBody | ISyntaxToken', isOptional: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'PropertyDeclarationSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IMemberDeclarationSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken' },
            <any>{ name: 'variableDeclarator', type: 'VariableDeclaratorSyntax' },
            <any>{ name: 'semicolonToken', isToken: true, isOptional: true, excludeFromAST: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ThrowStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'throwKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'expression', type: 'IExpressionSyntax', isOptional: true },
            <any>{ name: 'semicolonToken', isToken: true, isOptional: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'ReturnStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'returnKeyword', isToken: true },
            <any>{ name: 'expression', type: 'IExpressionSyntax', isOptional: true },
            <any>{ name: 'semicolonToken', isToken: true, isOptional: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'ObjectCreationExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IPrimaryExpressionSyntax'],
        children: [
            <any>{ name: 'newKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'expression', type: 'IMemberExpressionSyntax' },
            <any>{ name: 'argumentList', type: 'ArgumentListSyntax', isOptional: true }
        ]
    },
    <any>{
        name: 'SwitchStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'switchKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'openParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'expression', type: 'IExpressionSyntax' },
            <any>{ name: 'closeParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'openBraceToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'switchClauses', isList: true, elementType: 'ISwitchClauseSyntax' },
            <any>{ name: 'closeBraceToken', isToken: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'CaseSwitchClauseSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ISwitchClauseSyntax'],
        children: [
            <any>{ name: 'caseKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'expression', type: 'IExpressionSyntax' },
            <any>{ name: 'colonToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'statements', isList: true, elementType: 'IStatementSyntax' }
        ]
    },
    <any>{
        name: 'DefaultSwitchClauseSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['ISwitchClauseSyntax'],
        children: [
            <any>{ name: 'defaultKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'colonToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'statements', isList: true, elementType: 'IStatementSyntax' }
        ]
    },
    <any>{
        name: 'BreakStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'breakKeyword', isToken: true },
            <any>{ name: 'identifier', isToken: true, isOptional: true },
            <any>{ name: 'semicolonToken', isToken: true, isOptional: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'ContinueStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'continueKeyword', isToken: true },
            <any>{ name: 'identifier', isToken: true, isOptional: true },
            <any>{ name: 'semicolonToken', isToken: true, isOptional: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'ForStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'forKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'openParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'initializer', type: 'VariableDeclarationSyntax | IExpressionSyntax', isOptional: true },
            <any>{ name: 'firstSemicolonToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'condition', type: 'IExpressionSyntax', isOptional: true },
            <any>{ name: 'secondSemicolonToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'incrementor', type: 'IExpressionSyntax', isOptional: true },
            <any>{ name: 'closeParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'statement', type: 'IStatementSyntax' }
        ]
    },
    <any>{
        name: 'ForInStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'forKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'openParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'left', type: 'VariableDeclarationSyntax | IExpressionSyntax' },
            <any>{ name: 'inKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'right', type: 'IExpressionSyntax' },
            <any>{ name: 'closeParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'statement', type: 'IStatementSyntax' }
        ]
    },
    <any>{
        name: 'WhileStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'whileKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'openParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'condition', type: 'IExpressionSyntax' },
            <any>{ name: 'closeParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'statement', type: 'IStatementSyntax' }
        ]
    },
    <any>{
        name: 'WithStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'withKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'openParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'condition', type: 'IExpressionSyntax' },
            <any>{ name: 'closeParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'statement', type: 'IStatementSyntax' }
        ]
    },
    <any>{
        name: 'EnumDeclarationSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IModuleElementSyntax'],
        children: [
            <any>{ name: 'modifiers', isList: true, elementType: 'ISyntaxToken' },
            <any>{ name: 'enumKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'identifier', isToken: true },
            <any>{ name: 'openBraceToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'enumElements', isSeparatedList: true, elementType: 'EnumElementSyntax' },
            <any>{ name: 'closeBraceToken', isToken: true, excludeFromAST: true }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'EnumElementSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'propertyName', type: 'IPropertyNameSyntax' },
            <any>{ name: 'equalsValueClause', type: 'EqualsValueClauseSyntax', isOptional: true }
        ]
    },
    <any>{
        name: 'TypeAssertionExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IUnaryExpressionSyntax'],
        children: [
            <any>{ name: 'lessThanToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'type', type: 'ITypeSyntax' },
            <any>{ name: 'greaterThanToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'expression', type: 'IUnaryExpressionSyntax' }
        ],
        isTypeScriptSpecific: true
    },
    <any>{
        name: 'ObjectLiteralExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IPrimaryExpressionSyntax'],
        children: [
            <any>{ name: 'openBraceToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'propertyAssignments', isSeparatedList: true, elementType: 'IPropertyAssignmentSyntax' },
            <any>{ name: 'closeBraceToken', isToken: true, excludeFromAST: true }
        ]
    },
    <any>{
        name: 'ComputedPropertyNameSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IPropertyNameSyntax'],
        children: [
            <any>{ name: 'openBracketToken', isToken: true },
            <any>{ name: 'expression', type: 'IExpressionSyntax' },
            <any>{ name: 'closeBracketToken', isToken: true }
        ]
    },
    <any>{
        name: 'PropertyAssignmentSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IPropertyAssignmentSyntax'],
        children: [
            <any>{ name: 'propertyName', type: 'IPropertyNameSyntax' },
            <any>{ name: 'colonToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'expression', type: 'IExpressionSyntax' }
        ]
    },
    <any>{
        name: 'FunctionExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IPrimaryExpressionSyntax'],
        children: [
            <any>{ name: 'asyncKeyword', isToken: true, isOptional: true },
            <any>{ name: 'functionKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'asterixToken', isToken: true, isOptional: true },
            <any>{ name: 'identifier', isToken: true, isOptional: true },
            <any>{ name: 'callSignature', type: 'CallSignatureSyntax' },
            <any>{ name: 'body', type: 'BlockSyntax | ExpressionBody | ISyntaxToken', isOptional: true }]
    },
    <any>{
        name: 'EmptyStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'semicolonToken', isToken: true }]
    },
    <any>{
        name: 'TryStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'tryKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'block', type: 'BlockSyntax' },
            <any>{ name: 'catchClause', type: 'CatchClauseSyntax', isOptional: true },
            <any>{ name: 'finallyClause', type: 'FinallyClauseSyntax', isOptional: true }]
    },
    <any>{
        name: 'CatchClauseSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'catchKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'openParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'identifier', isToken: true },
            <any>{ name: 'typeAnnotation', type: 'TypeAnnotationSyntax', isOptional: true, isTypeScriptSpecified: true },
            <any>{ name: 'closeParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'block', type: 'BlockSyntax' }]
    },
    <any>{
        name: 'FinallyClauseSyntax',
        baseType: 'ISyntaxNode',
        children: [
            <any>{ name: 'finallyKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'block', type: 'BlockSyntax' }]
    },
    <any>{
        name: 'LabeledStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'identifier', isToken: true },
            <any>{ name: 'colonToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'statement', type: 'IStatementSyntax' }]
    },
    <any>{
        name: 'DoStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'doKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'statement', type: 'IStatementSyntax' },
            <any>{ name: 'whileKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'openParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'condition', type: 'IExpressionSyntax' },
            <any>{ name: 'closeParenToken', isToken: true, excludeFromAST: true },
            <any>{ name: 'semicolonToken', isToken: true, isOptional: true, excludeFromAST: true }]
    },
    <any>{
        name: 'TypeOfExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IUnaryExpressionSyntax'],
        children: [
            <any>{ name: 'typeOfKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'expression', type: 'IUnaryExpressionSyntax' }]
    },
    <any>{
        name: 'DeleteExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IUnaryExpressionSyntax'],
        children: [
            <any>{ name: 'deleteKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'expression', type: 'IUnaryExpressionSyntax' }]
    },
    <any>{
        name: 'VoidExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IUnaryExpressionSyntax'],
        children: [
            <any>{ name: 'voidKeyword', isToken: true, excludeFromAST: true },
            <any>{ name: 'expression', type: 'IUnaryExpressionSyntax' }]
    },
    <any>{
        name: 'YieldExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IExpressionSyntax'],
        children: [
            <any>{ name: 'yieldKeyword', isToken: true },
            <any>{ name: 'asterixToken', isToken: true, isOptional: true },
            <any>{ name: 'expression', type: 'IExpressionSyntax', isOptional: true }]
    },
    <any>{
        name: 'AwaitExpressionSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IUnaryExpressionSyntax'],
        children: [
            <any>{ name: 'awaitKeyword', isToken: true },
            <any>{ name: 'expression', type: 'IUnaryExpressionSyntax', isOptional: true }]
    },
    <any>{
        name: 'DebuggerStatementSyntax',
        baseType: 'ISyntaxNode',
        interfaces: ['IStatementSyntax'],
        children: [
            <any>{ name: 'debuggerKeyword', isToken: true },
            <any>{ name: 'semicolonToken', isToken: true, isOptional: true, excludeFromAST: true }]
    }];

function getSyntaxKindEnum() {
    var name = "SyntaxKind";
    return (<any>TypeScript)[name];
}

function firstKind(definition: ITypeDefinition): TypeScript.SyntaxKind {
    var kindName = getNameWithoutSuffix(definition);
    return getSyntaxKindEnum()[kindName];
}

definitions.sort((d1, d2) => firstKind(d1) - firstKind(d2));

function getStringWithoutSuffix(definition: string) {
    if (TypeScript.StringUtilities.endsWith(definition, "Syntax")) {
        return definition.substring(0, definition.length - "Syntax".length);
    }

    return definition;
}

function getNameWithoutSuffix(definition: ITypeDefinition) {
    return getStringWithoutSuffix(definition.name);
}

function getType(child: IMemberDefinition): string {
    if (child.isToken) {
        return "ISyntaxToken";
    }
    else if (child.isSeparatedList) {
        return "ISeparatedSyntaxList<" + child.elementType + ">";
    }
    else if (child.isList) {
        return child.elementType + "[]";
    }
    else {
        return child.type;
    }
}

function camelCase(value: string): string {
    return value.substr(0, 1).toLowerCase() + value.substr(1);
}

function getSafeName(child: IMemberDefinition) {
    if (child.name === "arguments") {
        return "_" + child.name;
    }

    return child.name;
}

function generateConstructorFunction(definition: ITypeDefinition) {
    var result = "    export var " + definition.name + ": " + getNameWithoutSuffix(definition) + "Constructor = <any>function(data: number";

    for (var i = 0; i < definition.children.length; i++) {
        var child = definition.children[i];
        result += ", ";
        result += getSafeName(child);
        result += ": " + getType(child);
    }

    result += ") {\r\n";

    result += "        if (data) { this.__data = data; }\r\n";
    result += "        this.parent = undefined";
    if (definition.children.length) {
        for (var i = 0; i < definition.children.length; i++) {
            //if (i) {
            result += ",\r\n";
            //}

            var child = definition.children[i];
            result += "        this." + child.name + " = " + getSafeName(child);
        }
    }

    result += ";\r\n";

    result += "    };\r\n";
    result += "    " + definition.name + ".prototype.kind = SyntaxKind." + getNameWithoutSuffix(definition) + ";\r\n";
    result += "    " + definition.name + ".prototype.childCount = " + definition.children.length + ";\r\n";
    result += "    " + definition.name + ".prototype.childAt = function(index: number): ISyntaxElement {\r\n";
    if (definition.children.length) {
        result += "        switch (index) {\r\n";

        for (var j = 0; j < definition.children.length; j++) {
            result += "            case " + j + ": return this." + definition.children[j].name + ";\r\n";
        }

        result += "        }\r\n";
    }
    else {
        result += "        throw Errors.invalidOperation();\r\n";
    }
    result += "    }\r\n";

    return result;
}

function generateSyntaxInterfaces(): string {
    var result = "///<reference path='references.ts' />\r\n\r\n";

    result += "module TypeScript {\r\n";

    for (var i = 0; i < definitions.length; i++) {
        var definition = definitions[i];

        if (i > 0) {
            result += "\r\n";
        }

        result += generateSyntaxInterface(definition);
    }

    result += "}";
    return result;
}

function generateSyntaxInterface(definition: ITypeDefinition): string {
    var result = "    export interface " + definition.name + " extends ISyntaxNode"

    if (definition.interfaces) {
        result += ", ";
        result += definition.interfaces.join(", ");
    }

    result += " {\r\n";

    if (definition.name === "SourceUnitSyntax") {
        result += "        syntaxTree: SyntaxTree;\r\n";
    }

    for (var i = 0; i < definition.children.length; i++) {
        var child = definition.children[i];
        result += "        " + child.name + ": " + getType(child) + ";\r\n";
    }

    result += "    }\r\n";
    result += "    export interface " + getNameWithoutSuffix(definition) + "Constructor {";
    result += " new (data: number";

    for (var i = 0; i < definition.children.length; i++) {
        var child = definition.children[i];
        result += ", ";
        result += getSafeName(child);
        result += ": " + getType(child);
    }

    result += "): " + definition.name;
    result += " }\r\n";

    return result;
}

function generateNodes(): string {
    var result = "///<reference path='references.ts' />\r\n\r\n";

    result += "module TypeScript";

    result += " {\r\n";

    for (var i = 0; i < definitions.length; i++) {
        var definition = definitions[i];

        if (i) {
            result += "\r\n";
        }

        result += generateConstructorFunction(definition);
    }

    result += "}";
    return result;
}

function isInterface(name: string) {
    return name.substr(0, 1) === "I" && name.substr(1, 1).toUpperCase() === name.substr(1, 1)
}

function generateWalker(): string {
    var result = "";

    result +=
    "///<reference path='references.ts' />\r\n" +
    "\r\n" +
    "module TypeScript {\r\n" +
    "    export class SyntaxWalker implements ISyntaxVisitor {\r\n" +
    "        public visitToken(token: ISyntaxToken): void {\r\n" +
    "        }\r\n" +
    "\r\n" +
    "        private visitOptionalToken(token: ISyntaxToken): void {\r\n" +
    "            if (token === undefined) {\r\n" +
    "                return;\r\n" +
    "            }\r\n" +
    "\r\n" +
    "            this.visitToken(token);\r\n" +
    "        }\r\n" +
    "\r\n" +
    "        public visitList(list: ISyntaxNodeOrToken[]): void {\r\n" +
    "            for (var i = 0, n = list.length; i < n; i++) {\r\n" +
    "                visitNodeOrToken(this, list[i]);\r\n" +
    "            }\r\n" +
    "        }\r\n";

    for (var i = 0; i < definitions.length; i++) {
        var definition = definitions[i];

        result += "\r\n";
        result += "        public visit" + getNameWithoutSuffix(definition) + "(node: " + definition.name + "): void {\r\n";

        for (var j = 0; j < definition.children.length; j++) {
            var child = definition.children[j];

            if (child.isToken) {
                if (child.isOptional) {
                    result += "            this.visitOptionalToken(node." + child.name + ");\r\n";
                }
                else {
                    result += "            this.visitToken(node." + child.name + ");\r\n";
                }
            }
            else if (child.isList || child.isSeparatedList) {
                result += "            this.visitList(node." + child.name + ");\r\n";
            }
            else if (child.isToken) {
                if (child.isOptional) {
                    result += "            this.visitOptionalToken(node." + child.name + ");\r\n";
                }
                else {
                    result += "            this.visitToken(node." + child.name + ");\r\n";
                }
            }
            else {
                result += "            visitNodeOrToken(this, node." + child.name + ");\r\n";
            }
        }

        result += "        }\r\n";
    }

    result += "    }";
    result += "\r\n}";
    return result;
}

function firstEnumName(e: any, value: number) {
    for (var name in e) {
        if (e[name] === value) {
            return name;
        }
    }
}

function groupBy<T>(array: T[], func: (v: T) => string): any {
    var result: any = {};

    for (var i = 0, n = array.length; i < n; i++) {
        var v: any = array[i];
        var k = func(v);

        var list: T[] = result[k] || [];
        list.push(v);
        result[k] = list;
    }

    return result;
}

function generateKeywordCondition(keywords: { text: string; kind: TypeScript.SyntaxKind; }[], currentCharacter: number, indent: string): string {
    var length = keywords[0].text.length;

    var result = "";
    var index: string;

    if (keywords.length === 1) {
        var keyword = keywords[0];

        if (currentCharacter === length) {
            return " return SyntaxKind." + firstEnumName(getSyntaxKindEnum(), keyword.kind) + ";\r\n";
        }

        var keywordText = keywords[0].text;
        result = " return ("

        for (var i = currentCharacter; i < length; i++) {
            if (i > currentCharacter) {
                result += " && ";
            }

            index = i === 0 ? "start" : ("start + " + i);
            result += "str.charCodeAt(" + index + ") === CharacterCodes." + keywordText.substr(i, 1);
        }

        result += ") ? SyntaxKind." + firstEnumName(getSyntaxKindEnum(), keyword.kind) + " : SyntaxKind.IdentifierName;\r\n";
    }
    else {
        result += " // " + TypeScript.ArrayUtilities.select(keywords, k => k.text).join(", ") + "\r\n"
        index = currentCharacter === 0 ? "start" : ("start + " + currentCharacter);
        result += indent + "switch(str.charCodeAt(" + index + ")) {\r\n"

        var groupedKeywords = groupBy(keywords, k => k.text.substr(currentCharacter, 1));

        for (var c in groupedKeywords) {
            if (groupedKeywords.hasOwnProperty(c)) {
                result += indent + "  case CharacterCodes." + c + ":";
                result += generateKeywordCondition(groupedKeywords[c], currentCharacter + 1, indent + "    ");
            }
        }

        result += indent + "  default: return SyntaxKind.IdentifierName;\r\n";
        result += indent + "}\r\n";
    }

    return result;
}

function min<T>(array: T[], func: (v: T) => number): number {
    var min = func(array[0]);

    for (var i = 1; i < array.length; i++) {
        var next = func(array[i]);
        if (next < min) {
            min = next;
        }
    }

    return min;
}

function max<T>(array: T[], func: (v: T) => number): number {
    var max = func(array[0]);

    for (var i = 1; i < array.length; i++) {
        var next = func(array[i]);
        if (next > max) {
            max = next;
        }
    }

    return max;
}

function generateUtilities(): string {
    var result = ""; //"module TypeScript.Scanner {";
    //result += "        function fixedWidthTokenLength(kind: SyntaxKind) {\r\n";
    //result += "            return fixedWidthArray[kind];\r\n";

    //result += "            switch (kind) {\r\n";

    //for (var k = TypeScript.SyntaxKind.FirstFixedWidth; k <= TypeScript.SyntaxKind.LastFixedWidth; k++) {
    //    result += "                case SyntaxKind." + syntaxKindName(k) + ": return " + TypeScript.SyntaxFacts.getText(k).length + ";\r\n";
    //}
    //result += "                default: throw new Error();\r\n";
    //result += "            }\r\n";
    // result += "        }\r\n";

    return result;
}

function generateScannerUtilities(): string {
    var result = "///<reference path='references.ts' />\r\n" +
        "\r\n" +
        "module TypeScript {\r\n" +
        "    export module ScannerUtilities {\r\n";

    result += "        export var fixedWidthArray = [";
    for (var i = 0; i <= TypeScript.SyntaxKind.LastFixedWidth; i++) {
        if (i) {
            result += ", ";
        }

        if (i < TypeScript.SyntaxKind.FirstFixedWidth) {
            result += "0";
        }
        else {
            result += TypeScript.SyntaxFacts.getText(i).length;
        }
    }
    result += "];\r\n";


    var i: number;
    var keywords: { text: string; kind: TypeScript.SyntaxKind; }[] = [];

    for (i = TypeScript.SyntaxKind.FirstKeyword; i <= TypeScript.SyntaxKind.LastKeyword; i++) {
        keywords.push({ kind: i, text: TypeScript.SyntaxFacts.getText(i) });
    }

    keywords.sort((a, b) => a.text.localeCompare(b.text));

    result += "        export function identifierKind(str: string, start: number, length: number): SyntaxKind {\r\n";

    var minTokenLength = min(keywords, k => k.text.length);
    var maxTokenLength = max(keywords, k => k.text.length);
    result += "            switch (length) {\r\n";


    for (i = minTokenLength; i <= maxTokenLength; i++) {
        var keywordsOfLengthI = TypeScript.ArrayUtilities.where(keywords, k => k.text.length === i);
        if (keywordsOfLengthI.length > 0) {
            result += "              case " + i + ":";
            result += generateKeywordCondition(keywordsOfLengthI, 0, "                ");
        }
    }

    result += "              default: return SyntaxKind.IdentifierName;\r\n";
    result += "            }\r\n";
    result += "        }\r\n";

    result += "    }\r\n";
    result += "}";

    return result;
}

function syntaxKindName(kind: TypeScript.SyntaxKind): string {
    for (var name in getSyntaxKindEnum()) {
        if (getSyntaxKindEnum()[name] === kind) {
            return name;
        }
    }

    throw new Error();
}

function generateVisitor(): string {
    var result = "";

    result += "///<reference path='references.ts' />\r\n\r\n";

    result += "module TypeScript {\r\n";
    result += "    export function visitNodeOrToken(visitor: ISyntaxVisitor, element: ISyntaxNodeOrToken): any {\r\n";
    result += "        if (element === undefined) { return undefined; }\r\n";

    result += "        switch (element.kind) {\r\n";

    for (var i = 0; i < definitions.length; i++) {
        var definition = definitions[i];

        result += "            case SyntaxKind." + getNameWithoutSuffix(definition) + ": ";
        result += "return visitor.visit" + getNameWithoutSuffix(definition) + "(<" + definition.name + ">element);\r\n";
    }

    result += "            default: return visitor.visitToken(<ISyntaxToken>element);\r\n";
    result += "        }\r\n";
    result += "    }\r\n\r\n";

    result += "    export interface ISyntaxVisitor {\r\n";
    result += "        visitToken(token: ISyntaxToken): any;\r\n";

    for (var i = 0; i < definitions.length; i++) {
        var definition = definitions[i];
        result += "        visit" + getNameWithoutSuffix(definition) + "(node: " + definition.name + "): any;\r\n";
    }

    result += "    }";

    result += "\r\n}";

    return result;
}

var syntaxNodesConcrete = generateNodes();
var syntaxInterfaces = generateSyntaxInterfaces();
var walker = generateWalker();
var scannerUtilities = generateScannerUtilities();
var visitor = generateVisitor();
var utilities = generateUtilities();

sys.writeFile(sys.getCurrentDirectory() + "\\src\\services\\syntax\\syntaxNodes.concrete.generated.ts", syntaxNodesConcrete, false);
sys.writeFile(sys.getCurrentDirectory() + "\\src\\services\\syntax\\syntaxInterfaces.generated.ts", syntaxInterfaces, false);
sys.writeFile(sys.getCurrentDirectory() + "\\src\\services\\syntax\\syntaxWalker.generated.ts", walker, false);
sys.writeFile(sys.getCurrentDirectory() + "\\src\\services\\syntax\\scannerUtilities.generated.ts", scannerUtilities, false);
sys.writeFile(sys.getCurrentDirectory() + "\\src\\services\\syntax\\syntaxVisitor.generated.ts", visitor, false);
sys.writeFile(sys.getCurrentDirectory() + "\\src\\services\\syntax\\utilities.generated.ts", utilities, false);
