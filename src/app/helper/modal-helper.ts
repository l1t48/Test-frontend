
declare const bootstrap: any;

export class ModalHelper {

  private static listenersAttached = new Set<string>();

  static hideModal(modalId: string) {
    const el = document.getElementById(modalId);
    if (!el) return;

    const active = document.activeElement as HTMLElement | null;
    if (active && el.contains(active)) active.blur();

    const modalInstance = bootstrap.Modal.getInstance(el) ?? new bootstrap.Modal(el);
    modalInstance.hide();
  }

  static showModal(modalId: string) {
    const el = document.getElementById(modalId);
    if (!el) return;

    const modalInstance = bootstrap.Modal.getInstance(el) ?? new bootstrap.Modal(el);

    // Attach listener only once
    if (!this.listenersAttached.has(modalId)) {
      el.addEventListener('hide.bs.modal', () => {
        const active = document.activeElement as HTMLElement | null;
        if (active && el.contains(active)) active.blur();
      });
      this.listenersAttached.add(modalId);
    }

    modalInstance.show();
  }
}


// declare const bootstrap: any;

// export class ModalHelper {
//   /**
//    * Safely hides a Bootstrap modal by blurring any focused element inside it
//    * to prevent aria-hidden/focus warnings.
//    * @param modalId The id of the modal element to hide
//    */
//   static hideModal(modalId: string) {
//     const el = document.getElementById(modalId);
//     if (!el) return;

//     const active = document.activeElement as HTMLElement | null;
//     if (active && el.contains(active)) {
//       active.blur();
//     }

//     const modalInstance = bootstrap.Modal.getInstance(el) ?? new bootstrap.Modal(el);
//     modalInstance.hide();
//   }

//   /**
//    * Shows a Bootstrap modal by id and attaches a cleanup listener for ESC and other dismissals
//    * @param modalId The id of the modal element to show
//    */
//   static showModal(modalId: string) {
//     const el = document.getElementById(modalId);
//     if (!el) return;

//     const modalInstance = bootstrap.Modal.getInstance(el) ?? new bootstrap.Modal(el);

//     // Add listener for any hide event (click X, Close button, ESC, backdrop)
//     el.addEventListener('hide.bs.modal', () => {
//       const active = document.activeElement as HTMLElement | null;
//       if (active && el.contains(active)) {
//         active.blur();
//       }
//     });

//     modalInstance.show();
//   }
// }


// declare const bootstrap: any;

// export class ModalHelper {
//   /**
//    * Safely hides a Bootstrap modal by blurring any focused element inside it
//    * to prevent aria-hidden/focus warnings.
//    * @param modalId The id of the modal element to hide
//    */
//   static hideModal(modalId: string) {
//     const el = document.getElementById(modalId);
//     if (!el) return;

//     // Remove focus from any focused descendant
//     const active = document.activeElement as HTMLElement | null;
//     if (active && el.contains(active)) {
//       active.blur();
//     }

//     // Get existing Bootstrap modal instance or create one
//     const modalInstance = bootstrap.Modal.getInstance(el) ?? new bootstrap.Modal(el);
//     modalInstance.hide();
//   }

//   /**
//    * Shows a Bootstrap modal by id
//    * @param modalId The id of the modal element to show
//    */
//   static showModal(modalId: string) {
//     const el = document.getElementById(modalId);
//     if (!el) return;

//     const modalInstance = bootstrap.Modal.getInstance(el) ?? new bootstrap.Modal(el);
//     modalInstance.show();
//   }
// }
