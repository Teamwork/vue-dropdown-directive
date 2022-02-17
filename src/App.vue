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
    <div class="row">
      <div
        v-dropdown-directive.bottom.center="{
          id: 'text-trigger-dropdown-1',
          arrow: true,
          scrollableContentClassName: 'dropdown-list',
          isReady: true,
        }"
      >
        Trigger
      </div>
      <div
        ref="customDropdown"
        dropdown-id="text-trigger-dropdown-1"
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
    <div class="row">
      <div style="text-align:center">
        long list and soft keyboard (test on IOS and software keyboard) <br>
        <button v-if="isLargePage === false" @click="isLargePage = true">Large Page</button>
        <button v-if="isLargePage === true" @click="isLargePage = false">Small Page</button>
        <br>
        <input
          type="text"
          v-dropdown-directive.bottom.center="{
            id: 'text-input-dropdown-long-list',
            arrow: false,
            scrollableContentClassName: 'dropdown-list',
            isReady: true,
            preventPageScrolling: true
          }"
        >
        <div
          ref="customDropdown"
          dropdown-id="text-input-dropdown-long-list"
          class="dropdown"
        >
          <div class="dropdown-list">
            <div
              v-for="(item, index) in ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7', 'Item 8', 'Item 9', 'Item 10', 'Item 11', 'Item 12']"
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
    <div class="row">
      <div v-bind:class="{ large_page: isLargePage }">
        &nbsp;
      </div>
    </div>
    <div class="row">
      <div style="text-align:center">
        long list and soft keyboard - bootom of page (test on IOS and software keyboard) <br>
        <input
          type="text"
          v-dropdown-directive.bottom.center="{
            id: 'text-input-dropdown-long-list-bottom',
            arrow: false,
            scrollableContentClassName: 'dropdown-list',
            isReady: true,
            preventPageScrolling: true
          }"
        >
        <div
          ref="customDropdown"
          dropdown-id="text-input-dropdown-long-list-bottom"
          class="dropdown"
        >
          <div class="dropdown-list">
            <div
              v-for="(item, index) in ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7', 'Item 8', 'Item 9', 'Item 10', 'Item 11', 'Item 12']"
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
  </div>
</template>

<script>
import DropdownDirective from './Dropdown.directive';

export default {
  name: 'App',
  directives: {
    DropdownDirective,
  },
  data: () => ({
    isLargePage: true,
  }),
};
</script>

<style>
html, body {
  margin: 0;
  position: relative;
  min-height: 100vh;
}

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

input[type='text'],
textarea {
  font-size: 16px; /* prevents zoom windows on focus ios */
}

.large_page {
  height: 1800px;
  background-color: #6b87e4;
  width: 100%;
}
</style>
