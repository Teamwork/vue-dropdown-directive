# Vue Dropdown Directive

## Table of contents

1. [Installation](#installation)
2. [Basic usage](#basic-usage)
3. [Modifiers](#modifiers)
4. [Parameters](#parameters)
5. [Behaviour](#behaviour)
6. [Methods](#methods)

## Installation

```bash
$ npm install @teamwork/vue-dropdown-directive
```

## Basic usage

```html
<button v-dropdown-directive="{ id: 'unique-dropdown-id' }">Show list</button>
<custom-dropdown dropdown-id="unique-dropdown-id">
  <!-- CONTENT -->
</custom-dropdown>
```

```js
import DropdownDirective from '@teamwork/vue-dropdown-directive';

const directives = {
  DropdownDirective,
};

const ExamplePage = {
  props,
  directives,
  computed,
  methods,
  ...,
};

export default ExamplePage;
```

## Modifiers

``.bottom`` and ``.center`` are applied by default. If only one modifier is specified, ``.center`` is applied by default.

The first modifier refers to the position where the dropdown is placed:

- ``.bottom``
- ``.left``
- ``.right``
- ``.top``

The second modifier refers to the alignment of the dropdown with the trigger element:

- ``.bottom`` and ``.top`` positions can have ``.left`` | ``.center`` | ``.right``
- ``.right`` and ``.left`` positions can have ``.top`` | ``.center`` | ``.bottom``

```html
<button v-dropdown-directive.top.left="{ id: 'unique-dropdown-id' }">Show list</button>
<custom-dropdown dropdown-id="unique-dropdown-id">
  <!-- CONTENT -->
</custom-dropdown>
```

## Parameters

- ``id`` (__required__) is the *unique id* that *must* be assigned to the trigger element which links it to the dropdown element.
- ``modifiers`` contains the *position* and *alignment*, it is generally used to programmatically override the native modifiers.

```js
{
  right: true,
  center: true,
}
```

- ``scrollableContentClassName`` (__suggested__) is the class assigned to the wrapper element containing the main content within the dropdown, read [here](#behaviour) for more info on how it is used and why it would be better to set this.

```html
<button v-dropdown-directive.top.left="{
  id: 'unique-dropdown-id',
  scrollableContentClassName: 'dropdown-list',
}">
  Show list
</button>
<custom-dropdown dropdown-id="unique-dropdown-id">
  <ul
    class=".dropdown-list"
    slot="dropdown-content"
  >
    <li>User 1</li>
    <li>User 2</li>
    <li>User 3</li>
  </ul>
</custom-dropdown>
```

- ``otherScrollableContentClassNames`` is the list of class names within the dropdown that are allowed to scroll.
- ``isReady`` is a *boolean* used to hold the directive hook *inserted* until the consumer is ready, the default is set to ``true``.
- ``arrow`` is a *boolean* used to show/hide the arrow between the trigger and the dropdown, the default is set to ``false``.
- ``arrowColor`` contains an *hexadecimal* used to set the color of the arrow next to the dropdown, the default is set to ``#fff``.
- ``zIndex`` is a *number* that specifies that stack order of the dropdown and its arrow, the default is set to ``9999``.
- ``offsetFromTrigger`` is a *number* that specifies the distance in pixels from where the dropdown is going to be rendered, the default is set to ``0``.
- ``onOpen`` is a *function* that runs at the opening of the dropdown.
- ``onClose`` is a *function* that runs on closing of the dropdown.
- ``keepOtherDropdownsOpen`` is a *boolean* that keeps the other dropdowns within the viewport opened when the trigger element action happens, the default is set ``false``.
- ``keepDropdownsOpenOnUIEvent`` is a *boolean* that keeps every dropdown within the viewport opened if a scroll or resize event has been triggered, the default is set ``true``.
- ``openOnlyProgrammatically`` is a *boolean* used to disable the trigger element action that opens the dropdown. If set to ``true``, the dropdown can be opened only [programmatically](#methods).
- ``allowTopCollocation`` is a *boolean* used to enable/disable the top position, the default is set to ``true``.
- ``allowBottomCollocation`` is a *boolean* used to enable/disable the bottom position, the default is set to ``true``.
- ``allowLeftCollocation`` is a *boolean* used to enable/disable the left position, the default is set to ``true``.
- ``allowRightCollocation`` is a *boolean* used to enable/disable the right position, the default is set to ``true``.

## Behaviour

Most of the time the dropdown is opened at the position set. However, there might be some scenarios where the space available within the viewport is simply not enough. So, the directive runs automatically a simulation, either to find the area within the viewport with the most available space or if an overflow to the content of the dropdown could be applied.
In order to prioritize the overflow of the content, the ``scrollableContentClassName`` parameter must be set. Instead, ``allowTopCollocation``, ``allowBottomCollocation``, ``allowLeftCollocation`` or ``allowRightCollocation`` parameters are used to restrict the positions to look for finding the areas with the most available space.
In order to ensure the dropdown is always placed next to the trigger element, the directive hides and re-paints it every time a scroll or a resize of the viewport happens.

## Methods

- ``open()`` is used to open the dropdown.
- ``close()`` is used to close the dropdown.
- ``closeOthers()`` is used to close every dropdown within the viewport except the current one.
- ``closeAll()`` is used to close every dropdown within the viewport.
- ``recalculatePosition()`` is used to re-calculate the position of the dropdown within the viewport.
- ``isOpen()`` is used to check if the current dropdown is showing.

This is an example of how the methods above can be executed:

```js
updateDropdownPosition() {
  this.$refs.customDropdown.recalculatePosition();
},
```

```html
<button v-dropdown-directive="{ id: 'unique-dropdown-id' }">Show list</button>
<custom-dropdown
  ref="customDropdown"
  dropdown-id="unique-dropdown-id"
>
  <!-- CONTENT -->
</custom-dropdown>
```
