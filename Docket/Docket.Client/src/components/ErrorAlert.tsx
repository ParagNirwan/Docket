import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronRight, Terminal } from "lucide-react";
import type { ApiErrorResponse } from "../lib/apiError";

interface ErrorAlertProps {
  error: ApiErrorResponse | string | null | undefined;
  className?: string;
  onDismiss?: () => void;
}

export function ErrorAlert({ error, className = "", onDismiss }: ErrorAlertProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  const message = typeof error === "string" ? error : error.message;
  const details = typeof error === "object" ? error.details : undefined;
  const code = typeof error === "object" ? error.code : undefined;
  const traceId = typeof error === "object" ? error.traceId : undefined;
  const errors = typeof error === "object" ? error.errors : undefined;

  return (
    <div
      className={`rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-800 dark:text-red-200 shadow-sm ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-red-900 dark:text-red-100">{message}</p>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-300 text-xs font-semibold px-1 rounded"
              >
                ✕
              </button>
            )}
          </div>

          {errors && Object.keys(errors).length > 0 && (
            <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-red-700 dark:text-red-300">
              {Object.entries(errors).map(([field, fieldErrors]) =>
                fieldErrors.map((err, idx) => (
                  <li key={`${field}-${idx}`}>
                    <span className="font-semibold capitalize">{field}</span>: {err}
                  </li>
                )),
              )}
            </ul>
          )}

          {(details || code || traceId) && (
            <div className="mt-3 pt-2 border-t border-red-200/60 dark:border-red-900/40">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1.5 text-xs text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 font-medium transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Developer Info {code ? `(${code})` : ""}</span>
                {showDetails ? (
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                )}
              </button>

              {showDetails && (
                <div className="mt-2 p-2 rounded bg-red-100/70 dark:bg-red-900/30 text-[11px] font-mono text-red-950 dark:text-red-200 overflow-x-auto space-y-1">
                  {code && <div><strong>Code:</strong> {code}</div>}
                  {details && <div><strong>Details:</strong> {details}</div>}
                  {traceId && <div><strong>TraceId:</strong> {traceId}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

