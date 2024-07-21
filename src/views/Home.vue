<script setup>
import { onMounted, ref, watch } from 'vue'
import { useElementVisibility } from '@vueuse/core'
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'

gsap.registerPlugin(TextPlugin)

const buttonRef = ref(null)
const homeRef = ref(null)
const textRef = ref(null)
const isVisible = useElementVisibility(homeRef)

const animateText = () => {
  gsap.to(textRef.value, {
    duration: 0.7,
    text: 'по-новому',
    ease: 'none'
  })
}

const triggerButtonShine = () => {
  gsap.fromTo(buttonRef.value,
      {'--shine-left': '-100%'},
      {'--shine-left': '200%', duration: 1, ease: 'power2.in'}
  )
}

const setupPeriodicShine = () => {
  gsap.to({}, {
    duration: 3,
    repeat: -1,
    onRepeat: triggerButtonShine
  })
}

onMounted(() => {
  gsap.to(homeRef.value, {opacity: 1, duration: 0.5, ease: 'power2.out'})
  animateText()
  triggerButtonShine()
  setupPeriodicShine()
})

watch(isVisible, (newValue) => {
  if (newValue) {
    animateText()
    triggerButtonShine()
  }
})
</script>

<template>
  <div class="home" ref="homeRef" :class="{ 'visible': isVisible }">
    <div class="home-wrap">
      <div class="home-text">
        <p class="fade-in">Взгляни на свой город</p>
        <p class="typewriter" ref="textRef"></p>
        <p class="fade-in-delay">Каждый из нас понимает очевидную вещь: постоянный количественный рост и сфера нашей
          активности предоставляет.</p>
      </div>
      <button ref="buttonRef">Зарегистрироваться</button>
    </div>
    <img src="@/assets/images/home-bg.png" alt="homepage image">
  </div>
</template>

<style lang="scss" scoped>
.home {
  margin-top: 30px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #d0d0d0;
  opacity: 0;

  &.visible {
    opacity: 1;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.home-wrap {
  padding: 48px;
  flex: 1;

  button {
    margin-top: 100px;
    border-radius: 5px;
    width: 236px;
    height: 48px;
    background: #f75e32;
    font-weight: 900;
    font-size: 15px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: var(--shine-left, -100%);
      width: 50%;
      height: 200%;
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(45deg);
    }
  }
}

.home-text {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 15px;

  p {
    margin: 0;
  }

  p:nth-child(1) {
    font-weight: 700;
    font-size: 40px;
    color: #262626;
  }

  .typewriter {
    font-weight: 900;
    font-size: 64px;
    color: #262626;

    &::after {
      content: '!';
      color: #f75e32;
    }
  }

  p:nth-child(3) {
    font-weight: 700;
    font-size: 20px;
    color: #262626;
    max-width: 600px;
  }
}

.fade-in {
  opacity: 0;
  animation: fadeIn 1s ease-in-out forwards;
}

.fade-in-delay {
  opacity: 0;
  animation: fadeIn 1s ease-in-out 0.5s forwards;
}

.zoom-in {
  opacity: 0;
  transform: scale(0.9);
  animation: zoomIn 1s ease-in-out forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes zoomIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>