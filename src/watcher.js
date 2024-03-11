class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    this.key = key
    this.cb = cb

    Dep.target = this

    this.oldValue = this.vm[key]

    Dep.target = null
  }

  update() {
    const newValue = this.vm[this.key]

    if (this.oldValue === newValue) return

    this.cb(newValue)
  }
}