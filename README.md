Add markup for the search modal popup:

```html

<!-- Search Modal -->
<div class="modal fade qdr-search" id="searchModal" data-keyboard="true" tabindex="-1"
     aria-labelledby="searchModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-lg qdr-search__dialog">
        <div class="modal-content">

            <div class="modal-header qdr-search__header">
                <div class="modal-title input-group">
                    <div class="input-group-append">
                        <span class="input-group-text qdr-search__icon" id="basic-addon2">
                            <i class="fa fa-search"></i>
                        </span>
                    </div>
                    <input type="text" class="form-control qdr-search__input" placeholder="Search..."
                           id="searchInput" aria-label="Search">
                </div>

                <button type="button" class="close qdr-search__close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>

            <div class="modal-body qdr-search__results"></div>

            <div class="modal-footer qdr-search__footer">
                Powered by
                <figure><img class="qdr-search__logo" class="" src="/images/logo_with_text.svg" alt="Qdrant logo"></figure>
            </div>
        </div>
    </div>
</div>
```

And the button:

```html
<!-- Button trigger modal -->
<button type="button" class="qdr-search-input-btn" data-toggle="modal" data-target="#searchModal">
    <i class="fa fa-search mr-3"></i> Search...
</button>
```