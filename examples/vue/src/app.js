import { createApp } from 'vue';
import App from './app.vue';
export var app = function () {
    var app = createApp(App);
    app.mount('#vue-app');
};
