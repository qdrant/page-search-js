For an example look into `index.html`

# Installation

```bash
npm install qdrant-page-search
```

Add styles to the `head` tag:

```html
<link rel="stylesheet" href="<path_to_the_plugin>/dist/css/styles.min.css">
```

At the end of a `body` tag add:

```html

<script defer src="<path_to_the_plugin>/dist/js/search.min.js" type="module"></script>
<script defer>
    window.addEventListener('DOMContentLoaded', () => {
        initQdrantSearch({searchApiUrl: 'your_search_API_URL'});
    });
</script>
```

To scroll a page to the result text after transition use `js/scroll.min.js`

```html
<script src="<path_to_the_plugin>/dist/js/scroll.min.js" type="module"></script>
```

# Add search button

And the button in the place you want to see it:

```html
<!-- Button trigger modal -->
<button type="button" class="qdr-search-input-btn" data-target="#searchModal">
    Search...
</button>
```
 
# Development

## Build the project

```bash
npm install
npm run build
```

## Develop mode

```bash
npm install
npm run dev
```