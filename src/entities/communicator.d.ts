export default interface Communicator {
    postMessage: (data: any) => void;
    addEventListener: (eventName: 'message', handler: (e: MessageEvent) => any) => any;
}
