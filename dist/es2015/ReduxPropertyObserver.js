var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { TaskQueue } from 'aurelia-framework';
import { subscriberCollection } from 'aurelia-binding';
import { Store } from './Store';
let ReduxPropertyObserver = class ReduxPropertyObserver {
    constructor(obj, propertyName, store, taskQueue) {
        this.obj = obj;
        this.propertyName = propertyName;
        this.store = store;
        this.taskQueue = taskQueue;
        this.isSubscribed = false;
        this.subscribers = 0;
        this.queued = false;
    }
    getValue() {
        return this.obj[this.propertyName];
    }
    setValue(value) {
        throw new Error('AureliaRedux -> Properties must be set through a dispatched action!');
    }
    subscribe(context, callable) {
        this.addSubscriber(context, callable);
        this.subscribers++;
        if (!this.isSubscribed) {
            this.subscription = this.store.subscribe(this.onUpdate.bind(this));
            this.isSubscribed = true;
        }
    }
    unsubscribe(context, callable) {
        this.removeSubscriber(context, callable);
        this.subscribers--;
        if (this.subscribers < 1) {
            if (this.subscription) {
                this.subscription();
                this.subscription = null;
            }
            this.isSubscribed = false;
        }
    }
    unbind() {
        if (this.subscription) {
            this.subscription();
            this.subscription = null;
        }
        this.lastValue = null;
    }
    call() {
        const currentValue = this.obj[this.propertyName];
        if (currentValue !== this.lastValue) {
            this.callSubscribers(currentValue, this.lastValue);
            this.lastValue = currentValue;
        }
        this.queued = false;
    }
    onUpdate() {
        if (!this.queued) {
            this.taskQueue.queueMicroTask(this);
            this.queued = true;
        }
    }
};
ReduxPropertyObserver = __decorate([
    subscriberCollection(),
    __metadata("design:paramtypes", [Object, String, Store,
        TaskQueue])
], ReduxPropertyObserver);
export { ReduxPropertyObserver };
//# sourceMappingURL=ReduxPropertyObserver.js.map