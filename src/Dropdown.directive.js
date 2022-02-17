import debounce from 'debounce';
import {
  collocateElementAt,
  getAvailableCollocations,
  getRequestedCollocation,
} from './collocateElement.utility';

const hasTouchSupport = ('ontouchstart' in document.documentElement);

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

const openTemporaryClosedDropdowns = () => {
  const dropdowns = Array.from(document.querySelectorAll('[dropdown-id]'));
  const filterByWasElementOpen = (dropdown) => dropdown.getAttribute('was-open') === 'true';
  const unsetPreviousStateAndRunOpen = (dropdown) => {
    dropdown.removeAttribute('was-open');
    dropdown.open?.();
  };
  const previousOpenedDropdowns = dropdowns?.filter(filterByWasElementOpen);
  previousOpenedDropdowns?.forEach(unsetPreviousStateAndRunOpen);
};

const temporaryCloseDropdowns = (keepListenersAttachedParamToPass) => {
  const dropdowns = Array.from(document.querySelectorAll('[dropdown-id]'));
  const filterByIsElementOpen = (dropdown) => dropdown.getAttribute('open') === 'true';
  const setPreviousStateAndRunClose = (dropdown) => {
    if (keepListenersAttachedParamToPass) { dropdown.setAttribute('was-open', true); }
    dropdown.close?.(keepListenersAttachedParamToPass);
  };
  const openedDropdowns = dropdowns?.filter(filterByIsElementOpen);
  openedDropdowns?.forEach(setPreviousStateAndRunClose);
};

const temporaryHideAllDropdowns = (
  event,
  scrollableContentClassName,
  otherScrollableContentClassNames,
  openTemporaryClosedDropdownsDebounced,
  keepDropdownsOpenOnUIEvent,
  dropdownId,
) => {
  const eventParentIds = event?.path?.map(({ id }) => id) || [];
  const isEventFromInsideDropdown = eventParentIds.includes(dropdownId);
  const isScrollEvent = event.type === 'scroll';
  const shouldIgnoreEvent = isEventFromInsideDropdown && isScrollEvent;
  if (shouldIgnoreEvent) { return; } // prevents scroll events from inside dropdown hiding dropdowns https://github.com/Teamwork/deskclient/pull/3600#issue-613566610
  if (event?.target?.className === scrollableContentClassName || otherScrollableContentClassNames?.includes?.(event?.target?.className)) { return; }
  temporaryCloseDropdowns(keepDropdownsOpenOnUIEvent);
  if (!keepDropdownsOpenOnUIEvent) { return; }
  openTemporaryClosedDropdownsDebounced?.();
};

const closeAllDropdowns = (event) => {
  if (isTargetingDropdown(event)) { return; }
  const dropdowns = Array.from(document.querySelectorAll('[dropdown-id]'));
  const closeDropdown = (dropdown) => dropdown.close?.();
  dropdowns?.forEach(closeDropdown);
};

const closeDropdownsOnEscKey = (event) => {
  event?.stopPropagation?.();
  if (event?.keyCode !== 'esc') { return; }
  closeAllDropdowns();
};

const closeOtherDropdowns = (currentDropdown) => {
  const keepListenersAttachedParamToPass = false;
  const dropdowns = Array.from(document.querySelectorAll('[dropdown-id]'));
  const filterByCurrentDropdown = (dropdown) => dropdown !== currentDropdown;
  const closeDropdown = (dropdown) => dropdown.close?.(keepListenersAttachedParamToPass);
  dropdowns?.filter(filterByCurrentDropdown).forEach(closeDropdown);
};

const attachListeners = (temporaryHideAllDropdownsRef) => {
  document.addEventListener('click', closeAllDropdowns);
  document.body.addEventListener('click', closeAllDropdowns);
  document.addEventListener('keyup', closeDropdownsOnEscKey);
  document.body.addEventListener('keyup', closeDropdownsOnEscKey);
  if (hasTouchSupport) { return; }
  document.addEventListener('scroll', temporaryHideAllDropdownsRef, true);
  window.addEventListener('resize', temporaryHideAllDropdownsRef);
};

const detachListeners = (temporaryHideAllDropdownsRef) => {
  document.removeEventListener('click', closeAllDropdowns);
  document.body.removeEventListener('click', closeAllDropdowns);
  document.removeEventListener('keyup', closeDropdownsOnEscKey);
  document.body.removeEventListener('keyup', closeDropdownsOnEscKey);
  document.removeEventListener('scroll', temporaryHideAllDropdownsRef, true);
  window.removeEventListener('resize', temporaryHideAllDropdownsRef);
};

const openDropdown = ({
  dropdown,
  arrow,
  backgroundMask,
  scrollableContentClassName,
}, {
  offset,
  collocation,
  availableCollocations,
  onOpen,
  keepOthersOpen,
  temporaryHideAllDropdownsRef,
}, trigger) => {
  if (!keepOthersOpen) { dropdown.closeOthers?.(); }
  const isDropdownOpen = dropdown.getAttribute('open') === 'true';
  if (isDropdownOpen) { return; }
  if (backgroundMask.element) {
    document.body.appendChild(backgroundMask.element);
    backgroundMask.element.style.display = 'block';
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
    elementContent: dropdown.querySelector(`.${scrollableContentClassName}`),
    arrow,
  }, offset, collocation, availableCollocations);
  if (!isCollocated) {
    trigger.click?.();
    return;
  }
  attachListeners(temporaryHideAllDropdownsRef);
  onOpen?.();
};

const closeDropdown = ({
  dropdown,
  arrow,
  backgroundMask,
}, {
  onClose,
  temporaryHideAllDropdownsRef,
}, keepListenersAttached) => {
  const isDropdownOpen = dropdown.getAttribute('open') === 'true';
  if (!isDropdownOpen) { return; }
  if (dropdown.onVieportChangeInterval) {
    clearInterval(dropdown.onVieportChangeInterval);
    dropdown.onVieportChangeInterval = null;
  }
  if (backgroundMask.element) {
    backgroundMask.element.parentNode.removeChild(backgroundMask.element);
    backgroundMask.element.style.display = 'none';
  }
  dropdown.setAttribute('open', false);
  moveElementBackToOriginalPlace(dropdown);
  dropdown.style.display = 'none';
  if (arrow.element) {
    arrow.element.parentNode.removeChild(arrow.element);
    arrow.element.style.display = 'none';
  }
  if (!keepListenersAttached) { detachListeners(temporaryHideAllDropdownsRef); }
  onClose?.();
};

const onTriggerClick = (event, trigger, dropdownElementsSet, extra) => {
  event?.stopPropagation?.();
  const isDropdownOpen = dropdownElementsSet.dropdown.getAttribute('open') === 'true';
  if (isDropdownOpen) {
    closeDropdown(dropdownElementsSet, extra, isTargetingDropdown(event));
    return;
  }
  openDropdown(dropdownElementsSet, extra, trigger);
};

const recalculateDropdownPosition = ({ dropdown, arrow, scrollableContentClassName }, extra, trigger) => {
  const isDropdownOpen = dropdown.getAttribute('open') === 'true';
  if (!isDropdownOpen) { return; }
  const hasElementBeenCollocated = collocateElementAt({
    trigger,
    element: dropdown,
    elementContent: dropdown.querySelector(`.${scrollableContentClassName}`),
    arrow,
  }, extra.offset, extra.collocation, extra.availableCollocations, hasTouchSupport);
  if (hasElementBeenCollocated) { return; }
  closeDropdown({ dropdown, arrow, scrollableContentClassName }, extra, false);
};

const initBackgroundMask = (id, zIndex) => {
  const element = document.createElement('div');
  element.id = id;
  element.style.display = 'none';
  element.style.position = 'absolute';
  element.style.top = 0;
  element.style.left = 0;
  element.style.bottom = 0;
  element.style.right = 0;
  element.style.zIndex = zIndex;
  element.style.opacity = 0.5;
  element.style.backgroundColor = '#000';
  return {
    element,
  };
};

const initArrow = (id, arrowColor, zIndex) => {
  const element = document.createElement('span');
  element.id = id;
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

const mountDropdown = (trigger, value = {}, nativeModifiers) => {
  const {
    id,
    modifiers,
    scrollableContentClassName,
    otherScrollableContentClassNames = [],
    arrow,
    arrowColor = '#fff',
    zIndex = 9999,
    offsetFromTrigger = 0,
    onOpen,
    onClose,
    keepOtherDropdownsOpen,
    keepDropdownsOpenOnUIEvent = true,
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
    backgroundMask: hasTouchSupport ? initBackgroundMask(id, zIndex) : {},
    scrollableContentClassName,
  };
  const debounceDelayInMilliseconds = 500;
  const debouncedTemporaryHideAllDropdowns = debounce(openTemporaryClosedDropdowns, debounceDelayInMilliseconds);
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
    temporaryHideAllDropdownsRef: (event) => temporaryHideAllDropdowns(
      event,
      scrollableContentClassName,
      otherScrollableContentClassNames,
      debouncedTemporaryHideAllDropdowns,
      keepDropdownsOpenOnUIEvent,
      id,
    ),
  };
  trigger.click = (event) => onTriggerClick(event, trigger, dropdownElementsSet, extra);
  dropdown.open = () => openDropdown(dropdownElementsSet, extra, trigger);
  dropdown.isOpen = () => dropdown.getAttribute('open') === 'true';
  dropdown.close = (keepListenersAttached) => closeDropdown(dropdownElementsSet, extra, keepListenersAttached);
  dropdown.closeOthers = () => closeOtherDropdowns(dropdown);
  dropdown.closeAll = closeAllDropdowns;
  dropdown.recalculatePosition = () => recalculateDropdownPosition(dropdownElementsSet, extra, trigger);
  if (!openOnlyProgrammatically) { trigger.addEventListener('click', trigger.click); }
  trigger.isMounted = true;
};

const DropdownDirective = {
  inserted(trigger, { value = {}, modifiers }) {
    if (value.isReady === false) { return; }
    mountDropdown(trigger, value, modifiers);
  },
  update(trigger, { value = {}, modifiers }) {
    if (value.isReady === false || trigger.isMounted) { return; }
    mountDropdown(trigger, value, modifiers);
  },
  unbind(trigger, { value = {} }) {
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
  },
};

export default DropdownDirective;
