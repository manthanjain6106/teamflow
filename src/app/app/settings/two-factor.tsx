'use client';

import { useEffect, useState } from 'react';
import { Key, CheckCircle, XCircle } from 'lucide-react';

export function TwoFactorSettings() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [otpauth, setOtpauth] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const res = await fetch('/api/auth/2fa');
    const data = await res.json();
    setEnabled(!!data.twoFactorEnabled);
  };

  useEffect(() => { refresh(); }, []);

  const init = async () => {
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/auth/2fa?action=init', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const data = await res.json();
      setSecret(data.secret); setOtpauth(data.otpauthUrl); setRecoveryCodes(data.recoveryCodes);
    } catch (e) { setError('Failed to initialize'); } finally { setBusy(false); }
  };

  const verify = async () => {
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/auth/2fa?action=verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      if (res.ok) { await refresh(); }
      else { const d = await res.json(); setError(d.error || 'Invalid code'); }
    } catch { setError('Verification failed'); } finally { setBusy(false); }
  };

  const disable = async () => {
    setBusy(true); setError(null);
    try { await fetch('/api/auth/2fa?action=disable', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); await refresh(); }
    catch { setError('Failed to disable'); } finally { setBusy(false); }
  };

  if (enabled === null) return <div className="text-sm text-gray-500">Loading…</div>;

  if (enabled) {
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600"/>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">2FA is enabled</div>
            <div className="text-xs text-gray-500">Keep your authenticator app handy and store recovery codes safely.</div>
          </div>
        </div>
        <button disabled={busy} onClick={disable} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">Disable</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!secret ? (
        <button disabled={busy} onClick={init} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"><Key className="h-4 w-4"/>Enable 2FA</button>
      ) : (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          <div className="text-sm text-gray-900 dark:text-white font-medium mb-2">Scan QR or enter secret</div>
          <div className="text-xs text-gray-500 break-all mb-2">Secret: {secret}</div>
          <div className="text-xs text-gray-500 break-all mb-2">otpauth URL: {otpauth}</div>
          <div className="mt-3">
            <label className="block text-xs text-gray-600 mb-1">Enter 6-digit code</label>
            <div className="flex gap-2">
              <input value={code} onChange={e => setCode(e.target.value)} className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="123456"/>
              <button disabled={busy} onClick={verify} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Verify</button>
            </div>
            {error && <div className="mt-2 text-xs text-red-600 flex items-center gap-1"><XCircle className="h-3 w-3"/>{error}</div>}
          </div>
          {recoveryCodes && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Recovery Codes</div>
              <ul className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300">
                {recoveryCodes.map((c) => <li key={c} className="px-2 py-1 bg-gray-50 dark:bg-gray-900/40 rounded border border-gray-200 dark:border-gray-700">{c}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


