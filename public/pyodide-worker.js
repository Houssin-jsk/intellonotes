/**
 * Web Worker for running Python code via Pyodide (CDN).
 * Loaded as a classic worker from /pyodide-worker.js so Turbopack
 * does not attempt to bundle it — Pyodide loads itself from CDN.
 */

let pyodide = null;
let initPromise = null;

async function initPyodide() {
  if (pyodide) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    importScripts(
      "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js"
    );
    pyodide = await self.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
    });
  })();

  return initPromise;
}

self.onmessage = async (event) => {
  const { id, code } = event.data;

  try {
    await initPyodide();

    // Reset stdout/stderr before each run
    pyodide.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
`);

    pyodide.runPython(code);

    const stdout = pyodide.runPython("sys.stdout.getvalue()");
    const stderr = pyodide.runPython("sys.stderr.getvalue()");

    self.postMessage({
      id,
      output: stdout + (stderr ? `\n[stderr]\n${stderr}` : ""),
      error: null,
    });
  } catch (err) {
    self.postMessage({ id, output: "", error: String(err) });
  }
};
