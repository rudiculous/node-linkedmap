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

    clear() {
        this._head = null;
        this._tail = null;
        this._length = 0;

        let self = this;
        Object.keys(this._map).forEach(function (key) {
            self.remove(_unPrefix(key));
        });
    },

    containsKey(key) {
        return _prefix(key) in this._map;
    },

    forEach(func) {
        let item = this._head;

        while (item != null) {
            func.call({}, item.key, item.value);
            item = item.next;
        }
    },

    get(key, defaultValue) {
        let returnValue = defaultValue;

        if (this.containsKey(key)) {
            returnValue = this._map[_prefix(key)].value;
        }

        return returnValue;
    },

    isEmpty() {
        return this._length === 0;
    },

    keySet() {
        let keys = new Set([]);

        this.forEach(function (key) {
            keys.add(key);
        });

        return keys;
    },

    put(key, value) {
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

    putAll(map) {
        let self = this;
        Object.keys(map).forEach(function (key) {
            self.put(key, map[key]);
        });
    },

    remove(key) {
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

    size() {
        return this._length;
    },

    toArray() {
        let arr = [];

        this.forEach(function (key, value) {
            arr.push(value);
        });

        return arr;
    },

    toMap() {
        let map = Object.create(null);

        this.forEach(function (key, value) {
            map[key] = value;
        });

        return map;
    },

    inspect() {
        let repr = [];

        this.forEach(function (key, value) {
            repr.push({key, value});
        });

        return repr;
    },

};

// I'd much rather do this using a generator, but this seems to be a lot
// slower (as tested in iojs v2.0).
//LinkedMap.prototype[Symbol.iterator] = function* iterator() {
//    let item = this._head;
//
//    while (item != null) {
//        yield [item.key, item.value];
//        item = item.next;
//    }
//};

/**
 * TODO: Use computed property names (ES6): [Symbol.iterator]: function* iterator() {}
 *       Maybe even this (don't know if this is legal): *[Symbol.iterator]() {}
 */

LinkedMap.prototype[Symbol.iterator] = function iterator() {
    let item = this._head;

    return {
        next: function next() {
            if (item == null) {
                return {
                    done: true,
                };
            }

            let ret = {
                value: [item.key, item.value],
                done: false,
            };

            item = item.next;

            return ret;
        },
    };
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
