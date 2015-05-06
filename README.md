# @rdcl/linkedmap

A simple linked map.

## TODO

- Implement tests.
- [This article][1] seems to suggest we should be able to do something
  like this:

        LinkedMap.prototype = {
            //...
            [Symbol.iterator]: function* iterator() {
                //...
            },
            //...
        };

  However, at the time this does not seem to work.


[1]: https://hacks.mozilla.org/2015/04/es6-in-depth-iterators-and-the-for-of-loop/
