import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const confirmColors =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-primary hover:bg-primary-dark text-white";

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-border w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-text-muted hover:text-text rounded-lg hover:bg-surface-light transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center text-center gap-3">
          <div
            className={`p-3 rounded-full ${variant === "danger" ? "bg-red-50" : "bg-amber-50"}`}
          >
            <AlertTriangle
              size={24}
              className={
                variant === "danger" ? "text-red-500" : "text-amber-500"
              }
            />
          </div>

          <h3 className="text-lg font-bold text-text">{title}</h3>
          {message && (
            <p className="text-sm text-text-muted leading-relaxed">{message}</p>
          )}

          <div className="flex gap-3 w-full mt-2">
            <button
              ref={cancelRef}
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium border border-border rounded-xl hover:bg-surface-light transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-colors ${confirmColors}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
