import Emittery from "emittery";

interface RequestCacheItem {
  promise: Promise<unknown>;
  expiry: number;
}

interface Data {
  [key: string]: unknown;
  req_id?: number;
  subscribe?: number;
  authorize?: string;
}

interface SubscriptionMap {
  [key: number]: Array<(data: Data) => void>;
}

export interface DerivAPI extends Emittery {
  isAuthorized?: boolean;
  subscribe: (data: Data, callback: (data: Data) => void) => void;
  send: (data: Data, options?: { ttl: number }) => Promise<unknown>;
}

function DerivAPI(websocketUrl: string): DerivAPI {
  let lastRequestId = 0;
  const emitter = new Emittery();
  let connection: WebSocket;
  let subscriptions: { [key: string]: number } = {};
  let subscriptionMap: SubscriptionMap = {};

  function connect() {
    connection = new WebSocket(websocketUrl);
    setup();
  }

  function setup() {
    connection.addEventListener('open', handleOpen);
    connection.addEventListener('close', handleDisconnect);
    connection.addEventListener('message', handleMessage);
  }

  function handleOpen() {
    console.log('connection opened');
    emitter.emit('open');
    connection.send(JSON.stringify({ authorize: 'a1-FywiTnbVK0RAoMYW50IaTXkvbNouA' }));
  }

  function handleMessage(event: MessageEvent) {
    const data = JSON.parse(event.data) as Data;
    const command = Object.keys(data)[0];
    if (command === 'authorize') {
      (emitter as any).isAuthorized = true;
    }

    emitter.emit(command, data);

    if (!command === 'authorize') {
      return;
    }

    if (!data.echo_req?.req_id) {
      return;
    }

    subscriptionMap[data.echo_req.req_id].forEach(callback => {
      callback(data);
    });
  }

  let requestCache: { [key: string]: RequestCacheItem } = {};

  function send(data: Data, { ttl } = { ttl: 500 }): Promise<unknown> {
    const key = JSON.stringify(data);

    if (requestCache[key] && (Date.now() < requestCache[key].expiry)) {
      return requestCache[key].promise;
    }

    lastRequestId = lastRequestId + 1;
    data.req_id = lastRequestId;

    connection.send(JSON.stringify(data));

    const promise = new Promise((resolve, reject) => {
      subscriptionMap[lastRequestId] = subscriptionMap[lastRequestId] || [];
      subscriptionMap[lastRequestId].push(resolve);

      const timeoutId = setTimeout(() => {
        reject(new Error('Timeout error'));
        subscriptionMap[lastRequestId] = subscriptionMap[lastRequestId].filter(cb => cb !== resolve);
        clearTimeout(timeoutId);
      }, 5000);
    });

    requestCache[key] = {
      promise: promise,
      expiry: Date.now() + ttl
    };

    promise.finally(() => {
      setTimeout(() => {
        delete requestCache[key];
      }, ttl);
    });

    return promise;
  }

  function handleDisconnect() {
    console.log('connection closed');
  }

  function subscribe(data: Data, callback: (data: Data) => void) {
    const key = JSON.stringify(data);

    if (subscriptions[key]) {
      subscriptionMap[subscriptions[key]].push(callback);
    } else {
      lastRequestId = lastRequestId + 1;
      connection.send(JSON.stringify({
        ...data,
        subscribe: 1,
        req_id: lastRequestId
      }));

      subscriptions[key] = lastRequestId;
      subscriptionMap[lastRequestId] = subscriptionMap[lastRequestId] || [];
      subscriptionMap[lastRequestId].push(callback);
    }
  }

  connect();

  (emitter as any).subscribe = subscribe;
  (emitter as any).send = send;

  return emitter as Emittery & { subscribe: (data: Data, callback: (data: Data) => void) => void, send: (data: Data, options?: { ttl: number }) => Promise<unknown> };
}

export default DerivAPI;
