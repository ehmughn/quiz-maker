import { createContext, useContext, useState, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";

const ModalContext = createContext();

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  const confirm = useCallback(
    ({
      title,
      message,
      confirmText = "Confirm",
      cancelText = "Cancel",
      danger = false,
    }) => {
      return new Promise((resolve) => {
        setModal({
          title,
          message,
          confirmText,
          cancelText,
          danger,
          onConfirm: () => {
            setModal(null);
            resolve(true);
          },
          onCancel: () => {
            setModal(null);
            resolve(false);
          },
        });
      });
    },
    [],
  );

  const closeModal = useCallback(() => {
    setModal(null);
  }, []);

  return (
    <ModalContext.Provider value={{ confirm, closeModal }}>
      {children}
      {modal && <ConfirmModal {...modal} />}
    </ModalContext.Provider>
  );
}

function ConfirmModal({
  title,
  message,
  confirmText,
  cancelText,
  danger,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          {danger && (
            <div className="shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              danger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
