document.addEventListener("DOMContentLoaded", () => {
  const selector = new URLSearchParams(window.location.search).get("selector");
  if (!selector) return;

  try {
    const decodedSelector = window.atob(selector);
    const element = document.querySelector(decodedSelector);

    if (!element) {
      console.warn(`Element not found for selector: ${decodedSelector}`);
      return;
    }

    const topOffset = 250;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - topOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });

    setTimeout(() => {
      element.style.backgroundColor = "rgba(255,246,188,0.73)";
    }, 1500);

    setTimeout(() => {
      element.style.backgroundColor = "";

      const url = new URL(window.location);
      url.searchParams.delete("selector");
      history.replaceState(null, null, url);
    }, 3000);
  } catch (error) {
    console.error("Error processing selector:", error);
  }
});
