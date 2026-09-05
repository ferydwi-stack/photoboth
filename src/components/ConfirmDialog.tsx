"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, message, confirmText = "Ya", cancelText = "Batal",
  onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="card-cartoon relative z-10 p-6 max-w-sm w-full text-center animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-full bg-[#f0e6ff] border-2 border-[#764ba2] flex items-center justify-center">
            <HelpCircle className="w-7 h-7 text-[#764ba2]" />
          </div>
        </div>
        <h3 className="text-xl font-black text-[#2d1b4e] mb-2">{title}</h3>
        <p className="text-sm text-[#8b6cb0] mb-5">{message}</p>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-cartoon btn-cartoon-sm btn-cartoon-ghost">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="flex-1 btn-cartoon btn-cartoon-sm btn-cartoon-warm">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    resolve: ((v: boolean) => void) | null;
  }>({ open: false, title: "", message: "", resolve: null });

  const confirm = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, resolve });
    });
  };

  const handleConfirm = () => {
    state.resolve?.(true);
    setState((s) => ({ ...s, open: false }));
  };

  const handleCancel = () => {
    state.resolve?.(false);
    setState((s) => ({ ...s, open: false }));
  };

  const dialog = (
    <ConfirmDialog
      open={state.open}
      title={state.title}
      message={state.message}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, dialog };
}
