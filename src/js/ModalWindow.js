/**
 * @class Modal Window
 * @param {Object} {modalOuterSelector, modalDialogSelector, closeBtnSelector, bodySelector}
 */
export class ModalWindow {
  #showEvent
  #hideEvent

  constructor({modalOuterSelector, modalDialogSelector, closeBtnSelector, resultSelector}) {
    // an outer element
    this.modal = document.querySelector(modalOuterSelector);
    // an outer element - a dialog window
    this.dialog = document.querySelector(modalDialogSelector);
    this.openBtn = document.querySelector('[data-target="#searchModal"]');
    this.closeBtn = this.modal.querySelector(closeBtnSelector);
    this.result = this.modal.querySelector(resultSelector);

    // events
    this.#showEvent = new Event('qdrModalShow');
    this.#hideEvent = new Event('qdrModalHide');

    this.boundEventHandler1 = this.show.bind(this)
    this.boundEventHandler2 = this.hide.bind(this)

    // listens for clicks on the open button
    this.openBtn.addEventListener('click', this.boundEventHandler1);

    // listens for clicks on the modal
    this.modal.addEventListener('click', (e) => {
      const isClickInsideDialog = this.dialog.contains(e.target) || e.target === this.dialog;
      const isClickInsideCloseBtn = this.closeBtn.contains(e.target) || e.target === this.closeBtn;

      // if clicked on the close button or outside of the dialog block
      if (!isClickInsideDialog || isClickInsideCloseBtn) {
        this.boundEventHandler2(e);
      }
    });

    // listens for the Esc button is pressed
    document.addEventListener('keydown', (e) => {
      if (e.key === "Escape") {
        this.boundEventHandler2(e);
      }
    })

  }

  show() {
    this.modal.style.display = 'block';
    this.modal.classList.add('active');
    document.dispatchEvent(this.#showEvent);
  }

  hide() {
    const modal = this.modal;
    const myEvent = this.#hideEvent;
    modal.classList.remove('active');
    const t = setTimeout(function () {
      modal.style.display = 'none';
      document.dispatchEvent(myEvent);
      clearTimeout(t);
    }, 300)
  }

  /**
   * @param {Array} newResultChildren - array of DOM Nodes
   */
  updateResultChildren(newResultChildren) {
    this.result.replaceChildren(...newResultChildren);
  }

}