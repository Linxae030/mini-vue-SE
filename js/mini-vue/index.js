function createApp(rootComponent) {
	return {
		mount(selector) {
			const container = document.querySelector(selector);
			// 判断是否挂载
			let isMounted = false;
			let oldVNode = null;
			watchEffect(() => {
				if (!isMounted) {
					// 将render函数的返回值(h函数生成的vnode)挂载到container
					// 保存oldVNode用于下次patch
					oldVNode = rootComponent.render();
					// console.log(oldVNode);
					mount(oldVNode, container);
					isMounted = true;
				} else {
					const newVNode = rootComponent.render();
					patch(oldVNode, newVNode);
					// 更新oldVNode
					oldVNode = newVNode;
				}
			});
		},
	};
}
