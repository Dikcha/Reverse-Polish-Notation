const OPEN_PARENTHESIS = "(";
const CLOSING_PARENTHESIS = ")";
const PLUS = "+";
const MINUS = "-";
const MULTIPLICATION = "*";
const DIVISION = "/";
const UNARY_MINUS = "#";
const FLOAT_NUMBER_SPLITTER = ".";

const BINARY_OPERATIONS = [PLUS, MINUS, MULTIPLICATION, DIVISION];

const sum = (a, b) => a + b;
const division = (a, b) => a / b;
const multiplication = (a, b) => a * b;
const subtraction = (a, b) => a - b;

const OPERAND_PRIORITY = new Map([
    [OPEN_PARENTHESIS, 0],
    [CLOSING_PARENTHESIS, 0],
    [PLUS, 1],
    [MINUS, 1],
    [MULTIPLICATION, 2],
    [DIVISION, 2],
    [UNARY_MINUS, 3]
]);

const OPERAND_OPERATION = new Map([
    [PLUS, sum],
    [MINUS, subtraction],
    [MULTIPLICATION, multiplication],
    [DIVISION, division]
]);

const isCharacterNumberOrFloatNumberSplitter = (character) => character === FLOAT_NUMBER_SPLITTER || !isNaN(character);
const isSymbolUnaryMinus = (
    symbol, previousSymbolInExpression
) => symbol === MINUS && (
    BINARY_OPERATIONS.includes(previousSymbolInExpression) ||
    !previousSymbolInExpression ||
    previousSymbolInExpression === OPEN_PARENTHESIS
);
const isSymbolBinaryOperand = (symbol) => BINARY_OPERATIONS.includes(symbol);

function calculateExpression (expression) {
    const formattedExpression = expression.replace(/\s/g, "");
    const reversePolishNotationElements = convertFromInfixNotationToRPN(formattedExpression);

    return calculateExpressionInRPN(reversePolishNotationElements);
}


function convertFromInfixNotationToRPN (expression) {
    let numberRepresentation = "";
    let RPNElements = [];
    let operands = [];
    const operationsStack = [];

    for (let i = 0; i < expression.length; i++) {
        let symbol = expression[i];
        if (isCharacterNumberOrFloatNumberSplitter(symbol)) {
            numberRepresentation += symbol;
        }

        if (symbol === OPEN_PARENTHESIS) {
            operationsStack.push(symbol);
        }

        if (symbol === CLOSING_PARENTHESIS) {
            let retrievedOperation = operationsStack.pop();
            while (retrievedOperation !== OPEN_PARENTHESIS) {
                operands.push(retrievedOperation);
                retrievedOperation = operationsStack.pop();
            }
        }

        if (isSymbolBinaryOperand(symbol)) {
            if (numberRepresentation) {
                RPNElements.push(numberRepresentation);
            }
            RPNElements = RPNElements.concat(operands);
            operands = [];
            numberRepresentation = "";

            if (isSymbolUnaryMinus(symbol, expression[i-1])) {
                symbol = UNARY_MINUS;
            }
            let topOperation = operationsStack[operationsStack.length - 1];
            while (OPERAND_PRIORITY.get(topOperation) >= OPERAND_PRIORITY.get(symbol)) {
                RPNElements.push(topOperation);
                operationsStack.pop();
                topOperation = operationsStack[operationsStack.length - 1];
            }
            operationsStack.push(symbol);
        }
    }
    RPNElements.push(numberRepresentation);

    return RPNElements.concat(operands).concat(operationsStack.reverse());
}

function calculateExpressionInRPN (expression) {
    const stack = [];
    for (let symbol of expression) {
        if (isCharacterNumberOrFloatNumberSplitter(symbol)) {
            stack.push(Number(symbol));
        }

        if (symbol === UNARY_MINUS) {
            const lastValue = stack.pop();
            stack.push(-lastValue);
        }

        if (isSymbolBinaryOperand(symbol)) {
            const operationToExecute = OPERAND_OPERATION.get(symbol);
            const secondParameter = stack.pop();
            const firstParameter = stack.pop();
            const operationResult = operationToExecute(firstParameter, secondParameter);
            stack.push(operationResult);
        }
    }
    const [calculationResult] = stack;

    return calculationResult;
}


const tests = [
    ['12*-1', -12],
    ['12* 123/-(-5 + 2)', 492],
    ['((80 - (19)))', 61],
    ['(1 - 2) + -(-(-(-4)))', 3],
    ['1 - -(-(-(-4)))', -3],
    ['12* 123/(-5 + 2)', -492],
    ['(123.45*(678.90 / (-2.5+ 11.5)-(((80 -(19))) *33.25)) / 20) - (123.45*(678.90 / (-2.5+ 11.5)-(((80 -(19))) *33.25)) / 20) + (13 - 2)/ -(-11) ', 1],
    ['1+1', 2],
    ['1 - 1', 0],
    ['1* 1', 1],
    ['1 /1', 1],
    ['-123', -123],
    ['123', 123],
    ['2 /2+3 * 4.75- -6', 21.25],
    ['12* 123', 1476],
    ['12 * -123', -1476],
    ['2 / (2 + 3) * 4.33 - -6', 7.732],
    ['((2.33 / (2.9+3.5)*4) - -6)', 7.45625],
    ['123.45*(678.90 / (-2.5+ 11.5)-(80 -19) *33.25) / 20 + 11', -12042.760875]
];
for (const [input,expected] of tests ) {
    calculateExpression(input) === expected ? console.log("PASSED!") : console.log("FAILED!");
}

