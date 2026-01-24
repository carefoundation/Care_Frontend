'use client';

import { createRoot } from 'react-dom/client';
import Toast from '@/components/ui/Toast';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastContainer: HTMLDivElement | null = null;
let toastList: ToastItem[] = [];

function createToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (typeof window === 'undefined') return;
  
  const container = createToastContainer();
  const id = `toast-${Date.now()}-${Math.random()}`;
  
  const toast: ToastItem = { id, message, type };
  toastList.push(toast);
  
  renderToasts();
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    removeToast(id);
  }, 4000);
}

function removeToast(id: string) {
  toastList = toastList.filter((toast) => toast.id !== id);
  renderToasts();
}

function renderToasts() {
  if (!toastContainer || typeof window === 'undefined') return;
  
  // Clear existing content
  toastContainer.innerHTML = '';
  
  // Render each toast
  toastList.forEach((toast) => {
    const toastDiv = document.createElement('div');
    toastContainer!.appendChild(toastDiv);
    
    const root = createRoot(toastDiv);
    root.render(
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => removeToast(toast.id)}
      />
    );
  });
}

