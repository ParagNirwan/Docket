import { useTheme } from "../context/ThemeContext";

export function AppSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <h2 className="text-xl font-medium mb-4 text-[var(--color-ink)]">
        App Settings
      </h2>
      <div className="space-y-4 max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-ink)]">
              Email Notifications
            </h3>
            <p className="text-xs text-[var(--color-muted)]">
              Receive daily summary emails.
            </p>
          </div>
          <input
            type="checkbox"
            className="w-4 h-4 text-[var(--color-vault)] border-[var(--color-line)] rounded focus:ring-[var(--color-vault)]"
            defaultChecked
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-ink)]">
              Dark Mode
            </h3>
            <p className="text-xs text-[var(--color-muted)]">
              Toggle the Ink theme across the application.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={theme === "dark"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-vault)] focus:ring-offset-1 ${
              theme === "dark"
                ? "bg-[var(--color-vault)]"
                : "bg-[var(--color-line)]"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                theme === "dark" ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <button className="bg-[var(--color-vault)] text-white px-4 py-2 rounded-md text-sm hover:bg-[var(--color-vault-hover)] transition-colors mt-4">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
