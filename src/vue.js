class Vue {
  constructor(options) {
    this.$options = options || {}
    this.$data = options.data || {}
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el

    this.proxyData(this.$data)

    new Observer(this.$data)

    new Compiler(this)
  }

  proxyData(data) {
    if (Object.prototype.toString.call(data).indexOf('Object') === -1) return

    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key]
        },
        set(newValue) {
          if (newValue === data[key]) return
          data[key] = newValue
        }
      })
    })
  }
}