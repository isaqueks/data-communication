"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class DataCommunication {
    constructor(comm) {
        this.responseListeners = [];
        this.requestListeners = [];
        this.currId = 0;
        this._communicator = comm;
        this._communicator.addEventListener('message', e => this.messageHandler(e));
    }
    get communicator() {
        return this._communicator;
    }
    generateId() {
        const id = this.currId++;
        if (id >= Number.MAX_VALUE - 1) {
            this.currId = 0;
        }
        return id;
    }
    messageHandler(e) {
        return __awaiter(this, void 0, void 0, function* () {
            const msg = e.data;
            if (!msg.type || !msg.command) {
                return console.warn('Invalid message', msg);
            }
            if (msg.type === 'request') {
                const handler = this.requestListeners.find(h => h.command === msg.command);
                if (!handler) {
                    return console.warn(`No handler found "${msg.command}".`, msg);
                }
                const result = yield handler.handler(msg.data);
                const responseMsg = {
                    id: msg.id,
                    command: msg.command,
                    data: result,
                    type: 'response'
                };
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
        });
    }
    invoke(command, data = null) {
        const id = this.generateId();
        const msg = {
            id,
            command,
            data,
            type: 'request'
        };
        return new Promise((resolve, reject) => {
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
    on(command, handler) {
        this.requestListeners.push({
            command,
            handler
        });
    }
}
exports.default = DataCommunication;
