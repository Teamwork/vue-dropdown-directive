<template>
  <div id="app">
    <div class="row">
      <button
        v-dropdown-directive.bottom.center="{
          id: 'custom-dropdown-id',
          arrow: true,
          scrollableContentClassName: 'dropdown-list',
          isReady: true,
        }"
      >
        Show items
      </button>
      <div
        ref="customDropdown"
        dropdown-id="custom-dropdown-id"
        class="dropdown"
      >
        <div class="dropdown-list">
          <div
            v-for="(item, index) in ['Item 1', 'Item 2', 'Item 3']"
            class="dropdown-list__item"
            :key="index"
            @click="() => $refs.customDropdown.close()"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <input
        type="text"
        v-dropdown-directive.bottom.center="{
          id: 'text-input-dropdown',
          arrow: true,
          scrollableContentClassName: 'dropdown-list',
          isReady: true,
        }"
      >
      <div
        ref="customDropdown"
        dropdown-id="text-input-dropdown"
        class="dropdown"
      >
        <div class="dropdown-list">
          <div
            v-for="(item, index) in ['Item 1', 'Item 2', 'Item 3']"
            class="dropdown-list__item"
            :key="index"
            @click="() => $refs.customDropdown.close()"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div
        v-dropdown-directive.bottom.center="{
          id: 'text-trigger-dropdown',
          arrow: true,
          scrollableContentClassName: 'dropdown-list',
          isReady: true,
        }"
      >
        Trigger
      </div>
      <div
        ref="customDropdown"
        dropdown-id="text-trigger-dropdown"
        class="dropdown dropdown-with-max-height"
      >
        <input type="text">
        <div class="dropdown-list">
          <div
            v-for="(item, index) in ['Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', 'Item 1', 'Item 2', 'Item 3', ]"
            class="dropdown-list__item"
            :key="index"
            @click="() => $refs.customDropdown.close()"
          >
            {{ item }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DropdownDirective from './Dropdown.directive';

export default {
  name: 'App',
  directives: {
    DropdownDirective,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  align-content: center;
  flex-direction: column;
  width: 100%;
}

.row {
  display: flex;
  justify-content: center;
  margin: 20px;
}

button {
  border: solid 1px rgba(#000, 0.1);
  border-radius: 3px;
  background-color: #f5f7fa;
  height: 30px;
  color: #666;
  padding: 0 10px;
}

.dropdown {
  background-color: #fff;
  box-shadow: 0 1px 4px 0 #f5f7fa, 0 2px 15px 0 #f5f7fa;
  border-radius: 4px;
}

.dropdown-with-max-height {
  max-height: 300px;
  overflow: auto;
}

.dropdown-list__item {
  text-align: center;
  width: 150px;
  padding: 15px 20px;
  cursor: pointer;
  color: #666;
  font-size: 13px;
}

.dropdown-list__item:hover {
  background-color: #f5f7fa;
}
</style>
