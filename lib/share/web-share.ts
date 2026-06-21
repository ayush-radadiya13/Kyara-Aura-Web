import { toast } from 'sonner';

export type ShareContent = {
  title?: string;
  text?: string;
  url?: string;
};

export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export function isShareCancelledError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === 'AbortError';
  }

  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as DOMException).name === 'AbortError'
  );
}

function buildShareData(content: ShareContent): ShareData {
  const shareData: ShareData = {};
  const title = content.title?.trim();
  const text = content.text?.trim();
  const url = content.url?.trim() || (typeof window !== 'undefined' ? window.location.href : '');

  if (title) {
    shareData.title = title;
  }

  if (text) {
    shareData.text = text;
  }

  if (url) {
    shareData.url = url;
  }

  return shareData;
}

async function copyUrlToClipboard(url: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard API is not available');
  }

  await navigator.clipboard.writeText(url);
  toast.success('Link copied to clipboard');
}

export async function sharePage(content: ShareContent = {}): Promise<void> {
  const shareData = buildShareData(content);
  const url = shareData.url ?? window.location.href;

  if (isWebShareSupported()) {
    const canShare = !navigator.canShare || navigator.canShare(shareData);

    if (canShare) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (isShareCancelledError(error)) {
          return;
        }
      }
    }
  }

  try {
    await copyUrlToClipboard(url);
  } catch {
    toast.error('Unable to share this page');
  }
}
