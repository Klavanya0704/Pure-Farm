/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, AlertCircle, Info, X, ShoppingCart } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  productName?: string;
  productImage?: string;
  actionType?: "view_cart" | "none";
}

export interface ToastContextValue {
  showCartSuccessToast: (productName: string, productImage?: string) => void;
  showToast: (options: {
    type?: "success" | "error" | "info";
    title: string;
    message: string;
    actionType?: "view_cart" | "none";
  }) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      type = "success",
      title,
      message,
      actionType = "none",
    }: {
      type?: "success" | "error" | "info";
      title: string;
      message: string;
      actionType?: "view_cart" | "none";
    }) => {
      const id = "toast-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
      const newToast: ToastMessage = { id, type, title, message, actionType };

      setToasts((prev) => [...prev.slice(-2), newToast]); // keep max 3 active toasts

      setTimeout(() => {
        dismissToast(id);
      }, 4500);
    },
    [dismissToast],
  );

  const showCartSuccessToast = useCallback(
    (productName: string, productImage?: string) => {
      const id = "toast-cart-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5);
      const newToast: ToastMessage = {
        id,
        type: "success",
        title: t("Added to Cart"),
        message: `${productName} ${t("added to your cart successfully.")}`,
        productName,
        productImage,
        actionType: "view_cart",
      };

      setToasts((prev) => [...prev.slice(-2), newToast]);

      setTimeout(() => {
        dismissToast(id);
      }, 5000);
    },
    [dismissToast, t],
  );

  return (
    <ToastContext.Provider value={{ showCartSuccessToast, showToast, dismissToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="assertive"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full rounded-2xl p-4 shadow-2xl transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 border backdrop-blur-md ${
              toast.type === "success"
                ? "bg-[#145A43] text-white border-emerald-400/40 shadow-emerald-950/20"
                : toast.type === "error"
                  ? "bg-red-900 text-white border-red-500/40 shadow-red-950/20"
                  : "bg-slate-900 text-white border-slate-700 shadow-slate-950/20"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Visual Icon */}
              <div className="shrink-0 mt-0.5">
                {toast.type === "success" ? (
                  <div className="h-8 w-8 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                ) : toast.type === "error" ? (
                  <div className="h-8 w-8 rounded-full bg-red-400/20 flex items-center justify-center text-red-300">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-300">
                    <Info className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Toast Body */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black tracking-tight leading-tight">
                    {toast.title}
                  </h4>
                  <button
                    type="button"
                    onClick={() => dismissToast(toast.id)}
                    className="text-white/70 hover:text-white transition p-1 rounded-full hover:bg-white/10 cursor-pointer"
                    aria-label="Close notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  {toast.message}
                </p>

                {/* Actions */}
                {toast.actionType === "view_cart" && (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        dismissToast(toast.id);
                        void navigate({ to: "/cart" });
                      }}
                      className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-white text-[#145A43] hover:bg-emerald-50 text-xs font-black transition shadow-sm cursor-pointer"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {t("View Cart")}
                    </button>
                    <button
                      type="button"
                      onClick={() => dismissToast(toast.id)}
                      className="h-8 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer"
                    >
                      {t("Close")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
