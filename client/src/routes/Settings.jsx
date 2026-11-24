import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Download, LogOut, ShieldAlert, Trash2 } from 'lucide-react';
import { Button, Card, Input, Modal, Tabs, useToast } from '../components/ui/index.js';
import { THEMES } from '../components/layout/Brand.jsx';
import { logOut } from '../lib/auth.js';
import { FIREBASE_ENABLED } from '../lib/config.js';
import { downloadJson } from '../lib/clipboard.js';
import { useStore, useUserData } from '../lib/store.js';
import { useDocumentTitle } from '../lib/hooks.js';

const PROVIDER = {
  guest: 'Guest. Data is saved in this browser.',
  demo: 'Demo profile. Data is saved in this browser.',
  local: 'Account stored on this device only.',
  firebase: 'Signed in with cloud sign-in. Your resumes are still saved only in this browser.',
};

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const session = useStore((s) => s.session);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const exportMyData = useStore((s) => s.exportMyData);
  const deleteAllMyData = useStore((s) => s.deleteAllMyData);
  const { resumes, audits } = useUserData();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const exportData = () => {
    downloadJson(`proofcv-export-${new Date().toISOString().slice(0, 10)}.json`, exportMyData());
    toast('Export downloaded.', { tone: 'success' });
  };
  const wipe = async () => {
    deleteAllMyData();
    await logOut();
    setConfirmOpen(false);
    toast('All your ProofCV data on this device was deleted.', { tone: 'success' });
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-fg">Settings</h1>
        <p className="text-fg-muted">Theme, your data, and your account.</p>
      </div>

      <Card>
        <h2 className="font-semibold text-fg">Appearance</h2>
        <p className="mt-1 text-sm text-fg-muted">System follows your device&apos;s light or dark mode.</p>
        <Tabs
          className="mt-3"
          label="Theme"
          value={theme}
          onChange={setTheme}
          tabs={THEMES.map((t) => ({ value: t.value, label: t.label, icon: t.icon }))}
        />
      </Card>

      <Card>
        <h2 className="font-semibold text-fg">Account</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[8rem_1fr]">
          <dt className="text-fg-muted">Name</dt>
          <dd className="text-fg">{session?.name}</dd>
          {session?.email && (
            <>
              <dt className="text-fg-muted">Email</dt>
              <dd className="text-fg">{session.email}</dd>
            </>
          )}
          <dt className="text-fg-muted">Type</dt>
          <dd className="text-fg">{PROVIDER[session?.provider]}</dd>
        </dl>
        {!FIREBASE_ENABLED && session?.provider !== 'guest' && (
          <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-xs text-fg-muted">
            Cloud sign-in isn&apos;t configured on this build, so your account works only in this browser.
          </p>
        )}
        <Button
          className="mt-4"
          variant="secondary"
          icon={LogOut}
          onClick={async () => {
            await logOut();
            navigate('/');
          }}
        >
          Log out
        </Button>
      </Card>

      <Card>
        <h2 className="font-semibold text-fg">Your data</h2>
        <p className="mt-1 text-sm text-fg-muted">
          {resumes.length} saved resume{resumes.length === 1 ? '' : 's'} and {audits.length} audit{audits.length === 1 ? '' : 's'}, stored
          in this browser&apos;s local storage. Nothing is stored on a server.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" icon={Download} onClick={exportData}>
            Export as JSON
          </Button>
          <Button
            variant="danger-ghost"
            icon={Trash2}
            onClick={() => {
              setConfirmText('');
              setConfirmOpen(true);
            }}
          >
            Delete all my data
          </Button>
        </div>
      </Card>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete all your data?"
        description="This removes every saved resume, audit and draft for this profile from this browser, then logs you out. It can't be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" icon={ShieldAlert} disabled={confirmText.trim().toLowerCase() !== 'delete'} onClick={wipe}>
              Delete everything
            </Button>
          </>
        }
      >
        <Input label='Type "delete" to confirm' value={confirmText} onChange={(e) => setConfirmText(e.target.value)} autoComplete="off" />
      </Modal>
    </div>
  );
}
