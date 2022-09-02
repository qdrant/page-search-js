import {generateUrlWithSelector} from "./helpers";
import {ModalWindow} from "./ModalWindow";
import {Search} from "./Search";

export class SearchModal {
  constructor({searchApiUrl}) {
    this.apiUrl = searchApiUrl;
    this.modal = new ModalWindow({
      modalOuterSelector: '#searchModal',
      modalDialogSelector: '.qdr-search__dialog',
      closeBtnSelector: '.qdr-search__close',
      resultSelector: '.qdr-search__results'
    });
    this.searchInput = new Search({apiUrl: this.apiUrl})

    // when a search modal is shown
    this.boundEventHandler1 = this.setFocus.bind(this)
    document.addEventListener('qdrModalShow', this.boundEventHandler1);

    // when new search data if ready to be shown
    this.boundEventHandler2 = this.updateResult.bind(this)
    document.addEventListener('searchDataIsReady', this.boundEventHandler2);
  }

  /**
   * generates DOM element (<a>) with inner HTML for one result
   * @param data - an object for one result
   * @return {HTMLAnchorElement}
   */
  generateSearchResult(data) {
    const resultElem = document.createElement('a');
    resultElem.classList.add('media', 'qdr-search-result');
    resultElem.href = generateUrlWithSelector(data);
    resultElem.innerHTML = `<span class="align-self-center qdr-search-result__icon"><i class="fas fa-file-alt"></i></span>
                   <div class="media-body"><h5 class="mt-0">${data.payload.titles.join(' > ')}</h5>
                   <p>${data.payload.text}</p></div>`;
    return resultElem;
  }

  updateResult() {
    const newResultChildren = [];
    this.searchInput.data.forEach(res => {
      newResultChildren.push(this.generateSearchResult(res));
    });
    this.modal.updateResultChildren(newResultChildren);
  }

  setFocus() {
    this.searchInput.ref.focus();
  }
}
