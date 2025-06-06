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
    this.openBtns = document.querySelectorAll('[data-target="#searchModal"]');
    this.closeBtn = this.modal.querySelector(closeBtnSelector);
    this.result = this.modal.querySelector(resultSelector);

    // events
    this.#showEvent = new Event('qdrModalShow');
    this.#hideEvent = new Event('qdrModalHide');

    const boundShowHandler = this.show.bind(this)
    const boundHideHanler = this.hide.bind(this)

    // listens for clicks on the open buttons
    this.openBtns.forEach(btn => btn.addEventListener('click', boundShowHandler));


    // listens for clicks on the modal
    this.modal.addEventListener('click', (e) => {
      const isClickInsideDialog = this.dialog.contains(e.target) || e.target === this.dialog;
      const isClickInsideCloseBtn = this.closeBtn.contains(e.target) || e.target === this.closeBtn;

      // if clicked on the close button or outside of the dialog block
      if (!isClickInsideDialog || isClickInsideCloseBtn) {
        boundHideHanler(e);
      }
    });

    // listens for the Esc button is pressed
    document.addEventListener('keydown', (e) => {
      if (e.key === "Escape") {
        boundHideHanler(e);
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
  updateResultChildren(newResultChildren, callback) {
    this.result.replaceChildren(...newResultChildren);
    if (callback && typeof callback === 'function') {
      callback();
    }
  }

}