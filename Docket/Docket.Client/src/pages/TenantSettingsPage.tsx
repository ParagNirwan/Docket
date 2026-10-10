export function TenantSettingsPage() {
  return (
    <div>
      <h2 className="text-xl font-medium mb-4 text-[var(--color-ink)]">Tenant Settings</h2>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-[var(--color-muted)] mb-1">Organization Name</label>
          <input
            type="text"
            className="w-full border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vault)] placeholder:text-[var(--color-muted)]"
            placeholder="My Company"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-muted)] mb-1">Custom Domain</label>
          <input
            type="text"
            className="w-full border border-[var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-vault)] placeholder:text-[var(--color-muted)]"
            placeholder="docs.mycompany.com"
          />
        </div>
        <div className="pt-2">
          <button className="bg-[var(--color-vault)] text-white px-4 py-2 rounded-md text-sm hover:bg-[var(--color-vault-hover)] transition-colors">
            Update Tenant
          </button>
        </div>
      </div>
    </div>
  );
}
