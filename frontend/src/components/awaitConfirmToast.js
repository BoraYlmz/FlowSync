import { confirmToast } from "./confirmToast";

export function awaitConfirmToast(options) {
  return new Promise((resolve) => {
    confirmToast({
      ...options,
      onConfirm: () => {
        options?.onConfirm?.();
        resolve(true);
      },
      onCancel: () => {
        options?.onCancel?.();
        resolve(false);
      },
    });
  });
}