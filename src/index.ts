/*
* Created by yyccmmkk on 2020/5/6 14:04
* 36995800@163.com
*/

import {defaultsDeep} from 'lodash';

const $: { (selector: string): HTMLElement | null } = (e: string) => document.querySelector(e);
const DEFAULTS: any = {
	targetDomain: '', //需要通信的标签目标域，不配置页默认跨域
	context: null,//指定subscribe回调执行下下文
	isSubscribeLastMsg: false,//新开标签页是否订阅之前最后发出的消息
	isReceiveSameNSMsg: false,//是否接收来自本命名空间下的消息
	namespace: document.domain,// 命名空间，用来分隔消息
	bridge: '//localhost:3030/bridge.html', //iframe 引入的中间页，需要根据实际静态资源地址来配置
	subscribe(data: any, _context?: any) {/* data:接收到的消息，_context TabBridge 实例*/
		console.log('subscribe:', data);  // 来自其它标签页的消息回调
	}
}

export class TabBridge {
	options: any;

	constructor(opt?: any) {
		this.options = defaultsDeep(opt, DEFAULTS, {cache: {}});

	}

	init() {
		const {targetDomain, cache, bridge, subscribe, namespace, context, isSubscribeLastMsg, isReceiveSameNSMsg} = this.options;
		const channel = new MessageChannel();
		const port1 = channel.port1;
		cache.channel = channel;
		if (document.domain !== targetDomain) {
			const ele: any = document.createElement('iframe');
			cache.iframe = ele;
			ele.id = `bridgeIFrame`;
			ele.addEventListener("load", () => {
				port1.onmessage = (e) => {
					const {namespace: NS, isLast, directive, payload} = JSON.parse(e.data);
					if ((isReceiveSameNSMsg || NS !== namespace ) && (isSubscribeLastMsg || !isSubscribeLastMsg && !isLast)) {
						context ? subscribe.apply(context, [{directive, payload}, this]) : subscribe({directive, payload}, this);
					}
				};
				ele.contentWindow.postMessage(JSON.stringify({directive: 'INIT', namespace}), '*', [channel.port2]);
			});
			ele.style.cssText = 'width:0;height:0;overflow:hidden;position:absolute;left:-1000px';
			ele.src = bridge;
			$('body')?.appendChild(ele);

		} else {
			this.initWorker();
		}
		return this;
	}

	initWorker(this: any) {
		const {cache, namespace: NS, subscribe,isReceiveSameNSMsg,isSubscribeLastMsg,context} = this.options;
		if ((window as any).SharedWorker) {
			const myWorker = new (window as any).SharedWorker("worker.js");
			myWorker.port.onmessage = (e: any) => {
				const {namespace, isLast,directive,payload} = JSON.parse(e.data);
				if ((isReceiveSameNSMsg || NS !== namespace ) && (isSubscribeLastMsg || !isSubscribeLastMsg && !isLast)) {
					context ? subscribe.apply(context, [{directive, payload}, this]) : subscribe({directive, payload}, this);
				}
			}
			cache.myWorker = myWorker;
		}
	}

	postMessage(this: any, directive: string, payload?: any) {
		const {targetDomain, cache} = this.options;
		let temp: any = document.domain !== targetDomain ? cache.channel.port1 : cache.myWorker.port;
		temp.postMessage(JSON.stringify(Object.assign({namespace: this.options.namespace}, {
			directive,
			payload
		})))
	}

	destroy() {
		const ele: HTMLElement | null = $('#bridgeIFrame');
		ele?.parentNode?.removeChild(ele);
	}
}