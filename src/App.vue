<script setup>
// Импорт необходимых модулей

import Vk from "@/assets/svg/contacts/vk.vue";
import Inst from "@/assets/svg/contacts/inst.vue";
import Phone from "@/assets/svg/contacts/phone.vue";
import Wa from "@/assets/svg/contacts/wa.vue";
import Mail from "@/assets/svg/contacts/mail.vue";
import YooKassaPayment from "@/components/YooKassaPayment.vue";
import api from '@/services/api';
import { ref } from 'vue';
import axios from 'axios';

const makePayment = async () => {
  try {
    const response = await api.createPayment();

    if (response.data.confirmation && response.data.confirmation.confirmation_url) {
      window.location.href = response.data.confirmation.confirmation_url;
    } else {
      console.error('No confirmation URL in the response');
    }
  } catch (error) {
    console.error('Error creating payment:', error);
  }
};


</script>

<template>
  <header>
    <div>
      <router-link to="/" class="nav-button logo">
        логотип

      </router-link>
      <nav class="navigation">
        <router-link to="/admin" class="nav-button">Админ панель</router-link>
        <router-link to="/location-map/" class="nav-button" active-class="active-nav">Карта</router-link>
        <router-link to="/locations/" class="nav-button" active-class="active-nav">Все места</router-link>
        <router-link to="/route-draw/" class="nav-button" active-class="active-nav">Маршруты нарисовать</router-link>
        <router-link to="/polygondraw/" class="nav-button" active-class="active-nav">Области нарисовать</router-link>
        <router-link to="/routes/" class="nav-button" active-class="active-nav">Маршруты</router-link>
      </nav>
    </div>
  </header>
  <main>
    <section class="main-wrap">
      <div class="preheader">
        <img src="@/assets/images/preheader.png" alt="headerimage">
      </div>
<!--      <div>-->
<!--        <button @click="makePayment">Make Test Payment</button>-->
<!--      </div>-->
<!--      <div>-->
<!--      youkassa-->
<!--        <YooKassaPayment />-->
<!--      </div>-->

      <router-view></router-view>
    </section>
  </main>
  <!--    <div v-if="showSingleLocation" class="breadcrumbs">
        <div>
          <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 1L2 8C2 8 6.87581 12.2663 10 15" stroke="#2C2C2C" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span @click="handleBreadcrumbClick">{{ breadcrumbs[0].name }}</span>
        </div>
            <div>
            <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 1L2 8C2 8 6.87581 12.2663 10 15" stroke="#2C2C2C" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <span class="active">{{ breadcrumbs[1].name }}</span>
            </div>
      </div>-->
  <footer>
    <div class="contacts">
      <div class="contacts-wrap">
        <p>Социальные сети</p>
        <div class="contacts-icon">
          <div class="contacts-icon-wrap">
            <vk/>
          </div>
          <div class="contacts-icon-wrap">
            <inst/>
          </div>
          <div class="contacts-icon-wrap">
            <phone/>
          </div>
        </div>
      </div>
      <div class="contacts-wrap">
        <p>Связаться с нами</p>
        <div class="contacts-icon">
          <div class="contacts-icon-wrap">
            <wa/>
            +7 999 12 85
          </div>
          <div class="contacts-icon-wrap">
            <mail/>
            iwufhjkl@gmail.com
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
<style lang="scss" scoped>
main {
  padding-left: 10px;
  padding-right: 10px;
  max-width: 1300px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 30px;
}

.preheader {
  margin-bottom: 23px;

  img {
    max-width: 100%;
  }
}

.contacts {
  display: flex;
  gap: 40px;
  font-weight: 800;
  font-size: 15px;
  color: #2c2c2c;
  max-width: 100%;
  overflow: auto;
  .contacts-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .contacts-icon {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .contacts-icon-wrap {
    display: flex;
    gap: 10px;
    align-items: center;
    font-weight: 500;
    font-size: 15px;
    color: #2c2c2c;
    cursor: pointer;
  }
}

.navigation {
  display: flex;
  //gap: 40px;
  justify-content: space-between;
  margin-left: 40px;
  margin-top: 15px;
  max-width: 100%;
  overflow: auto;
  .logo{
    display: none!important;
  }
  a {
    min-width: fit-content;
    font-weight: 800;
    font-size: 16px;
    color: rgba(38, 38, 38, 0.71);
    text-decoration: none;
    border-radius: 5px;
    padding-left: 25px;
    padding-right: 25px;
    height: 40px;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    margin-top: 5px;
    transition: ease-in-out 180ms;

    &:hover, &.active-nav {
      background: #2c2c2c;
      font-weight: 800;
      font-size: 16px;
      color: #fff;
      transition: ease-in-out 180ms;
    }
  }
}


header, footer {
  background: white;
  display: flex;
}

header > div, footer > div {
  width: 100%;
  max-width: 1300px;
  padding-left: 10px;
  padding-right: 10px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  align-items: center;
}


header {
  height: 100px;
}

footer {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 30px;
  height: 160px;
}
</style>


