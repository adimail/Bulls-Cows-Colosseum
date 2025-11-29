import { useRegisterSW } from "virtual:pwa-register/react";

function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log("SW Registered:", r);
    },
    onRegisterError(error) {
      console.log("SW registration error:", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (offlineReady || needRefresh) {
    return (
      <div className="fixed right-0 bottom-0 m-4 p-4 z-50 bg-dark-card border border-bronze/50 text-parchment font-roman">
        <div className="mb-2">
          {offlineReady ? (
            <span>App ready to work offline</span>
          ) : (
            <span>
              New content available, click on reload button to update.
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {needRefresh && (
            <button
              className="py-2 px-4 bg-crimson hover:bg-crimson/80 text-parchment font-bold transition-colors"
              onClick={() => updateServiceWorker(true)}
            >
              Reload
            </button>
          )}
          <button
            className="py-2 px-4 text-stone-light hover:text-parchment transition-colors"
            onClick={() => close()}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default ReloadPrompt;
