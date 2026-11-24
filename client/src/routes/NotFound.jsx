import { ArrowLeft, FileSearch } from 'lucide-react';
import { Button, EmptyState } from '../components/ui/index.js';
import { useDocumentTitle } from '../lib/hooks.js';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <EmptyState
        icon={FileSearch}
        title="404: this page isn't here"
        action={(
          <div className="flex flex-wrap justify-center gap-2">
            <Button to="/" variant="secondary" icon={ArrowLeft}>Back home</Button>
            <Button to="/app/audit">Audit my resume</Button>
          </div>
        )}
      >
        The link may be old or mistyped.
      </EmptyState>
    </div>
  );
}
