"use strict";

/* Inspired by
 * http://codereview.stackexchange.com/questions/74330/simple-linked-hash-map-in-js-node-browser
 */

/**
 * To prevent access to magic keys (e.g. __proto__), we prefix all keys.
 *
 * @var keyPrefix
 */
const keyPrefix = 'xx';

function LinkedMap() {
    this._map = Object.create(null);
    this._head = null;
    this._tail = null;
    this._length = 0;
}

LinkedMap.prototype = {

    clear: function clear() {
        this._head = null;
        this._tail = null;
        this._length = 0;

        let self = this;
        Object.keys(this._map).forEach(function (key) {
            self.remove(_unPrefix(key));
        });
    },

    containsKey: function containsKey(key) {
        return _prefix(key) in this._map;
    },

    forEach: function forEach(func) {
        let item = this._head;

        while (item != null) {
            func.call({}, item.key, item.value);
            item = item.next;
        }
    },

    get: function get(key, defaultValue) {
        let returnValue = defaultValue;

        if (this.containsKey(key)) {
            returnValue = this._map[_prefix(key)].value;
        }

        return returnValue;
    },

    isEmpty: function isEmpty() {
        return this._length === 0;
    },

    keySet: function keySet() {
        let keys = new Set([]);

        this.forEach(function (key) {
            keys.add(key);
        });

        return keys;
    },

    put: function put(key, value) {
        this.remove(key);

        let item = {
            key: key,
            previous: this._tail,
            next: null,
            value: value,
        };

        if (this._head == null) {
            this._head = item;
        }

        if (this._tail == null) {
            this._tail = item;
        }
        else {
            this._tail.next = item;
            this._tail = item;
        }

        this._map[_prefix(key)] = item;
        this._length += 1;
    },

    putAll: function putAll(map) {
        let self = this;
        Object.keys(map).forEach(function (key) {
            self.put(key, map[key]);
        });
    },

    remove: function remove(key) {
        if (!this.containsKey(key)) {
            return undefined;
        }

        let pKey = _prefix(key);
        let item = this._map[pKey];
        delete this._map[pKey];
        this._length -= 1;

        if (item.previous != null) {
            item.previous.next = item.next;
        }

        if (item.next != null) {
            item.next.previous = item.previous;
        }

        if (item === this._head) {
            this._head = item.next;
        }

        if (item === this._tail) {
            this._tail = item.previous;
        }

        return item.value;
    },

    size: function size() {
        return this._length;
    },

    inspect: function inspect() {
        let repr = [];

        this.forEach(function (key, value) {
            repr.push({key, value});
        });

        return repr;
    },

};

exports = module.exports = LinkedMap;

/**
 * Convenience method to prefix the key.
 *
 * @param {String} key
 * @return {String}
 */
function _prefix(key) {
    return keyPrefix + key;
}

/**
 * Convenience method to remove the prefix from a key.
 *
 * @param {String} key
 * @return {String}
 */
function _unPrefix(key) {
    return key.substring(keyPrefix.length);
}