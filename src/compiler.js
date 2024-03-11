class Compiler {
  constructor(vm) {
    this.el = vm.$el
    this.vm = vm
    this.compiler(this.el)
  }

  compiler(el) {
    const childNodes = el.childNodes

    Array.from(childNodes).forEach(node => {
      if (this.isTextNode(node)) {
        this.compilerText(node)
      } else if (this.isElementNode(node)) {
        this.compilerElement(node)
      }

      // 判断该节点是否存在子节点
      if (node.childNodes && node.childNodes.length) {
        this.compiler(node)
      }
    })
  }

  compilerText(node) {
    const reg = /\{\{(.+?)\}\}/
    const value = node.textContent
    
    if (reg.test(value)) {
      const key = RegExp.$1.trim()

      // {{msg}}替换为数据，执行get依赖收集
      node.textContent = value.replace(reg, this.vm[key])

      // 解析{{msg}}时，把watcher中的Dep.target填充为watcher实例，并添加到data-dep的回调函数到subs中
      // new Watcher就是为了Dep收集subs
      new Watcher(this.vm, key, newValue => {
        node.textContent = newValue
      })
    }
  }
  compilerElement(node) {
    Array.from(node.attributes).forEach(attr => {
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        this.update(node, attr.value, attrName.substr(2))
      }
    })
  }
  update(node, key, attrName) {
    // 这样写的好处就是，当有新的指令时，不用侵入上层和本层方法进行修改
    const updateFn = this[`${attrName}Updater`]

    // 执行的updateFn内部方法的this指向update 所以需要bind一下指向compiler
    updateFn && updateFn.call(this, node, this.vm[key], key)
  }
  textUpdater(node, value, key) {
    // 设置v-text的数据到页面显示，并把下次更新的函数放在data-dep:subs中
    node.textContent = value

    // 并让data-dep收集回调函数subs中
    new Watcher(this.vm, key, newValue => {
      node.textContent = newValue
    })
  }
  modelUpdater(node, value, key) {
    // 设置v-model的数据到页面显示，并把下次更新的函数放在data-dep:subs中,并添加元素更新函数
    node.value = value
    new Watcher(this.vm, key, newValue => {
      node.value = newValue
    })
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }

  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
  isTextNode(node) {
    return node.nodeType === 3
  }
  isElementNode(node) {
    return node.nodeType === 1
  }
}