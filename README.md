手写一个简单的Vue2实现

解析知识

------------------------------
* `data`数据响应式通过闭包实现，每一个`属性或数组项`，都通过闭包把数据临时保存起来，`set,get`都是修改闭包中的`临时数据`
* `data`闭包中还保存`dep`,数据更改的回调

------------------------------
* `data`数据每一个属性会绑定在`Vue实例`上，通过`this.xxx`的形式。访问到原始数据后，原始数据已经被重置为响应式，最终访问到`observer`的`get`方法中的`闭包数据`
* 下面是请求顺序
  1. `this.xxx`
  2. `Object.definePropoty(vue, xxx, { getter() this.$data[xxx] })`
  3. `defineReactive(data,key,value){ Object.definePropoty(vue, xxx, { getter() value, setter(newValue) value = newValue }) }`

------------------------------
* `data`数据每一个`属性或数组项`，都会创建一个对应的`Dep实例`，并保存在闭包中
  * 为什么需要数据需要`dep`？
    * `dep`保存当前数据改变后，需要更新页面的函数，当数据变化时更新页面
  * 添加依赖怎么运行？
    * eg: 用户定义computed`xxxAddOne: computed() { return this.xxx + 1 }`, 页面使用`{{xxxAddOne}}`
      * 解析页面，创建数据`watcher`，调用`computed`函数获取当前`computed`的值
      * 当函数调用获取`xxx`的数据时候，触发`xxx:getter`，并把其他数据的`watcher`添加到此数据的`dep`中
      * `xxx`更新后，调用`dep`中的其他数据的`watcher`，`watcher`的回调就是用户定义的`computed`函数，获取`xxx`的最新数值，

------------------------------
* 解析`html`的`v-model`和`{{msg}}`并替换所指属性的数据后，并把下次的`更新update函数`，例如文本节点的内容更新函数放到`dep.subs`中
  * 解析`html`后会通过替换函数（数据占位替换成真实数据）
  * 创建一个`watcher`实例（为什么需要创建watcher呢？），通过`watcher`实例，把替换函数记录到`dep`的`subs`中，当下次数据更新会调用替换函数
  * 为什么需要创建`watcher`？
    1. 
    2. 每一个`属性或数组项`会创建一个`watcher`，`watcher`会备份旧数据值，当旧数据和新数据相同时不调用回调

------------------------------
* 解析`html`赋值有三种方式,字段`key=name`
  1. 双大括号，数据`dep`监听`node.textContent`重新赋值
  2. `v-text`，和上面双大括号同一个处理函数
  3. `v-model`，数据`dep`监听`node.value`重新赋值。会增加一个`input`事件,回调函数把`input.value`赋值给`vue.name`，并传送给`set`，修改闭包数据

-----------------------------------
##### 场景一：页面绑定的数据更新流程！
1. 触发数据`setter`，并通知`dep.notify`中的`watcher`
2. 调用`watcher.update`把`render和update`放入队列(多个数据更新只会有一个更新项)
3. 然后队列启动执行，`_render`函数生成VDOM，`_update`经过Diff算法和旧`VDOM`比较，直接更新`DOM`文字

##### 场景二：one更新如何刷新被引用的computed:two页面数据
1. `one.setter` `dep.notify` `watcher.update`因为`computed`是惰性标记为`dirty`，接下来就是`组件watcher`
2. `_render`时获取`two`的值，判断`two.watcher.dirty=true`直接从新执行用户定义的函数
3. 更新页面逻辑

##### 速记
1. 页面首次渲染时候，收集数据被依赖的`watcher`，数据更新后，则通知依赖执行逻辑
2. `VDOM`不包含`v-if=false`的`DOM`
3. `Vue`运行大致流程，响应式数据，
4. `Vue`数组响应式，通过`defineProperty``闭包`实现，并重写数组基本方法

-----------------------------------
参考
https://github.com/Can-Chen/mini-vue2
