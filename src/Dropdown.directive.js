import debounce from 'debounce';
import {
  collocateElementAt,
  getAvailableCollocations,
  getRequestedCollocation,
} from './collocateElement.utility';
import {
  blockParentsScroll,
  unblockAllScrolls,
  unblockParentsScrolls,
} from './blockScrollStrategy';

const hasTouchSupport = ('ontouchstart' in document.documentElement);
const quickTimeout = 300;

const moveElementFromOriginalPlaceToBodyRoot = (element) => {
  const hasElementMoved = element.getAttribute('has-element-moved') === 'true';
  if (!element || !element.id || hasElementMoved) { return; }
  const placeholderElement = document.createElement('span');
  placeholderElement.setAttribute('original-location-element-id', element.id);
  element.parentNode?.insertBefore?.(placeholderElement, element);
  document.body.appendChild(element);
  element.setAttribute('has-element-moved', true);
};

const moveElementBackToOriginalPlace = (element) => {
  const hasElementMoved = element.getAttribute('has-element-moved') === 'true';
  if (!element || !element.id || !hasElementMoved) { return; }
  const placeholderElement = document.querySelector(`[original-location-element-id="${element.id}"]`);
  if (!placeholderElement) {
    element.parentNode?.removeChild?.(element);
    return;
  }
  placeholderElement.parentNode?.insertBefore?.(element, placeholderElement);
  element.removeAttribute('has-element-moved');
  placeholderElement.parentNode?.removeChild?.(placeholderElement);
};

const isTargetingDropdown = (event) => {
  const elements = Array.from(document.querySelectorAll('[dropdown-id]'));
  const findTargetedElement = (element) => element.contains(event?.target) || element === event?.target;
  return elements?.some(findTargetedElement);
};

export const closeAllDropdowns = (event) => {
  if (isTargetingDropdown(event)) { return; }
  const dropdowns = Array.from(document.querySelectorAll('[dropdown-id]'));
  const closeDropdown = (dropdown) => dropdown.close?.();
  dropdowns?.forEach(closeDropdown);
  unblockAllScrolls();
};

const closeDropdownsOnEscKey = (event) => {
  event?.stopPropagation?.();
  if (event?.keyCode !== 'esc') { return; }
  closeAllDropdowns();
};

const recalculateAllPositions = debounce(() => {
  const dropdowns = document.querySelectorAll('[dropdown-id]');
  dropdowns.forEach((dropdown) => {
    dropdown.recalculatePosition?.();
  });
}, 500);

const closeOtherDropdowns = (currentDropdown) => {
  const keepListenersAttachedParamToPass = false;
  const dropdowns = Array.from(document.querySelectorAll('[dropdown-id]'));
  const filterByCurrentDropdown = (dropdown) => dropdown !== currentDropdown;
  const closeDropdown = (dropdown) => dropdown.close?.(keepListenersAttachedParamToPass);
  dropdowns?.filter(filterByCurrentDropdown).forEach(closeDropdown);
};

const attachListeners = () => {
  document.addEventListener('click', closeAllDropdowns);
  document.body.addEventListener('click', closeAllDropdowns);
  document.addEventListener('keyup', closeDropdownsOnEscKey);
  document.body.addEventListener('keyup', closeDropdownsOnEscKey);
  window.addEventListener('resize', recalculateAllPositions);
};

const detachListeners = () => {
  document.removeEventListener('click', closeAllDropdowns);
  document.body.removeEventListener('click', closeAllDropdowns);
  document.removeEventListener('keyup', closeDropdownsOnEscKey);
  document.body.removeEventListener('keyup', closeDropdownsOnEscKey);
  window.removeEventListener('resize', recalculateAllPositions);
};

const openDropdown = ({
  dropdown,
  arrow,
  backgroundMask,
  scrollableContentClassName,
  disableTouchScrollClassName,
  touchCloseButton,
  trigger,
}, {
  offset,
  collocation,
  availableCollocations,
  onOpen,
  keepOthersOpen,
}) => {
  if (!keepOthersOpen) { dropdown.closeOthers?.(); }
  const isDropdownOpen = dropdown.getAttribute('open') === 'true';
  if (isDropdownOpen) { return; }
  if (backgroundMask.element) {
    document.body.appendChild(backgroundMask.element);
    backgroundMask.element.style.display = 'block';
  }
  if (touchCloseButton.element) {
    document.body.appendChild(touchCloseButton.element);
    touchCloseButton.element.style.display = 'none';
  }
  dropdown.setAttribute('open', true);
  moveElementFromOriginalPlaceToBodyRoot(dropdown);
  dropdown.style.display = 'block';
  if (arrow.element) {
    document.body.appendChild(arrow.element);
    arrow.element.style.display = 'block';
  }
  const isCollocated = collocateElementAt({
    trigger,
    element: dropdown,
    touchCloseButton,
    elementContent: dropdown.querySelector(`.${scrollableContentClassName}`),
    elementPreventTouchScroll: document.querySelector(`.${disableTouchScrollClassName}`),
    arrow,
  }, offset, collocation, availableCollocations);
  if (!isCollocated) {
    trigger.click?.();
    return;
  }
  blockParentsScroll(trigger);
  // timeout fixes a bug where same open click event triggers the closeDropdown event
  setTimeout(() => {
    attachListeners();
  }, quickTimeout);
  onOpen?.();
};

const closeDropdown = ({
  dropdown,
  arrow,
  backgroundMask,
  touchCloseButton,
  trigger,
}, {
  onClose,
}, keepListenersAttached) => {
  const isDropdownOpen = dropdown.getAttribute('open') === 'true';
  if (!isDropdownOpen) { return; }
  if (backgroundMask.element) {
    backgroundMask.element.parentNode.removeChild(backgroundMask.element);
    backgroundMask.element.style.display = 'none';
  }
  if (touchCloseButton.element) {
    touchCloseButton.element.parentNode.removeChild(touchCloseButton.element);
    touchCloseButton.element.style.display = 'none';
  }
  dropdown.setAttribute('open', false);
  moveElementBackToOriginalPlace(dropdown);
  dropdown.style.display = 'none';
  if (arrow.element) {
    arrow.element.parentNode.removeChild(arrow.element);
    arrow.element.style.display = 'none';
  }
  if (!keepListenersAttached) { detachListeners(); }
  unblockParentsScrolls(trigger);
  onClose?.();
};

const onTriggerClick = (event, dropdownElementsSet, extra) => {
  event?.stopPropagation?.();
  const isDropdownOpen = dropdownElementsSet.dropdown.getAttribute('open') === 'true';
  if (isDropdownOpen) {
    closeDropdown(dropdownElementsSet, extra, isTargetingDropdown(event));
    return;
  }
  openDropdown(dropdownElementsSet, extra);
};

const recalculateDropdownPosition = ({
  dropdown,
  arrow,
  scrollableContentClassName,
  disableTouchScrollClassName,
  touchCloseButton,
  trigger,
  backgroundMask,
}, extra) => {
  const isDropdownOpen = dropdown.getAttribute('open') === 'true';
  if (!isDropdownOpen) { return; }
  const hasElementBeenCollocated = collocateElementAt({
    trigger,
    element: dropdown,
    touchCloseButton,
    elementContent: dropdown.querySelector(`.${scrollableContentClassName}`),
    elementPreventTouchScroll: document.querySelector(`.${disableTouchScrollClassName}`),
    arrow,
  }, extra.offset, extra.collocation, extra.availableCollocations, hasTouchSupport);
  if (hasElementBeenCollocated) { return; }
  closeDropdown({
    dropdown, arrow, scrollableContentClassName, trigger, backgroundMask, touchCloseButton,
  }, extra, false);
};

const initCloseButton = (id, closeButtonColor, touchCloseButtonOpacity, zIndex) => {
  const element = document.createElement('button');
  element.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" style="width:1em; height:1em; stroke:${closeButtonColor}; fill:${closeButtonColor};" class="tw-icon dropdown-directive-close">
      <path data-v-640b9ed6="" d="M9.556 8L15 2.556 13.444 1 8 6.444 2.556 1 1 2.556 6.444 8 1 13.444 2.556 15 8 9.556 13.444 15 15 13.444 9.556 8z"></path>
    </svg>
  `;
  element.id = `${id}-close-btn`;
  element.style.display = 'block';
  element.style.position = 'absolute';
  element.style.top = '10px';
  element.style.right = '10px';
  element.style.witdh = '20px';
  element.style.height = '20px';
  element.style.zIndex = zIndex;
  element.style.opacity = touchCloseButtonOpacity;
  element.style.color = 'transparent';
  element.style.background = 'transparent';
  element.style.border = 'none';
  return {
    element,
  };
};

const initBackgroundMask = (id, backgroundMaskOpacity, zIndex) => {
  const element = document.createElement('div');
  element.id = `${id}-bg-mask`;
  element.style.display = 'none';
  element.style.position = 'absolute';
  element.style.top = 0;
  element.style.left = 0;
  element.style.bottom = 0;
  element.style.right = 0;
  element.style.zIndex = zIndex;
  element.style.opacity = backgroundMaskOpacity;
  element.style.backgroundColor = '#000';
  return {
    element,
  };
};

const initArrow = (id, arrowColor, zIndex) => {
  const element = document.createElement('span');
  element.id = `${id}-arrow`;
  element.style.display = 'none';
  element.style.position = 'absolute';
  element.style.zIndex = zIndex;
  return {
    element,
    size: 6,
    offset: 6,
    color: arrowColor,
  };
};

const initDropdown = (dropdown, id, zIndex) => {
  dropdown.id = id;
  dropdown.style.display = 'none';
  dropdown.style.position = 'absolute';
  dropdown.style.zIndex = zIndex;
  dropdown.setAttribute('open', false);
};

const mountDropdown = (trigger, value = {}, nativeModifiers) => { // eslint-disable-line default-param-last
  const {
    id,
    modifiers,
    scrollableContentClassName,
    disableTouchScrollClassName,
    touchCloseButton = true,
    touchCloseButtonColor = '#fff',
    touchCloseButtonOpacity = 1,
    backgroundMaskOpacity = 0.5,
    arrow,
    arrowColor = '#fff',
    zIndex = 9999,
    offsetFromTrigger = 0,
    onOpen,
    onClose,
    keepOtherDropdownsOpen,
    openOnlyProgrammatically,
    allowTopCollocation,
    allowBottomCollocation,
    allowLeftCollocation,
    allowRightCollocation,
  } = value;
  if (!id) { return; }
  const dropdown = document.querySelector(`[dropdown-id="${id}"]`);
  if (!dropdown) { return; }
  initDropdown(dropdown, id, zIndex);
  const dropdownElementsSet = {
    dropdown,
    arrow: arrow ? initArrow(id, arrowColor, zIndex) : {},
    backgroundMask: hasTouchSupport ? initBackgroundMask(id, backgroundMaskOpacity, zIndex) : {},
    touchCloseButton: touchCloseButton ? initCloseButton(id, touchCloseButtonColor, touchCloseButtonOpacity, zIndex) : {},
    scrollableContentClassName,
    disableTouchScrollClassName,
    trigger,
  };
  const extra = {
    offset: offsetFromTrigger,
    collocation: getRequestedCollocation(modifiers || nativeModifiers),
    availableCollocations: getAvailableCollocations({
      allowTopCollocation,
      allowBottomCollocation,
      allowLeftCollocation,
      allowRightCollocation,
    }),
    onOpen,
    onClose,
    keepOthersOpen: keepOtherDropdownsOpen,
  };
  let lastHeight = dropdown.clientHeight;
  trigger.click = (event) => onTriggerClick(event, dropdownElementsSet, extra);
  dropdown.open = () => openDropdown(dropdownElementsSet, extra);
  dropdown.isOpen = () => dropdown.getAttribute('open') === 'true';
  dropdown.close = (keepListenersAttached) => closeDropdown(dropdownElementsSet, extra, keepListenersAttached);
  dropdown.closeOthers = () => closeOtherDropdowns(dropdown);
  dropdown.closeAll = closeAllDropdowns;
  dropdown.recalculatePosition = () => recalculateDropdownPosition(dropdownElementsSet, extra);
  dropdown.debouncedRecalculate = debounce(() => {
    if (dropdown.isOpen?.() && lastHeight !== dropdown.clientHeight) {
      recalculateDropdownPosition(dropdownElementsSet, extra);
      lastHeight = dropdown.clientHeight;
    }
  }, quickTimeout);
  if (ResizeObserver) {
    setTimeout(() => {
      if (!dropdown.debouncedRecalculate || !dropdown.isOpen) { return; }
      lastHeight = dropdown.clientHeight;
      dropdown.resizeObserver = new ResizeObserver(() => dropdown.debouncedRecalculate?.());
      dropdown.resizeObserver.observe(dropdown);
    }, quickTimeout); // give so time for the dropdown to be rendered
  }
  if (!openOnlyProgrammatically) { trigger.addEventListener('click', trigger.click); }
  trigger.isMounted = true;
};

const DropdownDirective = {
  mounted(trigger, { value = {}, modifiers }) {
    if (value.isReady === false) { return; }
    mountDropdown(trigger, value, modifiers);
  },
  updated(trigger, { value = {}, modifiers }) {
    if (value.isReady === false || trigger.isMounted) { return; }
    mountDropdown(trigger, value, modifiers);
  },
  unmounted(trigger, { value = {} }) {
    trigger.removeEventListener('click', trigger.click);
    trigger.click = null;
    const dropdown = document.querySelector(`[dropdown-id="${value.id}"]`);
    if (!dropdown) { return; }
    dropdown.close?.();
    dropdown.open = null;
    dropdown.isOpen = null;
    dropdown.close = null;
    dropdown.closeOthers = null;
    dropdown.closeAll = null;
    dropdown.recalculatePosition = null;
    dropdown.debouncedRecalculate = null;
    if (dropdown.resizeObserver) {
      dropdown.resizeObserver.disconnect();
      dropdown.resizeObserver = null;
    }
  },
};

export default DropdownDirective;
