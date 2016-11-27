import Vue from 'vue';
import VueI18n from 'vue-i18n';
import Popup from './Popup.vue';

describe('Popup', () => {
  beforeAll(() => {
    Vue.use(VueI18n);
  });

  it('should render', () => {
    const vm = new Vue({
      el: document.createElement('div'),
      render: h => h(Popup)
    });

    expect(vm).toBeDefined();
    expect(vm.$el.querySelector('.reality-app-popup-message').textContent).toEqual('message.desc');
    expect(vm.$el.querySelector('ul').textContent).toEqual('sreality.cz bezrealitky.cz maxirealitypraha.cz');
  });

  it('should fire action', () => {
    const vm = new Vue({
      el: document.createElement('div'),
      render: h => h(Popup)
    });
    let called = false;
    const visit = () => { called = true; };
    vm.$children[0].visit = visit;
    vm.$el.querySelector('a').click();
    expect(called).toBe(true);
  });
});
