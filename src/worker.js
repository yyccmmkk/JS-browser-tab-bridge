let clients = [];
let msgList = [];
self.addEventListener('connect', function (e) {
    const port = e.ports[0];
    clients.push(port);
    port.onmessage = function (e) {
        msgList.push(e.data);
        for (let v of clients) {
            v.postMessage(e.data);
        }
    }
    port.start();
    msgList.length > 0 && port.postMessage(JSON.stringify(Object.assign({isLast: true}, JSON.parse(msgList.pop()))));

});