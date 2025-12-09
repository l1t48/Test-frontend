declare const bootstrap: any;

export class ModalHelper {
  private static _lastActive = new Map<string, Element | null>();

  static showModal(modalId: string) {
    const el = document.getElementById(modalId);
    if (!el) return;

    // Record the element that had focus when opening (the "opener")
    ModalHelper._lastActive.set(modalId, document.activeElement);

    // Get instance or create
    const modalInstance = bootstrap.Modal.getInstance(el) ?? new bootstrap.Modal(el);

    // Attach a one-time handler on the **hide** lifecycle so we restore focus BEFORE aria-hidden is applied.
    const onHide = (ev: Event) => {
      try {
        // If focus is still inside the modal, move it out to the opener (or fallback)
        const active = document.activeElement as HTMLElement | null;
        if (active && el.contains(active)) {
          const opener = ModalHelper._lastActive.get(modalId) as (HTMLElement | null | undefined);

          if (opener && typeof (opener as HTMLElement).focus === 'function') {
            (opener as HTMLElement).focus();
          } else {
            // Fallback: temporarily make body focusable and focus it then restore
            const body = document.body as HTMLElement;
            const prevTab = body.getAttribute('tabindex');
            body.setAttribute('tabindex', '-1');
            body.focus();
            if (prevTab === null) {
              body.removeAttribute('tabindex');
            } else {
              body.setAttribute('tabindex', prevTab);
            }
          }
        }
      } finally {
        // cleanup this listener and recorded opener
        el.removeEventListener('hide.bs.modal', onHide as EventListener);
        ModalHelper._lastActive.delete(modalId);
      }
    };

    // Use hide.bs.modal (fires *before* modal is hidden / aria-hidden changed)
    el.addEventListener('hide.bs.modal', onHide as EventListener);

    modalInstance.show();
  }

  static hideModal(modalId: string) {
    const el = document.getElementById(modalId);
    if (!el) return;

    // If currently focused element is within the modal, blur it to be safe
    const active = document.activeElement as HTMLElement | null;
    if (active && el.contains(active)) {
      // Prefer returning focus to opener if we recorded it
      const opener = ModalHelper._lastActive.get(modalId) as (HTMLElement | null | undefined);
      if (opener && typeof opener.focus === 'function') {
        opener.focus();
      } else {
        active.blur();
      }
    }

    const modalInstance = bootstrap.Modal.getInstance(el) ?? new bootstrap.Modal(el);
    modalInstance.hide();

    // ensure cleanup in case hideModal is used directly
    ModalHelper._lastActive.delete(modalId);
  }
}
