<script setup>

</script>

<template>
  <svg width="79" height="38" viewBox="0 0 79 38" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect x="42" width="37" height="38" fill="url(#pattern0_2085_9)"/>
    <circle cx="19" cy="19" r="19" fill="#2C2C2C"/>
    <text
        x="19"
        y="27"
        font-weight="800"
        font-size="22"
        text-anchor="middle"
        fill="#FFFFFF"
    >{{ number }}</text>
    <path fill="#EB6035" d="M50.453 4.73 50.069 0H44.148l-.273 4.73zm1.256 15.468L50.539 5.792H43.814L42.977 20.297H42.063V38H80V20.198H51.709zM49.432 32.914h-4.47v-5.987h.001l-.001-.021c0-1.225 1-2.218 2.235-2.218s2.235.993 2.235 2.218l-.001.021v5.987zm6.613 0h-4.47v-6.008c0-1.225 1-2.218 2.235-2.218s2.235.993 2.235 2.218l-.001.021v5.987zm6.552 0h-4.47v-5.987h.001v-.021c0-1.225 1-2.218 2.234-2.218s2.235.993 2.235 2.218l-.001.021h.001v5.987z"/>
    <defs>
      <pattern id="pattern0_2085_9" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use xlink:href="#image0_2085_9" transform="matrix(0.00193779 0 0 0.00188679 -0.00866905 0)"/>
      </pattern>
    </defs>
  </svg>
</template>

<script>
export default {
  props: {
    number: {
      type: Number,
      required: true,
      validator: (value) => value === 1 || value === 2
    }
  }
}
</script>

<style scoped>

</style>