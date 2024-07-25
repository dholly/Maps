// composables/useYooKassa.js
import { ref } from 'vue';

export function useYooKassa() {
    const initiatePayment = async (amount, currency = 'RUB', description = 'Test payment') => {
        return new Promise((resolve, reject) => {
            const checkoutWidget = new window.YooMoneyCheckoutWidget({
                confirmation_token: 'YOUR_CONFIRMATION_TOKEN', // You'll need to get this from your backend
                return_url: `${window.location.origin}/payment-result`,
                error_callback: function(error) {
                    reject(error);
                }
            });

            checkoutWidget.render({
                amount: {
                    value: amount,
                    currency: currency
                },
                description: description
            }).then(() => {
                // Widget rendered successfully
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    };

    return { initiatePayment };
}