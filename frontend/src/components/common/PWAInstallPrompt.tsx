import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if user previously dismissed in this session
    const isDismissed = sessionStorage.getItem("shramigo_pwa_dismissed");
    if (isDismissed) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    try {
      sessionStorage.setItem("shramigo_pwa_dismissed", "true");
    } catch {
      // Ignore
    }
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px] rounded-2xl bg-white dark:bg-[#1C2825] border border-[#E5E7EB] dark:border-[#2C3834] p-3.5 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <img
          src="/icons/icon-192.png"
          alt="ShramiGo"
          className="w-10 h-10 rounded-xl shrink-0 shadow-sm"
        />
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-900 dark:text-[#F7F2E8] truncate">
            Install ShramiGo
          </p>
          <p className="text-[11px] text-gray-500 dark:text-[#9A9185] truncate">
            Add to home screen for native experience
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-xl bg-[#087F7A] text-white text-xs font-bold hover:bg-[#066561] transition active:scale-95 flex items-center gap-1.5"
        >
          <Download size={13} />
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-[#C8C0B4] transition"
          aria-label="Dismiss install prompt"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
