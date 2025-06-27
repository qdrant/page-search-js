import { createElementFromHTML } from './helpers.js';
import { SearchModal } from './SearchModal.js';

const initQdrantSearch = ({
  searchApiUrl,
  section,
  partition,
  useDirectQdrant = false,
  qdrantConfig = {},
}) => {
  const innerModalHtml = `<div class="qdr-search" id="searchModal" tabindex="-1"
    aria-labelledby="searchModalLabel" aria-hidden="true">
    <div class="qdr-search__dialog">
        <div class="qdr-search__content">
            <div class="qdr-search__header">
                <div class="qdr-search__title">
                    <div class="qdr-search__icon">
                        <span class="search-icon"></span>
                    </div>
                    <input type="text" class="qdr-search__input" autocomplete="off" placeholder="Search..."
                          id="searchInput" aria-label="Search">
                </div>

                <button type="button" class="qdr-search__close" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>

            <div class="qdr-search__results"></div>

            <div class="qdr-search__footer">
                <a href="https://qdrant.tech/" target="_blank" rel="nofollow">
                    Powered by
                    <span class="qdr-search__logo"></span>
                </a>
            </div>
        </div>
    </div>
  </div>`;
  // adds modal markup to the page
  document.body.appendChild(createElementFromHTML(innerModalHtml));
  return new SearchModal({
    searchApiUrl,
    section,
    partition,
    useDirectQdrant,
    qdrantConfig,
  });
};

window.initQdrantSearch = initQdrantSearch;

export default initQdrantSearch;
