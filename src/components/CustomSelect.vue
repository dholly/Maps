<template>
  <div class="custom-select" @click="toggleDropdown" v-click-outside="closeDropdown">
    <div class="select-selected" :class="{ active: isOpen }">
      {{ selected || placeholder }}

      <div class="select-arrow">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L8 9C8 9 12.2663 4.12419 15 1" stroke="#9D9D9D" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
    </div>
    <div class="select-items" :class="{ hide: !isOpen }">
      <div
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option)"
          :class="{ 'same-as-selected': option.value === modelValue }"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';

const props = defineProps({
  options: {
    type: Array,
    required: true
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select an option'
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const selected = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  selected.value = newValue;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const selectOption = (option) => {
  selected.value = option.label;
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};
</script>

<style scoped>
.custom-select {
  position: relative;
  min-width: 260px;
}

.select-selected {
  font-weight: 500;
  font-size: 15px;
  color: #2c2c2c;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-selected.active {
  border-radius: 5px 5px 0 0;
}


.select-selected.active:after {
  border-color: transparent transparent #fff transparent;
  top: 7px;
}

.select-items {
  position: absolute;
  background-color: #f9f9f9;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 99;
  border-radius: 0 0 5px 5px;
  max-height: 200px;
  overflow-y: auto;
}

.select-items div {
  color: #333;
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
}

.select-items div:hover, .same-as-selected {
  background-color: #ffdcd1;
}

.hide {
  display: none;
}


</style>