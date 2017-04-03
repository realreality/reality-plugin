import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Popup from './Popup.vue'

describe('Popup', () => {
  let vm

  beforeAll(() => {
    Vue.use(VueI18n)
    vm = new Vue({
      el: document.createElement('div'),
      render: h => h(Popup),
    })
  })

  it('should render', () => {
    expect(vm).toBeDefined()
    expect(vm.$el.querySelector('.reality-app-popup-message').textContent).toEqual('message.desc')
  })

  it('should fire action', () => {
    const visit = jest.fn()
    vm.$children[0].visit = visit
    vm.$el.querySelector('a').click()
    expect(visit.mock.calls[0][0]).toEqual('https://sreality.cz')
  })
})
