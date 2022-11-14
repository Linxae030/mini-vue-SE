// 全局变量临时存储需要调用的函数
let reactiveFn = null;
// weakMap存储对象对应的属性对应的依赖实例
let targetMap = new WeakMap();
// 依赖类
class Depend {
	constructor() {
		this.reactiveFns = new Set();
	}
	depend() {
		// notify执行时也会触发getter此时reactiveFn为null
		if (reactiveFn) this.reactiveFns.add(reactiveFn);
	}
	notify() {
		this.reactiveFns.forEach((fn) => {
			fn();
		});
	}
}
// 封装获取依赖的函数
function getDepend(target, key) {
	let map = targetMap.get(target);
	// 如果该对象没有对应一个map
	if (!map) {
		map = new Map();
		targetMap.set(target, map);
	}
	let depend = map.get(key);
	if (!depend) {
		depend = new Depend();
		map.set(key, depend);
	}
	return depend;
}

function watchEffect(fn) {
	reactiveFn = fn;
	fn();
	reactiveFn = null;
}
function reactive(obj) {
	return new Proxy(obj, {
		get: function (target, key, receiver) {
			// console.log("触发getter");
			// 拿到触发getter对象的依赖实例
			const depend = getDepend(target, key);
			// 收集依赖
			depend.depend();
			return Reflect.get(target, key, receiver);
		},
		set: function (target, key, newValue, receiver) {
			// console.log("触发setter");
			Reflect.set(target, key, newValue, receiver);
			const depend = getDepend(target, key);
			depend.notify();
		},
	});
}
// const info = reactive({ counter: 100 });

// watchEffect(function doubleCounter() {
// 	console.log(info.counter * 2);
// });
// info.counter = 400;
