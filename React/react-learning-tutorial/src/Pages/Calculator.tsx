import React, { useState } from 'react';

const Calculator: React.FC = () => {
    const [display, setDisplay] = useState<string>('0');
    const [currentValue, setCurrentValue] = useState<number>(0);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);

    const handleNumberClick = (num: string) => {
        if (waitingForOperand) {
            setDisplay(num);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? num : display + num);
        }
    };

    const handleOperatorClick = (op: string) => {
        if (!waitingForOperand) {
            setCurrentValue(parseFloat(display));
            setOperator(op);
            setWaitingForOperand(true);
        }
    };

    const handleEqualsClick = () => {
        if (operator !== null) {
            const operand = parseFloat(display);
            let result: number;

            switch (operator) {
                case '+':
                    result = currentValue + operand;
                    break;
                case '-':
                    result = currentValue - operand;
                    break;
                case '*':
                    result = currentValue * operand;
                    break;
                case '/':
                    result = currentValue / operand;
                    break;
                default:
                    return;
            }

            setDisplay(result.toString());
            setCurrentValue(result);
            setOperator(null);
            setWaitingForOperand(true);
        }
    };

    const handleClearClick = () => {
        setDisplay('0');
        setCurrentValue(0);
        setOperator(null);
        setWaitingForOperand(false);
    };

    return (
        <div className="calculator">
            <div className="display">{display}</div>
            <div className="buttons">
                <button onClick={() => handleNumberClick('7')}>7</button>
                <button onClick={() => handleNumberClick('8')}>8</button>
                <button onClick={() => handleNumberClick('9')}>9</button>
                <button onClick={() => handleOperatorClick('/')}>/</button>
                <button onClick={() => handleNumberClick('4')}>4</button>
                <button onClick={() => handleNumberClick('5')}>5</button>
                <button onClick={() => handleNumberClick('6')}>6</button>
                <button onClick={() => handleOperatorClick('*')}>*</button>
                <button onClick={() => handleNumberClick('1')}>1</button>
                <button onClick={() => handleNumberClick('2')}>2</button>
                <button onClick={() => handleNumberClick('3')}>3</button>
                <button onClick={() => handleOperatorClick('-')}>-</button>
                <button onClick={() => handleNumberClick('0')}>0</button>
                <button onClick={handleClearClick}>C</button>
                <button onClick={handleEqualsClick}>=</button>
                <button onClick={() => handleOperatorClick('+')}>+</button>
            </div>
        </div>
    );
};

export default Calculator;
