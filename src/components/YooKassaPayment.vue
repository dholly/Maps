<template>
  <div>
    <button @click="createPayment">Оплатить</button>
    <div id="payment-form"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios'; // Make sure to install axios: npm install axios

const paymentWidget = ref(null);
const paymentId = ref(null);

onMounted(() => {
  // Load YooKassa script
  const script = document.createElement('script');
  script.src = 'https://yookassa.ru/checkout-widget/v1/checkout-widget.js';
  script.async = true;
  document.body.appendChild(script);
});

const createPayment = async () => {
  try {
    // Step 1: Create a payment
    const response = await axios.post('https://api.yookassa.ru/v3/payments', {
      amount: {
        value: '100.00',
        currency: 'RUB'
      },
      confirmation: {
        type: 'embedded'
      },
      capture: true,
      description: 'Тестовый платеж'
    }, {
      auth: {
        username: '425505',
        password: 'test_tzAa9dBzNhSWu7i-Nl_w43ub2mgoUNkB9JWQEBjVlWo'
      },
      headers: {
        'Idempotence-Key': `${Date.now()}-${Math.random()}`
      }
    });

    const { id, confirmation: { confirmation_token } } = response.data;
    paymentId.value = id;

    // Step 2: Initialize and render the widget
    initializeWidget(confirmation_token);
  } catch (error) {
    console.error('Error creating payment:', error);
    alert('Ошибка при создании платежа. Пожалуйста, попробуйте еще раз.');
  }
};

const initializeWidget = (confirmationToken) => {
  if (paymentWidget.value) {
    paymentWidget.value.destroy();
  }

  paymentWidget.value = new window.YooMoneyCheckoutWidget({
    confirmation_token: confirmationToken,
    return_url: 'https://prom-map.ru/payment-result',
    error_callback: function (error) {
      console.error('YooKassa error:', error);
      alert('Произошла ошибка при оплате. Пожалуйста, попробуйте еще раз.');
    }
  });

  paymentWidget.value.render('payment-form')
      .then(() => {
        console.log('Payment form rendered successfully');
      })
      .catch((error) => {
        console.error('Error rendering payment form:', error);
        alert('Ошибка при отображении формы оплаты. Пожалуйста, обновите страницу и попробуйте снова.');
      });
};

// Step 3: Check payment status (you should implement this on your server)
const checkPaymentStatus = async () => {
  try {
    const response = await axios.get(`https://api.yookassa.ru/v3/payments/${paymentId.value}`, {
      auth: {
        username: '425505',
        password: 'test_tzAa9dBzNhSWu7i-Nl_w43ub2mgoUNkB9JWQEBjVlWo'
      }
    });

    const {status} = response.data;
    console.log('Payment status:', status);
    // Handle different status cases here
  } catch (error) {
    console.error('Error checking payment status:', error);
  }
};
</script>