const h = (tag, props, children) => {
	return {
		tag,
		props,
		children,
	};
};

const mount = (vnode, container) => {
	// 1.创建真实dom并在vnode上保留一份
	const el = (vnode.el = document.createElement(vnode.tag));

	// 2.处理props
	if (vnode.props) {
		for (const key in vnode.props) {
			const value = vnode.props[key];
			// on开头即为事件监听
			if (key.startsWith("on")) {
				// slice截掉on并转小写
				el.addEventListener(key.slice(2).toLocaleLowerCase(), value);
			} else {
				el.setAttribute(key, value);
			}
		}
	}

	// 3.处理children
	if (vnode.children) {
		if (!(vnode.children instanceof Array)) {
			el.textContent = vnode.children;
		} else {
			// 递归处理child
			for (const child of vnode.children) {
				// console.log(child);
				mount(child, el);
			}
		}
	}

	// 4.挂载到container上
	container.appendChild(el);
};

const patch = (n1, n2) => {
	if (n1.tag !== n2.tag) {
		const n1ElParent = n1.el.parentElement;
		n1ElParent.removeChild(n1.el);
		mount(n2, n1ElParent);
	} else {
		// console.log(n1, n2);
		// 1.取出element对象,待后续修改,并在新的vnode上保存一份
		const el = (n2.el = n1.el);

		// 2.处理props
		const oldProps = n1.props ?? {};
		const newProps = n2.props ?? {};
		// 2.1获取newProps添加到el中
		for (const key in newProps) {
			const oldValue = oldProps[key];
			const newValue = newProps[key];
			// console.log(key, oldValue, newValue);
			/* 
			  输出结果：
			  class gg coderwhy
			  id undefined aaa
			*/
			if (oldValue !== newValue) {
				// 替换成newValue
				if (key.startsWith("on")) {
					el.addEventListener(key.slice(2).toLowerCase(), newValue);
				} else {
					el.setAttribute(key, newValue);
				}
			}
		}
		// 2.2删除oldProps
		for (const key in oldProps) {
			const oldValue = oldProps[key];
			if (key.startsWith("on")) {
				el.removeEventListener(
					key.slice(2).toLocaleLowerCase(),
					oldValue
				);
			}
			if (!(key in newProps)) {
				el.removeAttribute(key);
			}
		}
		// 3.处理children
		const oldChildren = n1.children ?? [];
		const newChildren = n2.children ?? [];
		// 情况1:newChildren是文本
		if (typeof newChildren === "string") {
			// oldChildren本身也是文本
			if (typeof oldChildren === "string") {
				if (newChildren !== oldChildren) {
					el.textContent = newChildren;
				}
			} else {
				// oldChildren不为文本则直接替换innerHTML
				el.innerHTML = newChildren;
			}
		} else {
			// 情况2:newChildren是数组
			// oldChildren是文本,清空后挂载
			if (typeof oldChildren === "string") {
				el.textContent = "";
				newChildren.forEach((child) => {
					mount(child, el);
				});
			} else {
				// oldChildren: [v1, v2, v3, v8, v9]
				// newChildren: [v1, v5, v6]

				const commonLength = Math.min(
					newChildren.length,
					oldChildren.length
				);
				// 1.前面有相同节点的原生进行patch操作
				for (let i = 0; i < commonLength; i++) {
					patch(oldChildren[i], newChildren[i]);
				}
				// 2.newChildren.length > oldChildren.length
				if (newChildren.length > oldChildren.length) {
					// 截掉已经替换过的节点后遍历挂载
					newChildren.slice(oldChildren.length).forEach((child) => {
						mount(child, el);
					});
				} else if (newChildren.length < oldChildren.length) {
					oldChildren.slice(newChildren.length).forEach((child) => {
						el.removeChild(child.el);
					});
				}
			}
		}
	}
};
