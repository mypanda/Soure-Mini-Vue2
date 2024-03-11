* data每一个属性都会绑定在Vue的实例上，this.xx
* data数据每一个属性，包含对象的每一个属性，都会创建一个Dep实例
* 解析html的v-model和{{msg}}时，替换元素的内容，并把下次的更新update函数放到data-dep:subs中

参考
https://github.com/Can-Chen/mini-vue2
