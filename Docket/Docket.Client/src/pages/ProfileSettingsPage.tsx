export function ProfileSettingsPage() {
  return (
    <div>
      <h2 className="text-xl font-medium mb-4 text-[var(--color-ink)]">Profile Settings</h2>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-[var(--color-muted)] mb-1">Full Name</label>
          <input type="text" className="w-full border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vault)]" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-muted)] mb-1">Email Address</label>
          <input type="email" className="w-full border border-[var(--color-line)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vault)]" placeholder="john@example.com" disabled />
        </div>
        <button className="bg-[var(--color-vault)] text-white px-4 py-2 rounded-md text-sm hover:bg-[var(--color-vault-hover)] transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}

