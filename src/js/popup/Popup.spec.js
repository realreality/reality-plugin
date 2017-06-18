import Vue from 'vue'
import VueI18n from 'vue-i18n'
import Popup from './Popup.vue'

describe('Popup', () => {
  let vm

  beforeAll(() => {
    Vue.use(VueI18n)
    const i18n = new VueI18n({
      locale: 'en',
      messages: {
        en: {
          app: {
            name: 'Real Reality',
            desc: 'Some Description',
          },
        },
      },
    })
    const Ctor = Vue.extend(Popup)
    vm = new Ctor({ i18n }).$mount()
  })

  it('should render', () => {
    const expected = 'Real Reality Some Description sreality.cz bezrealitky.cz maxirealitypraha.cz reality.idnes.cz'
    expect(vm).toBeDefined()
    expect(vm.$el.textContent).toEqual(expected)
  })

  it('should fire action', () => {
    const visit = jest.fn()
    vm.visit = visit
    vm.$el.querySelector('a').click()
    expect(visit.mock.calls[0][0]).toEqual('https://sreality.cz')
  })
})
