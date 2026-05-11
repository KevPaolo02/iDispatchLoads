"use client";

import type { FormHTMLAttributes, ReactNode } from "react";

type ConfirmFormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "children"> & {
  /** Message shown in the native browser confirm() dialog. */
  confirmMessage: string;
  children: ReactNode;
};

/**
 * Wrap a server-action form so the user must confirm before submission.
 *
 * Phase 1 ships native browser confirm(); Phase 2 may swap for a real modal.
 * Keep this client component dumb — no state, no router calls.
 */
export function ConfirmForm({ confirmMessage, children, ...formProps }: ConfirmFormProps) {
  return (
    <form
      {...formProps}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
