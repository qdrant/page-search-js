# Qdrant Page Search Widget

A search widget for documentation sites that can work with either a backend search API or directly with Qdrant vector database.

## Features

- 🔍 Full-text semantic search powered by Qdrant
- ⚡ Direct connection to Qdrant (no backend required)
- 🔄 Backward compatible with existing search APIs
- ⌨️ Keyboard navigation (arrows, enter, escape)
- 🎨 Customizable appearance
- 📱 Mobile responsive
- 🚀 Client-side highlighting

## Installation

```bash
npm install qdrant-page-search
```

### Option 1: Direct Qdrant Connection (Recommended)

Add styles to the `head` tag:
```html
<link rel="stylesheet" href="<path_to_the_plugin>/dist/css/styles.min.css">
```

Add scripts and configuration at the end of `body` tag:
```html
<script defer src="<path_to_the_plugin>/dist/js/search.min.js" type="module"></script>
<script defer>
    window.addEventListener('DOMContentLoaded', () => {
        initQdrantSearch({
            searchApiUrl: 'https://search.qdrant.tech/api/search', // fallback
            section: 'documentation',
            useDirectQdrant: true,
            qdrantConfig: {
                qdrantUrl: 'http://localhost:6333',
                collectionName: 'site',
                // apiKey: 'your-api-key' // optional
            }
        });
    });
</script>
```

### Option 2: Legacy Backend API

For backward compatibility with existing search backends:
```html
<script defer src="<path_to_the_plugin>/dist/js/search.min.js" type="module"></script>
<script defer>
    window.addEventListener('DOMContentLoaded', () => {
        initQdrantSearch({
            searchApiUrl: 'https://search.qdrant.tech/api/search',
            section: 'documentation',
            // partition: 'optional-partition'
        });
    });
</script>
```

## Add Search Button

Add the search button anywhere on your page:
```html
<button type="button" class="qdr-search-input-btn" data-target="#searchModal">
    Search...
</button>
```

## Direct Qdrant Setup

### Requirements
- Qdrant instance with Query API enabled
- Collection with inference configuration
- CORS enabled for browser access

### Qdrant Configuration
```yaml
service:
  enable_cors: true

inference:
  provider: "cloud-inference-proxy"
  model: "sentence-transformers/all-minilm-l6-v2"
```

### Collection Schema
Your collection should have the following payload structure:
```json
{
  "text": "searchable content",
  "titles": ["Page Title", "Section Title"],
  "url": "/path/to/page",
  "sections": ["documentation", "guides"],
  "tag": "p",
  "partition": "optional",
  "location": "css-selector"
}
```

## Scroll to Results

To automatically scroll to search results after navigation:
```html
<script src="<path_to_the_plugin>/dist/js/scroll.min.js" type="module"></script>
```

## Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup
```bash
npm install
```

### Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## Project Structure

```
├── src/
│   ├── js/
│   │   ├── QdrantDirectClient.js  # Direct Qdrant connection
│   │   ├── Search.js              # Search logic with adapter pattern
│   │   ├── SearchModal.js         # Modal UI component
│   │   └── index.js               # Entry point
│   └── scss/
│       └── styles.scss            # Styles
├── test/
│   ├── QdrantDirectClient.test.js # Unit tests
│   └── QdrantDirectClient.mocks.js # Test mocks
└── dist/                          # Built files
```

## API Reference

### `initQdrantSearch(config)`

Initialize the search widget.

**Parameters:**
- `searchApiUrl` (string) - Backend search API URL (used as fallback)
- `section` (string) - Filter by section
- `partition` (string) - Filter by partition
- `useDirectQdrant` (boolean) - Enable direct Qdrant connection
- `qdrantConfig` (object) - Qdrant configuration
  - `qdrantUrl` (string) - Qdrant server URL
  - `collectionName` (string) - Collection name
  - `apiKey` (string) - Optional API key

## Customization

### Styling

1. Override CSS classes in your stylesheet
2. Or modify variables in `src/scss/_variables.scss` and rebuild:

```scss
$qdr-primary-color: #007bff;
$qdr-modal-background: rgba(0, 0, 0, 0.5);
$qdr-border-radius: 4px;
```

### Search Behavior

The widget supports:
- Minimum 3 characters for semantic search
- Debounced input (100ms)
- Result highlighting
- Keyboard navigation
- Mobile touch support

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers with ES6 support

## License

Apache 2.0 - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create your feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Troubleshooting

### CORS Issues
Ensure Qdrant is configured with:
```yaml
service:
  enable_cors: true
```

### Empty Results
Check that:
1. Collection exists and has data
2. Inference is properly configured
3. Field names match expected schema

### Performance
For large collections:
1. Use appropriate HNSW parameters
2. Enable caching in Qdrant
3. Consider using CDN for the widget
