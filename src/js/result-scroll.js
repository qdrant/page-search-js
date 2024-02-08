(function() {
  const selector = new URLSearchParams(window.location.search).get('selector');
  if (selector) {
    const element = document.querySelector(window.atob(selector));
    const topOffset = 250;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - topOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });

    const t1 = setTimeout(() => {
      element.style.backgroundColor = 'rgba(255,246,188,0.73)'
      clearTimeout(t1);
    }, 1500);

    const t2 = setTimeout(() => {
      delete element.style.removeProperty('background-color');

      const url = new URL(window.location);
      url.searchParams.delete('selector');
      history.replaceState(null, null, url)

      clearTimeout(t2);
    }, 3000);

  }
})();
