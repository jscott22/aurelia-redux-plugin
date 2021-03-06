import { metadata } from 'aurelia-metadata';
import { isString } from './utils';
import { Store } from './Store';
export const SELECTOR_METADATA_KEY = 'aurelia-redux:selector';
/**
 * Decorates a property that represents derived data from the applications store.
 *
 * @export
 * @template S The root application state.
 * @template T The return type of the selector.
 * @param {(string|Array<string|number>|StoreSelector<S, T>|null)} [selector] If a string is used it will be used
 *   as a path to access on the root state. The path can also be an array of strings representing a path. If a function
 *   is used, it will be invoked with the root state. If not value is given then the property name will be used as the path.
 * @param {ReduxSelectConfig} [config={}] A config object to configure behavior.
 * @returns {PropertyDecorator}
 * @example
 *
 * const appState = {
 *   activeUserId: 5,
 *   entities: {
 *     users: {
 *       5: {} // User data here
 *     }
 *   }
 * };
 *
 * ///////////////////////////
 *
 * // Select can accept a selector functions as well as strings, including selectors using `reselect`.
 *
 * const getActiveUser = state => entities.users[state.activeUserId];
 *
 * class ActiveUser {
 *   @select(getActiveUser)
 *   user: User;
 * }
 *
 * activeUser.user; // Logs user data
 *
 * // You can also create subscriber callback to be notify when the value has changed.
 *
 * class ActiveUser {
 *   @select(getActiveUser, { subscribe: true })
 *   user: User;
 *
 *   userChanged(newValue, oldValue) {
 *    // Do something here
 *   }
 * }
 */
export function select(selector, config = {}) {
    return function (target, propertyKey) {
        const handlerName = isString(config.subscribe) ? config.subscribe : `${propertyKey}Changed`;
        let lastValue;
        let lastChangeId;
        if (!selector) {
            selector = propertyKey;
        }
        // Flag this property in case the getter gets replaced by other decorators.
        metadata.define(SELECTOR_METADATA_KEY, true, target, propertyKey);
        // Used for a quick check later on when creating an observer.
        getter.__redux__ = true;
        if (delete target[propertyKey]) {
            Object.defineProperty(target, propertyKey, {
                get: getter,
                enumerable: true,
                configurable: true
            });
        }
        if (config.subscribe) {
            // This needs to come after we define the getter to get the correct observer.
            Store.queue(() => Store.instance.observe(target, propertyKey, observer));
        }
        function getter() {
            if (!Store.instance) {
                return lastValue;
            }
            let value = lastValue;
            if (Store.instance.changeId !== lastChangeId) {
                value = Store.instance.select(selector, this, { invoke: config.invoke });
                lastValue = value;
                lastChangeId = Store.instance.changeId;
            }
            return value;
        }
        function observer(...args) {
            target[handlerName].apply(target, args);
        }
    };
}
//# sourceMappingURL=select.js.map