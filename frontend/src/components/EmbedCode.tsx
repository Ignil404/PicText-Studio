import { useState } from 'react';

interface EmbedCodeProps {
  shareUrl: string;
  templateId: string;
}

export const EmbedCode = ({ shareUrl, templateId }: EmbedCodeProps) => {
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe
  src="${shareUrl}/embed"
  width="540"
  height="540"
  frameborder="0"
  allowfullscreen
></iframe>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-bold">Встраивание</h3>
      <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
        <code>{embedCode}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-bold"
      >
        {copied ? '✅ Скопировано!' : '📋 Копировать код'}
      </button>
    </div>
  );
};

export default EmbedCode;