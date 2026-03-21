"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { usePyodide } from "@/hooks/usePyodide";
import { EXECUTABLE_LANGUAGES } from "@/lib/constants";
import type { CourseLanguage } from "@/types";

// Monaco is ~2MB — always dynamically import, never at module level
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-gray-900 animate-pulse rounded" />
  ),
});

const MONACO_LANGUAGE: Record<CourseLanguage, string> = {
  python: "python",
  javascript: "javascript",
  c: "c",
  java: "java",
  html_css: "html",
  sql: "sql",
};

const DEFAULT_CODE: Partial<Record<CourseLanguage, string>> = {
  python: 'print("Hello, World!")',
  javascript: 'console.log("Hello, World!");',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  sql: "SELECT 'Hello, World!' AS message;",
  html_css: "<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>",
};

function runJavaScript(code: string): { output: string; error: string | null } {
  const logs: string[] = [];
  const capturedConsole = {
    log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
    error: (...args: unknown[]) =>
      logs.push("[error] " + args.map(String).join(" ")),
    warn: (...args: unknown[]) =>
      logs.push("[warn] " + args.map(String).join(" ")),
  };
  try {
    // eslint-disable-next-line no-new-func
    new Function("console", code)(capturedConsole);
    return { output: logs.join("\n") || "(no output)", error: null };
  } catch (e: unknown) {
    return {
      output: logs.join("\n"),
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

interface CodePlaygroundProps {
  language: CourseLanguage;
  courseId: string;
}

export default function CodePlayground({ language, courseId }: CodePlaygroundProps) {
  const t = useTranslations("learning.playground");
  const storageKey = `intellonotes-code-${courseId}-${language}`;
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_CODE[language] ?? "";
    return localStorage.getItem(storageKey) ?? DEFAULT_CODE[language] ?? "";
  });

  // Debounced save to localStorage (500ms after last keystroke)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, code);
    }, 500);
    return () => clearTimeout(timer);
  }, [code, storageKey]);
  const [output, setOutput] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { runPython, isLoading: isPyodideLoading } = usePyodide();

  const canExecute = EXECUTABLE_LANGUAGES.includes(
    language as (typeof EXECUTABLE_LANGUAGES)[number]
  );

  const handleRun = useCallback(async () => {
    setRunError(null);
    setOutput(null);
    setIsRunning(true);

    try {
      if (language === "javascript") {
        const result = runJavaScript(code);
        setOutput(result.output || "(no output)");
        if (result.error) setRunError(result.error);
      } else if (language === "python") {
        const result = await runPython(code);
        setOutput(result.output || "(no output)");
        if (result.error) setRunError(result.error);
      }
    } finally {
      setIsRunning(false);
    }
  }, [code, language, runPython]);

  const isLoadingPython = language === "python" && isPyodideLoading;
  const isWorking = isRunning || isLoadingPython;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">
          {MONACO_LANGUAGE[language]}
        </span>
        {canExecute ? (
          <Button
            size="sm"
            variant="primary"
            isLoading={isWorking}
            onClick={handleRun}
          >
            {isLoadingPython ? t("loading") : t("run")}
          </Button>
        ) : (
          <span className="text-xs text-gray-500 italic">
            {t("noExecution")}
          </span>
        )}
      </div>

      {/* Editor */}
      <MonacoEditor
        height="240px"
        language={MONACO_LANGUAGE[language]}
        value={code}
        onChange={(val) => setCode(val ?? "")}
        theme="vs-dark"
        options={{
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          wordWrap: "on",
          padding: { top: 8, bottom: 8 },
        }}
      />

      {/* Output panel */}
      {(output !== null || runError) && (
        <div className="bg-gray-950 border-t border-gray-800">
          <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-800">
            <span className="text-xs text-gray-400 font-mono">{t("output")}</span>
            <button
              type="button"
              onClick={() => { setOutput(null); setRunError(null); }}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {t("clearOutput")}
            </button>
          </div>
          <pre className="px-4 py-3 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap max-h-48">
            {runError ? (
              <span className="text-red-400">{runError}</span>
            ) : (
              output
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
