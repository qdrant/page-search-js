/**
 * Maces DOM node from html string
 * @param {string} htmlString
 * @return {ChildNode}
 */
export const createElementFromHTML = (htmlString) => {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstElementChild;
};

/**
 * adds an encoded in base64 selector to the url
 * @param {string} data
 * @param {string|null} query
 * @return {string}
 */
export const generateUrlWithSelector = (data, query = null) => {
  const url = new URL(data?.payload?.url, window.location.origin);
  // pass an object
  url.searchParams.append('selector', window.btoa(data?.payload?.location));
  if (query) {
    url.searchParams.append('q', query);
  }

  return url.toString();
};

/**
 * Simulate a click event.
 * @public
 * @param {Element} elem  the element to simulate a click on
 */
export const simulateClick = (elem) => {
  if (!elem) {
    return;
  }
  // Create and dispatch the click event
  const evt = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  });
  elem.dispatchEvent(evt);
};
