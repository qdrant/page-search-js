$(document).ready(() => {
  const selector = new URLSearchParams(window.location.search).get('selector');
  if (selector) {
    console.log(window.atob(selector))
    const element = document.querySelector(window.atob(selector));
    const topOffset = 45;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - topOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });

    const t1 = setTimeout(() => {
      element.style.backgroundColor = 'rgba(255,250,215,0.53)'
      clearTimeout(t1);
    }, 1500);

    const t2 = setTimeout(() => {
      delete element.style.removeProperty('background-color');
      clearTimeout(t2);
    }, 3000);

  }
});
