import { useEffect, useState } from "react";

const operators = ["+", "-", "×", "÷"];

function formatDisplay(value) {
  if (value === "Error") return value;
  const number = Number(value);
  if (!Number.isFinite(number)) return "Error";
  if (Math.abs(number) >= 1e9 || (Math.abs(number) < 1e-6 && number !== 0)) {
    return number.toExponential(4);
  }
  const text = String(value);
  return text.length > 12 ? text.slice(0, 12) : text;
}

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [shouldOverwrite, setShouldOverwrite] = useState(true);
  const [expression, setExpression] = useState("");

  const calculate = (first, second, selectedOperator) => {
    switch (selectedOperator) {
      case "+": return first + second;
      case "-": return first - second;
      case "×": return first * second;
      case "÷": return second === 0 ? NaN : first / second;
      default: return second;
    }
  };

  const inputDigit = (digit) => {
    if (display === "Error" || shouldOverwrite) {
      setDisplay(digit === "." ? "0." : digit);
      setShouldOverwrite(false);
      return;
    }
    if (digit === "." && display.includes(".")) return;
    setDisplay(display === "0" && digit !== "." ? digit : display + digit);
  };

  const chooseOperator = (selectedOperator) => {
    if (display === "Error") return;
    const currentValue = Number(display);
    if (operator && !shouldOverwrite) {
      const result = calculate(previousValue, currentValue, operator);
      if (!Number.isFinite(result)) {
        setDisplay("Error");
        setExpression("");
        setPreviousValue(null);
        setOperator(null);
        return;
      }
      setDisplay(String(result));
      setPreviousValue(result);
      setExpression(`${result} ${selectedOperator}`);
    } else {
      setPreviousValue(currentValue);
      setExpression(`${display} ${selectedOperator}`);
    }
    setOperator(selectedOperator);
    setShouldOverwrite(true);
  };

  const equals = () => {
    if (!operator || previousValue === null || display === "Error") return;
    const result = calculate(previousValue, Number(display), operator);
    setExpression(`${previousValue} ${operator} ${display} =`);
    setDisplay(Number.isFinite(result) ? String(result) : "Error");
    setPreviousValue(null);
    setOperator(null);
    setShouldOverwrite(true);
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setShouldOverwrite(true);
    setExpression("");
  };

  const backspace = () => {
    if (shouldOverwrite || display === "Error") return;
    const next = display.length > 1 ? display.slice(0, -1) : "0";
    setDisplay(next === "-" ? "0" : next);
    if (next === "0" || next === "-") setShouldOverwrite(true);
  };

  const toggleSign = () => {
    if (display === "0" || display === "Error") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : `-${display}`);
  };

  const percent = () => {
    if (display !== "Error") setDisplay(String(Number(display) / 100));
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key } = event;
      if (/\d/.test(key) || key === ".") inputDigit(key);
      else if (operators.includes(key)) chooseOperator(key);
      else if (key === "*") chooseOperator("×");
      else if (key === "/") { event.preventDefault(); chooseOperator("÷"); }
      else if (key === "Enter" || key === "=") equals();
      else if (key === "Escape") clear();
      else if (key === "Backspace") backspace();
      else if (key === "%") percent();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const button = (label, action, className = "") => (
    <button type="button" className={`calculator-key ${className}`} onClick={action}>
      {label}
    </button>
  );

  return (
    <main className="calculator-page">
      <section className="calculator" aria-label="Calculator">
        <header className="calculator-header">
          <span>CALCULATOR</span>
          <span className={`status-light ${display === "Error" ? "is-error" : ""}`} />
        </header>
        <div className="calculator-screen" aria-live="polite">
          <div className="calculator-expression">{expression || "\u00a0"}</div>
          <div className="calculator-display">{formatDisplay(display)}</div>
        </div>
        <div className="calculator-keys">
          {button("C", clear, "key-function")}
          {button("+/-", toggleSign, "key-function")}
          {button("%", percent, "key-function")}
          {button("÷", () => chooseOperator("÷"), "key-operator")}
          {button("7", () => inputDigit("7"))}
          {button("8", () => inputDigit("8"))}
          {button("9", () => inputDigit("9"))}
          {button("×", () => chooseOperator("×"), "key-operator")}
          {button("4", () => inputDigit("4"))}
          {button("5", () => inputDigit("5"))}
          {button("6", () => inputDigit("6"))}
          {button("−", () => chooseOperator("-"), "key-operator")}
          {button("1", () => inputDigit("1"))}
          {button("2", () => inputDigit("2"))}
          {button("3", () => inputDigit("3"))}
          {button("+", () => chooseOperator("+"), "key-operator")}
          {button("0", () => inputDigit("0"), "key-zero")}
          {button(".", () => inputDigit("."))}
          {button("=", equals, "key-operator")}
        </div>
        <button type="button" className="delete-button" onClick={backspace}>
          <span aria-hidden="true">⌫</span> DELETE
        </button>
      </section>
    </main>
  );
}