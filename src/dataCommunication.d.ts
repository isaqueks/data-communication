import Communicator from "./entities/communicator";
declare type HandlerFn = (e: any) => any;
export default class DataCommunication {
    private responseListeners;
    private requestListeners;
    private _communicator;
    private currId;
    get communicator(): Communicator;
    constructor(comm: Communicator);
    private generateId;
    private messageHandler;
    invoke<T>(command: string, data: any): Promise<T>;
    on<T>(command: string, handler: HandlerFn): void;
}
export {};
