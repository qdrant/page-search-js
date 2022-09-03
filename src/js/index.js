import {createElementFromHTML} from "./helpers";
import {SearchModal} from "./SearchModal";
import img from '../images/logo_with_text.svg';

// todo - on document ready

const innerModalHtml = `<div class="qdr-search" id="searchModal" tabindex="-1"
     aria-labelledby="searchModalLabel" aria-hidden="true">
     <div class="qdr-search__dialog">
         <div class="qdr-search__content">
             <div class="qdr-search__header">
                 <div class="qdr-search__title">
                     <div class="qdr-search__icon">
                         <span class="search-icon"></span>
                     </div>
                     <input type="text" class="qdr-search__input" placeholder="Search..."
                            id="searchInput" aria-label="Search">
                 </div>

                 <button type="button" class="qdr-search__close" aria-label="Close">
                     <span aria-hidden="true">&times;</span>
                 </button>
             </div>

             <div class="qdr-search__results"></div>

             <div class="qdr-search__footer">
                 Powered by
                 <span class="qdr-search__logo">
                    <img src="${img}" alt="Qdrant logo">
                 </span>
             </div>
         </div>
     </div>
 </div>`;

// adds modal markup to the page
document.body.appendChild(createElementFromHTML(innerModalHtml));

const createSearchModal = function (searchApiUrl) {
  console.log('createSearchModal')
  if (document.querySelector('.qdr-search').length === 0) {
    const t = setTimeout(() => {
      createSearchModal(searchApiUrl);
      clearTimeout(t);
    }, 100);
  }
  return new SearchModal({searchApiUrl});
}

window.createSearchModal = createSearchModal;

// todo: check in telegram