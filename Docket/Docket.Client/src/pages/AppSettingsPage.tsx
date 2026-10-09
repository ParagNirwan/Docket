export function AppSettingsPage() {
  return (
    <div>
      <h2 className="text-xl font-medium mb-4 text-[var(--color-ink)]">App Settings</h2>
      <div className="space-y-4 max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-ink)]">Email Notifications</h3>
            <p className="text-xs text-[var(--color-muted)]">Receive daily summary emails.</p>
          </div>
          <input type="checkbox" className="w-4 h-4 text-[var(--color-vault)] border-[var(--color-line)] rounded focus:ring-[var(--color-vault)]" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-[var(--color-ink)]">Dark Mode</h3>
            <p className="text-xs text-[var(--color-muted)]">Toggle application theme.</p>
          </div>
          <input type="checkbox" className="w-4 h-4 text-[var(--color-vault)] border-[var(--color-line)] rounded focus:ring-[var(--color-vault)]" />
        </div>
        <button className="bg-[var(--color-vault)] text-white px-4 py-2 rounded-md text-sm hover:bg-[var(--color-vault-hover)] transition-colors mt-4">
          Save Preferences
        </button>
      </div>
    </div>
  );
}

