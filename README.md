# JS-browser-tab-bridge
跨标签页跨域通信，版本兼容性没有测试，建议使用TS开发

####使用方式
    bridge.html worker.js 需要放在静态资源服务器同一目录下（跨域用）

    import {TabBridge} from './tabBridge';
    
    // 初始化 tab bridge
    let bridge: any = new TabBridge({
    	namespace: 'NS_XX',
    	bridge: '//以实际路径为准/bridge.html',
    	subscribe: ({directive}: any) => { 
    	    //接收来自其它标签页的消息
    	    //请以实际业务逻辑为准
    		directive === 'UPDATE_XXX' && XXMsg$.next(directive)
    	}
    }).init();
    
    //发送消息到其它tab页
    bridge.postMessage('UPDATE_A_TAB', {a:1,b:2})
    

####配置说明

    targetDomain: '', //需要通信的标签目标域，不配置页默认跨域
    context: null,//指定subscribe回调执行下下文
    isSubscribeLastMsg: false,//新开标签页是否订阅之前最后发出的消息
    isReceiveSameNSMsg: false,//是否接收来自本命名空间下的消息
    namespace: document.domain,// 命名空间，用来分隔消息
    bridge: '//localhost:3030/bridge.html', //iframe 引入的中间页，需要根据实际静态资源地址来配置
    subscribe(data: any, _context?: any) {/* data:接收到的消息，_context TabBridge 实例*/
        console.log('subscribe:', data);  // 来自其它标签页的消息回调
    }

