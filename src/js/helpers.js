/**
 * Maces DOM node from html string
 * @param {string} htmlString
 * @return {ChildNode}
 */
export const createElementFromHTML = function (htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstElementChild;
}

/**
 * adds an encoded in base64 selector to the url
 * @param {string} data
 * @return {string}
 */
export const generateUrlWithSelector = function (data) {
  const url = new URL(data?.payload?.url, window.location.origin);
  // pass an object
  url.searchParams.append('selector', window.btoa(data?.payload?.location));

  return url.toString();
}

/**
 * Simulate a click event.
 * @public
 * @param {Element} elem  the element to simulate a click on
 */
export const simulateClick = function (elem) {
  if (!elem) {
    return;
  }
  // Create our event (with options)
  const evt = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  });
  // If cancelled, don't dispatch our event
  const canceled = !elem.dispatchEvent(evt);
};