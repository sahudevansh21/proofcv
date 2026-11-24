import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button, useToast } from '../../components/ui/index.js';
import { copyText } from '../../lib/clipboard.js';

/** Copies text and warns when it still contains [placeholders]. */
export function CopyButton({ text, label = 'Copy', size = 'sm', variant = 'secondary', className }) {
  const [done, setDone] = useState(false);
  const toast = useToast();
  const onClick = async () => {
    try {
      const unfilled = await copyText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1500);
      if (unfilled > 0) toast(`Copied, but ${unfilled} placeholder${unfilled > 1 ? 's are' : ' is'} unfilled. Replace each [ ] with a true detail.`, { tone: 'warning', duration: 5000 });
    } catch {
      toast('Couldn\'t copy. Select the text and copy it manually.', { tone: 'error' });
    }
  };
  return (
    <Button size={size} variant={variant} icon={done ? Check : Copy} onClick={onClick} className={`no-print ${className ?? ''}`}>
      {done ? 'Copied' : label}
    </Button>
  );
}
