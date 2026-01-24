import { useState } from "react";
import { stepCPU, resetCPU, loadProgram } from "./api";

function App() {
  const [programText, setProgramText] = useState(
`LOAD R1 5
LOAD R2 10
ADD R1 R2
STORE R1 20`
  );

  const [currentState, setCurrentState] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [status, setStatus] = useState("No program loaded");
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  const handleLoad = async () => {
    setError("");
    setFinished(false);
    setTimeline([]);
    setCurrentState(null);

    const program = programText
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    const res = await loadProgram(program);

    if (res.detail) {
      setError(res.detail);
      setStatus("Error");
    } else {
      setStatus(`Program loaded (${res.lines} lines)`);
    }
  };

  const handleStep = async () => {
    if (finished) return;

    const res = await stepCPU();

    if (res.status === "Program finished") {
      setFinished(true);
      setStatus("Program finished");
      return;
    }

    if (res.detail) {
      setError(res.detail);
      setFinished(true);
      setStatus("Execution halted");
      return;
    }

    setCurrentState(res);
    setTimeline(prev => [...prev, res]);
  };

  const handleReset = async () => {
    await resetCPU();
    setCurrentState(null);
    setTimeline([]);
    setFinished(false);
    setError("");
    setStatus("CPU reset");
  };

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>Visual CPU Execution Simulator</h1>

      {/* Program Editor */}
      <h3>Program Editor</h3>
      <textarea
        rows={6}
        style={{ width: "100%", fontFamily: "monospace" }}
        value={programText}
        onChange={e => setProgramText(e.target.value)}
      />

      {/* Controls */}
      <div style={{ marginTop: 10 }}>
        <button onClick={handleLoad}>LOAD PROGRAM</button>
        <button onClick={handleStep} disabled={finished} style={{ marginLeft: 10 }}>
          STEP
        </button>
        <button onClick={handleReset} style={{ marginLeft: 10 }}>
          RESET
        </button>
      </div>

      {/* Status */}
      <p style={{ marginTop: 10 }}>
        <strong>Status:</strong> {status}
      </p>

      {error && (
        <p style={{ color: "red" }}>
          <strong>Error:</strong> {error}
        </p>
      )}

      {/* Current State */}
      {currentState && (
        <>
          <h3>Current Instruction</h3>
          <code>{currentState.instruction}</code>

          <h3>Registers</h3>
          <pre>{JSON.stringify(currentState.registers, null, 2)}</pre>

          <h3>Memory Changes</h3>
          <pre>{JSON.stringify(currentState.memory_changes, null, 2)}</pre>
        </>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <>
          <h3>Execution Timeline</h3>
          <div style={{ maxHeight: 200, overflowY: "auto", border: "1px solid #ccc", padding: 10 }}>
            {timeline.map(step => (
              <div key={step.step} style={{ marginBottom: 6 }}>
                <strong>Step {step.step}:</strong> {step.instruction}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
