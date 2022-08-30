
Add markup for the search modal popup at the end of a page:

```html

<!-- Search Modal -->
<div id="qdr-modal-wrapper"></div>

```

And the button in the place you want to see it:

```html
<!-- Button trigger modal -->
<button type="button" class="qdr-search-input-btn" data-toggle="modal" data-target="#searchModal">
    <i class="fa fa-search mr-3"></i> Search...
</button>
```
 
# Build the project 

```bash
npm install
npm run build
```