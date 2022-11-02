const allAvailableCollocations = [
  { position: 'top', alignment: 'left', available: false },
  { position: 'top', alignment: 'center', available: false },
  { position: 'top', alignment: 'right', available: false },
  { position: 'bottom', alignment: 'left', available: false },
  { position: 'bottom', alignment: 'center', available: false },
  { position: 'bottom', alignment: 'right', available: false },
  { position: 'left', alignment: 'top', available: false },
  { position: 'left', alignment: 'center', available: false },
  { position: 'left', alignment: 'bottom', available: false },
  { position: 'right', alignment: 'top', available: false },
  { position: 'right', alignment: 'center', available: false },
  { position: 'right', alignment: 'bottom', available: false },
];

const maxThresholdInPixels = 20;

const maxTouchVerticalThresholdInPixels = 30;

const maxTouchHorizontalThresholdInPixels = 10;

const maxThresholdInPercentage = 5;

const minContentHeightInPixels = 150;

const onViewportChangeIntervalInMs = 200;

const maxTouchElementWidthInPixels = 600;

const hasTouchSupport = ('ontouchstart' in document.documentElement);

const addScrollXOffset = (data) => (data + window.pageXOffset);

const addScrollYOffset = (data) => (data + window.pageYOffset);

const getArrowOffset = (arrow) => (arrow.offset || 0);

const getTotalOffset = (customOffset, arrowOffset) => (arrowOffset + customOffset);

const arrowLeftVerticalPosition = (trigger, arrow) => (trigger.left + ((trigger.width / 2) - arrow.size));

const arrowTopHorizontalPosition = (trigger, arrow) => (trigger.bottom - ((trigger.height / 2) + arrow.size));

const isElementInViewportRoom = ({
  top,
  left,
  bottom,
  right,
}, viewportRoom) => (
  (top - window.pageYOffset) >= viewportRoom.top
    && (left - window.pageXOffset) >= viewportRoom.left
    && (bottom - window.pageYOffset) <= viewportRoom.bottom
    && (right - window.pageXOffset) <= viewportRoom.right
);

const isElementInHorizonalViewportRoom = ({
  left,
  right,
}, viewportRoom) => (
  (left - window.pageXOffset) >= viewportRoom.left
    && (right - window.pageXOffset) <= viewportRoom.right
);

const applyOverflowModifierToElement = (element, modifier) => ({ ...element, ...modifier });

const hasMinimumContentHeight = (contentHeight) => (contentHeight > minContentHeightInPixels);

const checkCollocationPositionAndAlignment = (current, next) => current.position === next.position && current.alignment === next.alignment;

const checkCollocationPosition = (current, next) => current.position === next.position;

const getWindowDimensions = () => ({
  winHeight: window.innerHeight,
  visualHeight: window.visualViewport?.height || 0,
  visualOffsetTop: window.visualViewport?.offsetTop || 0,
});

const areWindowsDimesionsEqual = (w1, w2) => (
  w1.winHeight === w2.winHeight
  && w1.visualHeight === w2.visualHeight
  && w1.visualOffsetTop === w2.visualOffsetTop
);

const getElementDimensions = (element) => {
  if (!element) { return { width: 0, height: 0 }; }
  return {
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
};

const areElementDimesionsEqual = (e1, e2) => (
  e1.width === e2.width
  && e1.height === e2.height
);

const isDropdownOpen = (element) => element?.getAttribute('open') === 'true';

// TODO: replace getElementContentExtraHeight by getContentExtraHeight and remove. (requires extensive testing for non touch devices)
const getElementContentExtraHeight = (elementContent, elementHeight) => {
  if (!elementContent) { return; }
  const contentHeight = elementContent.getBoundingClientRect().height;
  if (contentHeight > 0) { return (elementHeight - contentHeight); }
  return 0;
};

const getContentExtraHeight = (element, elementContent) => {
  const elementHeight = element.scrollHeight;
  const contentHeight = elementContent?.getBoundingClientRect().height || 0;
  return elementHeight - contentHeight;
};

const getComputedValueInPixels = (element, propertyName) => {
  if (!element) { return; }
  const stringValue = window.getComputedStyle(element).getPropertyValue(propertyName);
  let value;
  if (!stringValue || stringValue === 'none') return null;
  switch (true) {
    case stringValue.includes('px'):
      value = parseInt(stringValue.replace('px', ''), 10);
      return Number.isNaN(value) ? null : value;
    // there is a browser bug where max-with value is returned in percentage rather than px
    case stringValue.includes('%'):
      return null;
    default:
      value = parseInt(stringValue, 10);
      return Number.isNaN(value) ? null : value;
  }
};

const getElementComputedMaxHeight = (element) => {
  if (!element) { return; }
  return getComputedValueInPixels(element, 'max-height') || Number.MAX_SAFE_INTEGER;
};

const getElementComputedMaxWidth = (element) => {
  if (!element) { return; }
  return getComputedValueInPixels(element, 'max-width') || Number.MAX_SAFE_INTEGER;
};

const getComputedElementMaxDimensions = (element) => {
  if (!element) { return { maxWidth: Number.MAX_SAFE_INTEGER, maxHeight: Number.MAX_SAFE_INTEGER }; }
  return {
    maxWidth: getElementComputedMaxWidth(element),
    maxHeight: getElementComputedMaxHeight(element),
  };
};

const getThresholdInPixels = (viewportDimension) => {
  const currentThreshold = (maxThresholdInPercentage / 100) * viewportDimension;
  if (currentThreshold < maxThresholdInPixels) {
    return currentThreshold;
  }
  return maxThresholdInPixels;
};

const getViewportRooms = (trigger, viewport) => ({
  top: {
    height: trigger.top,
    width: viewport.width,
    top: 0,
    left: 0,
    right: viewport.width,
    bottom: trigger.top,
  },
  bottom: {
    height: viewport.height - trigger.bottom,
    width: viewport.width,
    top: trigger.bottom,
    left: 0,
    right: viewport.width,
    bottom: viewport.height,
  },
  left: {
    height: viewport.height,
    width: trigger.left,
    top: 0,
    left: 0,
    right: trigger.left,
    bottom: viewport.height,
  },
  right: {
    height: viewport.height,
    width: viewport.width - trigger.right,
    top: 0,
    left: trigger.right,
    right: viewport.width,
    bottom: viewport.height,
  },
  center: {
    height: viewport.height,
    width: viewport.width,
    top: 0,
    left: 0,
    right: viewport.width,
    bottom: viewport.height,
  },
});

const getElementLeftCoordinateAtTopAndBottomPosition = (alignment, triggerRect, elementRect) => {
  switch (alignment) {
    case 'left':
      return triggerRect.left;
    case 'right':
      return triggerRect.right - elementRect.width;
    case 'center':
      return triggerRect.left - ((elementRect.width / 2) - (triggerRect.width / 2));
    default:
      return triggerRect.left;
  }
};

const getElementTopCoordinateAtLeftAndRightPosition = (alignment, triggerRect, elementRect) => {
  switch (alignment) {
    case 'bottom':
      return triggerRect.bottom - elementRect.height;
    case 'top':
      return triggerRect.top;
    case 'center':
      return triggerRect.top - ((elementRect.height / 2) - (triggerRect.height / 2));
    default:
      return triggerRect.bottom - elementRect.height;
  }
};

const getViewPort = () => ({
  height: window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight,
  width: window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth,
});

const mapCoordinatesToTopPosition = ({
  triggerRect,
  elementRect,
  arrowRect,
  contentExtraHeight,
}, { totalOffset }, collocation, viewportRoom) => {
  const elementCoordinates = {
    top: addScrollYOffset(triggerRect.top - elementRect.height - totalOffset),
    left: addScrollXOffset(getElementLeftCoordinateAtTopAndBottomPosition(collocation.alignment, triggerRect, elementRect)),
  };
  elementCoordinates.bottom = elementCoordinates.top + elementRect.height;
  elementCoordinates.right = elementCoordinates.left + elementRect.width;
  const arrowCoordinates = {
    top: addScrollYOffset(triggerRect.top - totalOffset),
    left: addScrollXOffset(arrowLeftVerticalPosition(triggerRect, arrowRect)),
    direction: 'down',
  };
  const overflowModifier = {
    top: 0,
    contentHeight: (arrowCoordinates.top - contentExtraHeight),
  };
  return {
    ...collocation,
    room: viewportRoom.height,
    available: isElementInViewportRoom(elementCoordinates, viewportRoom),
    availableInOverflowMode: hasMinimumContentHeight(overflowModifier.contentHeight)
      && isElementInHorizonalViewportRoom(elementCoordinates, viewportRoom),
    coordinates: {
      element: elementCoordinates,
      arrow: arrowCoordinates,
    },
    overflowModifier,
  };
};

const mapCoordinatesToBottomPosition = ({
  triggerRect,
  elementRect,
  arrowRect,
  contentExtraHeight,
}, { totalOffset, customOffset }, collocation, viewportRoom) => {
  const elementCoordinates = {
    top: addScrollYOffset(triggerRect.bottom + totalOffset),
    left: addScrollXOffset(getElementLeftCoordinateAtTopAndBottomPosition(collocation.alignment, triggerRect, elementRect)),
  };
  elementCoordinates.bottom = elementCoordinates.top + elementRect.height;
  elementCoordinates.right = elementCoordinates.left + elementRect.width;
  const arrowCoordinates = {
    top: addScrollYOffset(triggerRect.bottom + customOffset),
    left: addScrollXOffset(arrowLeftVerticalPosition(triggerRect, arrowRect)),
    direction: 'up',
  };
  const overflowModifier = {
    bottom: viewportRoom.bottom,
    contentHeight: viewportRoom.bottom - elementCoordinates.top - contentExtraHeight,
  };
  return {
    ...collocation,
    room: viewportRoom.height,
    available: isElementInViewportRoom(elementCoordinates, viewportRoom),
    availableInOverflowMode: hasMinimumContentHeight(overflowModifier.contentHeight)
      && isElementInHorizonalViewportRoom(elementCoordinates, viewportRoom),
    coordinates: {
      element: elementCoordinates,
      arrow: arrowCoordinates,
    },
    overflowModifier,
  };
};

const mapCoordinatesToLeftPosition = ({
  triggerRect,
  elementRect,
  arrowRect,
  contentExtraHeight,
}, { totalOffset }, collocation, viewportRoom) => {
  const elementCoordinates = {
    top: addScrollYOffset(getElementTopCoordinateAtLeftAndRightPosition(collocation.alignment, triggerRect, elementRect)),
    left: addScrollXOffset(triggerRect.left - elementRect.width - totalOffset),
  };
  elementCoordinates.bottom = elementCoordinates.top + elementRect.height;
  elementCoordinates.right = elementCoordinates.left + elementRect.width;
  const arrowCoordinates = {
    top: addScrollYOffset(arrowTopHorizontalPosition(triggerRect, arrowRect)),
    left: addScrollXOffset(triggerRect.left - totalOffset),
    direction: 'right',
  };
  const overflowModifier = {
    top: viewportRoom.top,
    contentHeight: viewportRoom.bottom - contentExtraHeight,
  };
  return {
    ...collocation,
    room: viewportRoom.width,
    available: isElementInViewportRoom(elementCoordinates, viewportRoom),
    availableInOverflowMode: hasMinimumContentHeight(overflowModifier.contentHeight)
      && isElementInHorizonalViewportRoom(elementCoordinates, viewportRoom),
    coordinates: {
      element: elementCoordinates,
      arrow: arrowCoordinates,
    },
    overflowModifier,
  };
};

const mapCoordinatesToRightPosition = ({
  triggerRect,
  elementRect,
  arrowRect,
  contentExtraHeight,
}, { totalOffset, customOffset }, collocation, viewportRoom) => {
  const elementCoordinates = {
    top: addScrollYOffset(getElementTopCoordinateAtLeftAndRightPosition(collocation.alignment, triggerRect, elementRect)),
    left: addScrollXOffset(triggerRect.right + totalOffset),
  };
  elementCoordinates.bottom = elementCoordinates.top + elementRect.height;
  elementCoordinates.right = elementCoordinates.left + elementRect.width;
  const arrowCoordinates = {
    top: addScrollYOffset(arrowTopHorizontalPosition(triggerRect, arrowRect)),
    left: addScrollXOffset(triggerRect.right + customOffset),
    direction: 'left',
  };
  const overflowModifier = {
    top: viewportRoom.top,
    contentHeight: viewportRoom.bottom - contentExtraHeight,
  };
  return {
    ...collocation,
    room: viewportRoom.width,
    available: isElementInViewportRoom(elementCoordinates, viewportRoom),
    availableInOverflowMode: hasMinimumContentHeight(overflowModifier.contentHeight)
      && isElementInHorizonalViewportRoom(elementCoordinates, viewportRoom),
    coordinates: {
      element: elementCoordinates,
      arrow: arrowCoordinates,
    },
    overflowModifier,
  };
};

/* eslint-disable no-unused-vars */
const mapCoordinatesToCenterPosition = ({
  elementRect,
  triggerRect,
  contentExtraHeight,
}, viewport) => {
  const verticalTreshold = getThresholdInPixels(viewport.height);
  const horizontalTreshold = getThresholdInPixels(viewport.width);
  const elementCoordinates = {
    top: (viewport.height - elementRect.height) / 2,
    left: horizontalTreshold,
    right: horizontalTreshold,
  };
  const bottom = elementCoordinates.top + elementRect.height;
  const viewportRoom = getViewportRooms(triggerRect, viewport).center;
  const shouldNotOverflow = isElementInViewportRoom({ ...elementCoordinates, bottom }, viewportRoom);
  if (shouldNotOverflow) { return elementCoordinates; }
  elementCoordinates.top = verticalTreshold;
  elementCoordinates.bottom = verticalTreshold;
  elementCoordinates.contentHeight = viewport.height - contentExtraHeight - elementCoordinates.top - elementCoordinates.bottom;
  return elementCoordinates;
};

const mapCoordinatesToCollocation = (rect, customOffset, collocation, viewport) => {
  const totalOffset = getTotalOffset(customOffset, getArrowOffset(rect.arrowRect));
  const viewportRoom = getViewportRooms(rect.triggerRect, viewport)[collocation.position];
  switch (collocation.position) {
    case 'top':
      return mapCoordinatesToTopPosition(rect, { totalOffset, customOffset }, collocation, viewportRoom);
    case 'left':
      return mapCoordinatesToLeftPosition(rect, { totalOffset, customOffset }, collocation, viewportRoom);
    case 'right':
      return mapCoordinatesToRightPosition(rect, { totalOffset, customOffset }, collocation, viewportRoom);
    default:
      return mapCoordinatesToBottomPosition(rect, { totalOffset, customOffset }, collocation, viewportRoom);
  }
};

const mapOverflowModifierTo = (collocationWithCoordinates) => ({
  ...collocationWithCoordinates,
  coordinates: {
    arrow: collocationWithCoordinates.coordinates.arrow,
    element: applyOverflowModifierToElement(collocationWithCoordinates.coordinates.element, collocationWithCoordinates.overflowModifier),
  },
});

const getCollocationWithCoordinates = (rect, offset, askedCollocation, collocations, viewport) => {
  const sortByAvailableSpace = (a, b) => (b.room - a.room);
  const getMappedCollocationWithCoordinates = (collocation) => ({ ...mapCoordinatesToCollocation(rect, offset, collocation, viewport) });
  const mappedCollocations = collocations
    .map(getMappedCollocationWithCoordinates)
    .sort(sortByAvailableSpace);
  const availableCollocations = mappedCollocations
    .filter((collocation) => collocation.available);
  const availableCollocationsInOverflowMode = mappedCollocations
    .filter((collocation) => collocation.availableInOverflowMode);

  if (availableCollocations.length) {
    const firstAvailableCollocationByPositionAndAlignment = availableCollocations
      .find((collocation) => checkCollocationPositionAndAlignment(collocation, askedCollocation));
    const firstAvailableCollocationByPosition = availableCollocations
      .find((collocation) => checkCollocationPosition(collocation, askedCollocation));
    const firstAvailableCollocationByAvailableSpace = availableCollocations[0];
    const selectedAvailableCollocation = firstAvailableCollocationByPositionAndAlignment
      || firstAvailableCollocationByPosition
      || firstAvailableCollocationByAvailableSpace;
    return selectedAvailableCollocation;
  }

  if (availableCollocationsInOverflowMode.length) {
    const firstAvailableCollocationByPositionAndAlignment = availableCollocationsInOverflowMode
      .find((collocation) => checkCollocationPositionAndAlignment(collocation, askedCollocation));
    const firstAvailableCollocationByPosition = availableCollocationsInOverflowMode
      .find((collocation) => checkCollocationPosition(collocation, askedCollocation));
    const firstAvailableCollocationByAvailableSpace = availableCollocationsInOverflowMode[0];
    const selectedAvailableCollocation = firstAvailableCollocationByPositionAndAlignment
      || firstAvailableCollocationByPosition
      || firstAvailableCollocationByAvailableSpace;
    return mapOverflowModifierTo(selectedAvailableCollocation);
  }
};

const getArrowBorderStyles = (arrowOffset, arrowColor) => {
  const result = {
    offsetTransparent: `${arrowOffset}px solid transparent`,
    offsetWithColor: `${arrowOffset}px solid ${arrowColor}`,
    none: '0 solid transparent',
  };
  return result;
};

const setArrowDirection = (arrow, direction) => {
  if (!arrow || !arrow.element) { return; }
  const arrowBorderStyles = getArrowBorderStyles(arrow.size, arrow.color);
  switch (direction) {
    case 'right':
      arrow.element.style.borderBottom = arrowBorderStyles.offsetTransparent;
      arrow.element.style.borderLeft = arrowBorderStyles.offsetWithColor;
      arrow.element.style.borderRight = arrowBorderStyles.none;
      arrow.element.style.borderTop = arrowBorderStyles.offsetTransparent;
      break;
    case 'left':
      arrow.element.style.borderBottom = arrowBorderStyles.offsetTransparent;
      arrow.element.style.borderLeft = arrowBorderStyles.none;
      arrow.element.style.borderRight = arrowBorderStyles.offsetWithColor;
      arrow.element.style.borderTop = arrowBorderStyles.offsetTransparent;
      break;
    case 'up':
      arrow.element.style.borderBottom = arrowBorderStyles.offsetWithColor;
      arrow.element.style.borderLeft = arrowBorderStyles.offsetTransparent;
      arrow.element.style.borderRight = arrowBorderStyles.offsetTransparent;
      arrow.element.style.borderTop = arrowBorderStyles.none;
      break;
    default:
      arrow.element.style.borderBottom = arrowBorderStyles.none;
      arrow.element.style.borderLeft = arrowBorderStyles.offsetTransparent;
      arrow.element.style.borderRight = arrowBorderStyles.offsetTransparent;
      arrow.element.style.borderTop = arrowBorderStyles.offsetWithColor;
      break;
  }
};

const applyCoordinatesToElement = (element, coordinates) => {
  if (!element || !element.style) { return; }
  element.style.top = `${coordinates.top}px`;
  element.style.left = `${coordinates.left}px`;
};

const applyOverflowToElementContent = (element, height) => {
  if (!element || !element.style || !height) { return; }
  element.style.height = `${height}px`;
  element.style.overflowY = 'auto';
};

const resetElementHeight = (element) => {
  if (!element || !element.style) { return; }
  element.style.height = 'auto';
};

const resetElementMaxHeight = (element) => {
  if (!element || !element.style) { return; }
  element.style.maxHeight = '';
};

const resetTouchElementStyle = (element) => {
  if (!element || !element.style) { return; }
  element.style.maxHeight = '';
  element.style.maxWidth = '';
};

const resetTouchScroll = (element) => {
  if (!element || !element.style) { return; }
  element.style.touchAction = '';
  element.style.overscrollBehavior = '';
};

const disableTouchScroll = (element) => {
  if (!element || !element.style) { return; }
  element.style.touchAction = 'none';
  element.style.overscrollBehavior = 'none';
};

const displayTouchCloseButton = (touchCloseButton) => {
  if (!touchCloseButton || !touchCloseButton.style) { return; }
  touchCloseButton.style.display = 'block';
};

const hideTouchCloseButton = (touchCloseButton) => {
  if (!touchCloseButton || !touchCloseButton.style) { return; }
  touchCloseButton.style.display = 'none';
};

const applyTresholdToCoordinates = (coordinates, viewport) => {
  const newCoordinates = { ...coordinates };
  const verticalTreshold = getThresholdInPixels(viewport.height);
  const horizontalTreshold = getThresholdInPixels(viewport.width);
  if (newCoordinates.top === 0) {
    newCoordinates.top += verticalTreshold;
  }
  if (newCoordinates.left === 0) {
    newCoordinates.left += horizontalTreshold;
  }
  if (newCoordinates.right === viewport.width) {
    newCoordinates.left -= horizontalTreshold;
  }
  if (newCoordinates.bottom === viewport.height) {
    newCoordinates.bottom -= verticalTreshold;
    if (coordinates.contentHeight) {
      newCoordinates.contentHeight -= verticalTreshold;
    }
  }
  if (newCoordinates.top === verticalTreshold) {
    newCoordinates.contentHeight -= verticalTreshold;
  }
  return newCoordinates;
};

const applyCoordinates = (element, arrow, elementContent, coordinates, viewport) => {
  const elementCoordinates = applyTresholdToCoordinates(coordinates.element, viewport);
  if (elementCoordinates.contentHeight) {
    applyOverflowToElementContent(elementContent, elementCoordinates.contentHeight);
  }
  applyCoordinatesToElement(element, elementCoordinates);
  if (!arrow || !arrow.element) { return; }
  applyCoordinatesToElement(arrow.element, coordinates.arrow);
  setArrowDirection(arrow, coordinates.arrow.direction);
};

const getAvailableCollocations = ({
  allowTopCollocation = true,
  allowBottomCollocation = true,
  allowLeftCollocation = true,
  allowRightCollocation = true,
} = {}) => {
  let availableCollocations = [];
  if (allowTopCollocation) {
    const filterByTopPosition = (collocation) => collocation.position === 'top';
    availableCollocations = [
      ...availableCollocations,
      ...allAvailableCollocations.filter(filterByTopPosition),
    ];
  }
  if (allowBottomCollocation) {
    const filterByBottomPosition = (collocation) => collocation.position === 'bottom';
    availableCollocations = [
      ...availableCollocations,
      ...allAvailableCollocations.filter(filterByBottomPosition),
    ];
  }
  if (allowLeftCollocation) {
    const filterByLeftPosition = (collocation) => collocation.position === 'left';
    availableCollocations = [
      ...availableCollocations,
      ...allAvailableCollocations.filter(filterByLeftPosition),
    ];
  }
  if (allowRightCollocation) {
    const filterByRightPosition = (collocation) => collocation.position === 'right';
    availableCollocations = [
      ...availableCollocations,
      ...allAvailableCollocations.filter(filterByRightPosition),
    ];
  }
  return availableCollocations;
};

const getRequestedCollocation = (modifiers = {}, defaultPosition = 'bottom', defaultAlignment = 'center') => {
  switch (Object.keys(modifiers).length) {
    case 1:
      return {
        position: defaultPosition,
        alignment: Object.keys(modifiers)[0],
      };
    case 2:
      return {
        position: Object.keys(modifiers)[0],
        alignment: Object.keys(modifiers)[1],
      };
    default:
      return {
        position: defaultPosition,
        alignment: defaultAlignment,
      };
  }
};

const isTouchCloseButtonDisplayed = (touchCloseButton) => touchCloseButton?.style.display === 'block';

const isTouchDropdownFullHeight = (element, rect) => {
  rect = rect || element.getBoundingClientRect();
  const viewport = getViewPort();
  const maxAvailableViewportHeight = viewport.height - (maxTouchVerticalThresholdInPixels * 3);
  return rect.height > maxAvailableViewportHeight;
};

const shouldDisplayCloseButton = (element, touchCloseButton) => !isTouchCloseButtonDisplayed(touchCloseButton) && isTouchDropdownFullHeight(element);

const applyTouchElementContentMaxHeight = (element, elementContent) => {
  if (!element || !elementContent) return;
  const elementRect = element.getBoundingClientRect();
  const contentExtraHeight = getContentExtraHeight(element, elementContent);
  const dropdownHeight = elementRect.height;
  const contentHeight = dropdownHeight - contentExtraHeight;
  elementContent.style.maxHeight = `${contentHeight}px`;
  elementContent.style.overflowY = 'auto';
};

const applyTouchElementCentering = (element, touchCloseButton) => {
  if (!element) return;
  const viewport = getViewPort();
  const elementRect = element.getBoundingClientRect();
  isTouchDropdownFullHeight(element, elementRect);

  const top = window.scrollY + (viewport.height / 2);
  const negativeMarginY = elementRect.height / 2;
  element.style.top = `${top}px`;
  element.style.marginTop = `-${negativeMarginY}px`;

  const left = window.scrollX + (viewport.width / 2);
  const negativeMarginX = elementRect.width / 2;
  element.style.left = `${left}px`;
  element.style.marginLeft = `-${negativeMarginX}px`;

  if (touchCloseButton && isTouchDropdownFullHeight(element)) {
    touchCloseButton.style.top = `${top}px`;
    touchCloseButton.style.marginTop = `-${negativeMarginY + 15}px`;
    element.style.marginTop = `-${negativeMarginY - 15}px`;
    displayTouchCloseButton(touchCloseButton);
  } else {
    hideTouchCloseButton(touchCloseButton);
  }
};

const applyTouchElementStyle = (element, touchCloseButton, computedElementDimensions) => {
  const viewport = getViewPort();

  const maxAvailableViewportHeight = viewport.height - (maxTouchVerticalThresholdInPixels * 2);
  const maxAvailableHeight = Math.min(maxAvailableViewportHeight, computedElementDimensions.maxHeight);
  element.style.maxHeight = `${maxAvailableHeight}px`;

  const maxAvailableViewportWidth = viewport.width - (maxTouchHorizontalThresholdInPixels * 2);
  const maxAvailableWidth = Math.min(maxAvailableViewportWidth, computedElementDimensions.maxWidth, maxTouchElementWidthInPixels);
  element.style.maxWidth = `${maxAvailableWidth}px`;
  element.style.width = `${maxAvailableWidth}px`;

  applyTouchElementCentering(element, touchCloseButton);
};

const touchCollocateElementAt = (element, elementContent, touchCloseButton, computedElementDimensions) => {
  applyTouchElementStyle(element, touchCloseButton, computedElementDimensions);
  resetElementMaxHeight(elementContent);
  setTimeout(() => {
    applyTouchElementContentMaxHeight(element, elementContent);
  }, 0);
};

/* New version of IOS does not trigger any event when the viewport changes due to soft keyboard
 * so we need to use an interval to detect changes.
 * onViewportChangeInterval should be dismissed when the dropdown is closed */
const touchDetectViewportChangesAndCollocate = (element, elementContent, elementPreventTouchScroll, touchCloseButton) => {
  let viewportChangeInterval;
  let viewportChangeIntervalID;
  // gets dimesion set by css or inline previous to any handling of the modal
  const computedElementDimensions = getComputedElementMaxDimensions(element);
  touchCollocateElementAt(element, elementContent, touchCloseButton, computedElementDimensions);
  disableTouchScroll(elementPreventTouchScroll);
  let previousWindowsDimensions = getWindowDimensions();
  let previousElementDimensions = getElementDimensions(element);

  const resizeOnViewportChange = () => {
    if (!isDropdownOpen(element)) {
      resetTouchElementStyle(element);
      resetTouchScroll(elementPreventTouchScroll);
      clearInterval(viewportChangeInterval);
      element.viewportChangeIntervalID = null;
      return;
    }
    // removes old intervals
    if (element.viewportChangeIntervalID && viewportChangeIntervalID !== element.viewportChangeIntervalID) {
      clearInterval(viewportChangeInterval);
      return;
    }

    const currentWindowsDimensions = getWindowDimensions();
    const currentElementDimensions = getElementDimensions(element);
    const hasWindowChanged = !areWindowsDimesionsEqual(previousWindowsDimensions, currentWindowsDimensions);
    if (hasWindowChanged) {
      touchCollocateElementAt(element, elementContent, touchCloseButton, computedElementDimensions);
      previousWindowsDimensions = currentWindowsDimensions;
    } else if (shouldDisplayCloseButton(element, touchCloseButton) || !areElementDimesionsEqual(previousElementDimensions, currentElementDimensions)) {
      applyTouchElementCentering(element, touchCloseButton);
      previousElementDimensions = currentElementDimensions;
    }
  };

  /* Interval reference stored in dom element can't be used to clear the interval
   * so instead we use viewportChangeInterval and viewportChangeIntervalID for id comparison */
  viewportChangeInterval = setInterval(resizeOnViewportChange, onViewportChangeIntervalInMs);
  viewportChangeIntervalID = `${viewportChangeInterval}`;
  element.viewportChangeIntervalID = viewportChangeIntervalID;
};

// eslint-disable-next-line default-param-last
const collocateElementAt = ({
  element,
  trigger,
  arrow,
  elementContent,
  elementPreventTouchScroll,
  touchCloseButton,
// eslint-disable-next-line default-param-last
} = {}, offset = 0, askedCollocation, availableCollocations) => {
  if (!element || !trigger) { return false; }
  if (hasTouchSupport) {
    touchDetectViewportChangesAndCollocate(element, elementContent, elementPreventTouchScroll, touchCloseButton?.element);
    return true;
  }
  resetElementHeight(elementContent);
  const elementRect = element.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();
  const rect = {
    elementRect,
    triggerRect,
    arrowRect: arrow,
    contentExtraHeight: getElementContentExtraHeight(elementContent, elementRect.height),
  };
  const viewport = getViewPort();
  const collocationWithCoordinates = getCollocationWithCoordinates(rect, offset, askedCollocation, availableCollocations, viewport);
  if (!collocationWithCoordinates) { return false; }
  applyCoordinates(element, arrow, elementContent, collocationWithCoordinates.coordinates, viewport);
  return true;
};

export {
  getRequestedCollocation,
  getAvailableCollocations,
  collocateElementAt,
};
