// This functionality is adapted mor light speed source code:
// https://github.com/Teamwork/teamwork-lightspeed/blob/main/lightspeed/src/designsystem/components/overlay/menu/blockScrollStrategy.js

const scrollBlockedClass = 'js-scroll-blocked';
const scrollBlockedSelector = '.js-scroll-blocked';

function hasScrollbar(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  const style = window.getComputedStyle(el);
  return (
    style.overflowY === 'scroll'
    || (style.overflowY === 'auto' && el.scrollHeight > el.clientHeight)
    || style.overflowX === 'scroll'
    || (style.overflowX === 'auto' && el.scrollWidth > el.clientWidth)
  );
}

function getScrollParents(el, stopAt) {
  const elements = [];

  if (stopAt && el && !stopAt.contains(el)) {
    return elements;
  }

  while (el) {
    if (hasScrollbar(el) || el.classList.contains(scrollBlockedClass)) {
      elements.push(el);
    }
    if (el === stopAt) {
      break;
    }
    el = el.parentElement;
  }

  return elements;
}

function getBlockedScrollParents(el, stopAt) {
  const elements = [];

  if (stopAt && el && !stopAt.contains(el)) {
    return elements;
  }

  while (el) {
    if (el.classList.contains(scrollBlockedClass)) {
      elements.push(el);
    }
    if (el === stopAt) {
      break;
    }
    el = el.parentElement;
  }

  return elements;
}

/**
 * adapted from lightSpeed
 * @param {Object} dropdown
 */
export function blockParentsScroll(dropdown) { // eslint-disable-line import/prefer-default-export
  let scrollElements = [];
  scrollElements = [...new Set(getScrollParents(dropdown))];
  scrollElements.forEach((el) => {
    el.style.overflow = 'hidden';
    el.style.touchAction = 'none';
    el.style.overscrollBehavior = 'none';
    el.classList.add(scrollBlockedClass);
  });
}

export function unblockParentsScrolls(dropdown) { // eslint-disable-line import/prefer-default-export
  let scrollElements = [];
  scrollElements = [...new Set(getBlockedScrollParents(dropdown))];
  scrollElements.forEach((el) => {
    el.style.overflow = '';
    el.style.touchAction = '';
    el.style.overscrollBehavior = '';
    el.classList.remove(scrollBlockedClass);
  });
}

export function unblockAllScrolls() { // eslint-disable-line import/prefer-default-export
  let scrollElements = [];
  scrollElements = document.querySelectorAll(scrollBlockedSelector);
  scrollElements.forEach((el) => {
    el.style.overflow = '';
    el.style.touchAction = '';
    el.style.overscrollBehavior = '';
    el.classList.remove(scrollBlockedClass);
  });
}
