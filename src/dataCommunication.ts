import Communicator from "./entities/communicator";

type HandlerFn = (e: any) => any;

interface RegisteredMessage<T = any> {
    id: number;
    command: string;
    data: T;
    type: 'request' | 'response';
}


interface RegisteredMessageHandler {
    id?: number;
    command: string;
    handler: HandlerFn;
}

export default class DataCommunication {

    private responseListeners: RegisteredMessageHandler[] = [];
    private requestListeners: RegisteredMessageHandler[] = [];

    private _communicator: Communicator;
    private currId = 0;

    public get communicator(): Communicator {
        return this._communicator;
    }

    constructor(comm: Communicator) {
        this._communicator = comm;
        this._communicator.addEventListener('message', e => this.messageHandler(e));
    }
    
    private generateId(): number {
        const id = this.currId++;
        if (id >= Number.MAX_VALUE - 1) {
            this.currId = 0;
        }
        return id;
    }
    
    private async messageHandler(e: MessageEvent<RegisteredMessage>) {
        const msg = e.data;
        if (!msg.type || (msg.data == undefined) || !msg.command) {
            return console.warn('Invalid message', msg);
        }

        if (msg.type === 'request') {
            const handler = this.requestListeners.find(h => h.command === msg.command);
            if (!handler) {
                return console.warn(`No handler found "${msg.command}".`, msg);
            }
            const result = await handler.handler(msg.data);
            const responseMsg: RegisteredMessage = {
                id: msg.id,
                command: msg.command,
                data: result,
                type: 'response'
            }

            this._communicator.postMessage(responseMsg);
        }
        else if (msg.type === 'response') {
            const handlerIndex = this.responseListeners.findIndex(h => h.id === msg.id);
            if (handlerIndex < 0) {
                return console.warn(`No response handler found "${msg.id}".`, msg);
            }

            const handler = this.responseListeners[handlerIndex];
            this.responseListeners.splice(handlerIndex, 1);

            handler.handler(msg.data);
        }
        else {
            throw new Error(`Invalid message type "${msg.type}".`);
        }
    }


    public invoke<T>(command: string, data: any): Promise<T> { 

        const id = this.generateId();

        const msg: RegisteredMessage = {
            id,
            command,
            data,
            type: 'request'
        }

        return new Promise<T>((resolve, reject) => {

            this.responseListeners.push({
                id,
                command,
                handler: (response) => {
                    resolve(response);
                }
            });

            this._communicator.postMessage(msg);

        });

    }

    public on<T>(command: string, handler: HandlerFn) {
        this.requestListeners.push({
            command,
            handler
        });
    }

}