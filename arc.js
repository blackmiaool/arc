/*******************************************************************************

Arc.js

 - passes crockford's jslint, minifies with google's closure
 - contains modules - utility, dom, comms, booter, frame,
   algorithms ...
 - uses single global with safe extending for each module

Utility (compare to underscore, lodash)

 - additional coverage for looping, type checking, extending ...
 - consistent ordering, naming conventions ...
 - fewer function branches
 - privacy
 - unit testing

Dom (compare to jquery, jqueryui)

 - additional coverage for the dom
 - consistent coding style ...
 - fewer function branches

Comms (N/A)

 - provides registry, event system, debugger ...
 - reduces dependencies

Booter (N/A)

 - asynchronous serialized ajax with ordered responses via caching
 - dynamic resource loads using DOM appends
 - consolidates static data for single network requests
 - client-side revision control eliminates redundant downloads of static data
 - browser detection for targeted CSS and to reduce code base

Frame (N/A)

 - integrated ajax framework
 - consolidated model/ajax system which takes advantage of 
   JavaScript(s) dynamic objects
 - single point of troubleshooting and performance analysis

Algorithms (compare to nczonline.net)

 - provided for academic reasons only
 - native implementations are likely faster

*******************************************************************************/

// browser:   allow access to the DOM
// vars:      allow block scoping in preparation for JavaScript Harmony
// forin:     not all objects need prototype ing
// plusplus:  ++ is OK, use wisely
// eqeq:      == and != is OK
// ass:       var foo = moo = who is O.K. ( not ass )

/*jslint
    browser: true,
    vars: true,
    forin: true,
    plusplus: true,
    eqeq: true,
    ass: true
*/

/*******************************************************************************
**UTILITY
*******************************************************************************/

(function (self, undef) {

    "use strict";

    // holds (P)ublic properties

    var $P = {},

    // holds p(R)ivate properties

        $R = {},

        // native methods (alphabetical order)

        nativeFilter = Array.prototype.filter,
        nativeIsArray = Array.isArray,
        nativeSlice = Array.prototype.slice,
        nativeSome = Array.prototype.some,
        nativeToString = Object.prototype.toString;

/******************************************************************************/
// GLOBAL MANAGEMENT

    $P.noConflict = (function () {

        // g is the single global variable

        $R.g = '$A';
        $R.previous = self[$R.g];
        $P.molist = {
            utility: true
        };
        return function () {
            var temp = self[$R.g];
            self[$R.g] = $R.previous;
            return temp;
        };
    }());

/******************************************************************************/
// TYPE CHECKS

    // returns boolean

    $P.isType = function (type, obj) {
        return $P.getType(obj) === type;
    };

    // returns type in string form and capitalized

    $P.getType = function (obj) {
        return nativeToString.call(obj).slice(8, -1);
    };

    $P.isFalse = function (obj) {
        return obj === false;
    };

    $P.isUndefined = function (obj) {
        return obj === undef;
    };

    $P.isNull = function (obj) {
        return obj === null;
    };

    // detects null, and undefined

    $P.isGone = function (obj) {
        return obj == null;
    };

    // detects null, undefined, NaN, '', 0, -0, false

    $P.isFalsy = function (obj) {
        return !obj;
    };

    // detects opposite of isFalsy

    $P.isTruthy = function (obj) {
        return !!obj;
    };

    // shortcut as their are only two primitive boolean values

    $P.isBoolean = function (obj) {
        return obj === true || obj === false ||
            nativeToString.call(obj) === '[object Boolean]';
    };

    // delegates to native

    $P.isArray = nativeIsArray || function (obj) {
        return nativeToString.call(obj) === '[object Array]';
    };

    // jslint prefers {}.constructor(obj) over Object(obj)
    // returns boolean

    $P.isObjectAbstract = function (obj) {
        return !!(obj && (obj === {}.constructor(obj)));
    };

    // returns boolean

    $P.isArrayAbstract = function (obj) {
        return !!(obj && obj.length === +obj.length);
    };

/******************************************************************************/
// LOOPING

    $P.someIndex = function (arr, func, con) {
        var ind, len;
        if (!arr || typeof func !== 'function') {
            return false;
        }
        if (nativeSome && arr.some === nativeSome) {
            return arr.some(func, con);
        }
        for (ind = 0, len = arr.length; ind < len; ind += 1) {
            if (func.call(con, arr[ind], ind, arr)) {
                return true;
            }
        }
        return false;
    };

    $P.someKey = function (obj, func, con) {
        var key;
        if (!obj || typeof func !== 'function') {
            return false;
        }
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (func.call(con, obj[key], key, obj)) {
                    return true;
                }
            }
        }
        return false;
    };

    $P.eachString = function (str, func, con) {
        var regexp = /^|\s+/;
        if (regexp.test(str)) {
            $P.someIndex(str.split(regexp), func, con);
        }
    };

    $P.extend = function (obj) {
        $P.someIndex(nativeSlice.call(arguments, 1), function (val) {
            $P.someKey(val, function (val_inner, key) {
                obj[key] = val_inner;
            });
        });
        return obj;
    };

    $P.filter = function (arr, func, con) {
        var results = [];
        if (!arr || typeof func !== 'function') {
            return results;
        }
        if (nativeFilter && arr.filter === nativeFilter) {
            return arr.filter(func, con);
        }
        $P.someIndex(arr, function (val, ind, arr) {
            if (func.call(con, val, ind, arr)) {
                results.push(val);
            }
        });
        return results;
    };

    $P.extendSafe = function (obj1, obj2) {
        var key;
        for (key in obj2) {
            if (obj2.hasOwnProperty(key) && obj1.hasOwnProperty(key)) {
                throw "naming collision: " + key;
            }
            obj1[key] = obj2[key];
        }
        return obj1;
    };

    $P.clone = function (obj) {
        return $P.extend({}, obj);
    };

/******************************************************************************/
// GENERAL

    $P.someIndex(['Arguments', 'Function', 'String', 'Number',
        'Date', 'RegExp', 'Object'], function (val) {
        $P['is' + val] = function (obj) {
            return $P.isType(val, obj);
        };
    });

    $P.runTest = (function () {

        // holds test name and result

        var tests = {};
        return function (name, arr, func) {
            tests[name] = func.apply(this, arr);
        };
    }());

/******************************************************************************/
// COMPLETE

    self[$R.g] = $P.extendSafe($P, {});

}(this));


/*******************************************************************************
**DOM
*******************************************************************************/


(function (win, doc) {

    "use strict";

        // p(R)ivate propeties go here

    var $R = {},

        // (P)ublic properties go here

        $P = function (selector) {
            return new $R.Constructor(selector);
        },

        // (D)ependencies go here

        $D;

    $D = (function manageGlobal() {
        $R.g = '$A';
        if (win[$R.g] && win[$R.g].molist && win[$R.g].molist.utility) {
            win[$R.g].molist.dom = true;
        } else {
            throw "dom requires utility module";
        }
        return win[$R.g];
    }());

/******************************************************************************/
// DOM RETREIVAL

    $P.el = function (selector_native) {
        if (selector_native) {
            var type = selector_native.match(/^(@|#|\.)([\x20-\x7E]+)$/);
            if (!type || !type[1] || !type[2]) {
                return {error: "mal-formed selector"};
            }
            var type1 = type[1];
            var type2 = type[2];
            if (type1 === '#') {
                return doc.getElementById(type2);
            }
            if (type1 === '.' && doc.getElementsByClassName) {
                return doc.getElementsByClassName(type2);
            }
            if (type1 === '@') {
                return doc.getElementsByName(type2);
            }
        }
    };

/******************************************************************************/
// DOM REPORTING

    $P.rDOM = function () {
        var z_arr = {},
            all_el = document.body.getElementsByTagName("*"),
            i,
            len,
            cur,
            style,
            z_index;
        for (i = 0, len = all_el.length; i < len; i++) {
            cur = all_el[i];
            style = win.getComputedStyle(cur);
            z_index = style.getPropertyValue("z-index");
            if (z_index !== "auto") {
                z_arr[i] = [cur.id, cur.tagName, cur.className, z_index];
            }
        }
        return z_arr;
    };

/******************************************************************************/
// DOM MANIPULATION

    $P.removeElement = function (el) {
        if (el && el.parentNode) {
            return el.parentNode.removeChild(el);
        }
        return null;
    };

/*
*/

    $P.insertAfter = function (el, ref) {
        if (el) {
            return ref.parentNode.insertBefore(el, ref.nextSibling);
        }
        return null;
    };

    $P.isElement = function (obj) {
        return !!(obj && obj.nodeType === 1);
    };

/*
*/

    // update to conform to util style

    $P.eachChild = function (ref_el, func, con) {
        if (ref_el) {
            var iter_el = ref_el.firstChild,
                result;
            do {
                result = func.call(con, iter_el, ref_el);
                if (result !== undefined) {
                    return result;
                }
                iter_el = iter_el.nextSibling;
            } while (iter_el !== null);
        }
        return null;
    };

    $P.HTMLToElement = function (html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        return div.firstChild;
    };

    $P.getData = function (id) {
        var data,
            obj = {},
            el = document.getElementById(id);
        if (el.dataset) {
            $D.someKey(el.dataset, function (val, key) {
                obj[key] = val;
            });
        } else {
            data = $D.filter(el.attributes, function (at) {
                return (/^data-/).test(at.name);
            });
            $D.someIndex(data, function (val, i) {
                obj[data[i].name.slice(5)] = val.value;
            });
        }
        return obj;
    };

/******************************************************************************/
// MANIPULATE CLASSNAME ATTRIBUTE

    $R.hasClass = function (el, name) {
        return new RegExp('(\\s|^)' + name, 'g').test(el.className);
    };

    $R.toggleNS = function (el, ns, prop) {
        $P.eachString(el.className, function (val) {
            if (val.match(/toggle_/)) {
                var names = val.split(/_/);
                if (names[1] === ns && names[2] !== prop) {
                    $P.removeClass(el, val);
                }
            }
        });
    };

    $P.addClass = function (el, name) {
        if (!$R.hasClass(el, name)) {
            el.className += (el.className ? ' ' : '') + name;
        }
        var temp = name.match(/toggle_(\w+)_(\w+)/);
        if (temp) {
            $R.toggleNS(el, temp[1], temp[2]);
            return;
        }
    };

    $P.removeClass = function (el, name) {
        el.className = name ? el.className.replace(new RegExp('(\\s|^)' +
                name, 'g'), '') : '';
    };

/******************************************************************************/
// CONSTRUCTOR

    $R.Constructor = function (selector) {
        var type,
            type1,
            type2,
            temp,
            obj_type;

        // $D object detected

        if (selector instanceof $R.Constructor) {
            return selector;
        }

        // window object detected

        if (selector === win) {
            this[0] = selector;
            return this;
        }

        // document object detected

        if (selector === doc) {
            this[0] = selector;
            return this;
        }

        // element object detected

        if ($P.isElement(selector)) {
            this[0] = selector;
            return this;
        }

        // only strings should be left

        if (selector) {
            obj_type = $D.getType(selector);
        }

        if (obj_type !== 'String') {
            return this;
        }

        // selector is a symbol follwed by asci

        type = selector.match(/^(@|#|\.)([\x20-\x7E]+)$/);
        if (!type) {
            return this;
        }
        type1 = type[1];
        type2 = type[2];

        // id

        if (type1 === '#') {
            temp = doc.getElementById(type2);
            if (!temp) {
                return this;
            }
            this[0] = temp;
            return this;
        }

        // class

        if (type1 === '.' && doc.getElementsByClassName) {
            temp = doc.getElementsByClassName(type2);
            if (!temp) {
                return this;
            }
            $D.someIndex(temp, function (val, index) {
                this[index] = val;
            }, this);
            return this;
        }

        // name

        if (type1 === '@') {
            temp = doc.getElementsByName(type2);
            if (!temp) {
                return this;
            }
            $D.someIndex(temp, function (val, index) {
                this[index] = val;
            }, this);
            return this;
        }
    };

    $R.proto = $R.Constructor.prototype;

/******************************************************************************/
// EFFECTS

    $R.proto.fade = function (direction, max_time, callback) {
        var privates = {},
            self = this;

        // initialize

        privates.elapsed = 0;
        privates.GRANULARITY = 10;
        if (privates.timer_id) {
            win.clearInterval(privates.timer_id);
        }

        (function next() {
            privates.elapsed += privates.GRANULARITY;
            if (!privates.timer_id) {
                privates.timer_id = win.setInterval(next, privates.GRANULARITY);
            }
            if (direction === 'up') {
                $D.someKey(self, function (val) {
                    val.style.opacity = privates.elapsed / max_time;
                });

            } else if (direction === 'down') {
                $D.someKey(self, function (val) {
                    val.style.opacity = (max_time - privates.elapsed) / max_time;
                });
            }
            if (privates.elapsed >= max_time) {
                if (callback) {
                    callback();
                }
                win.clearInterval(privates.timer_id);
            }
        }());
    };

    $P.peakOut = function (elem, offset, delay, callback) {
        var privates = {};

        // constants initialization

        privates.RADIX = 10;
        privates.GRAN_TIME = 15;
        privates.GRAN_DIST = 1;
        privates.UNITS = 'px';

        // privates initialization

        privates.el = elem;
        privates.start = parseInt($P.getComputedStyle(privates.el).getPropertyValue("top"),
                privates.RADIX);

        privates.status = 'down';
        privates.end = privates.start + offset;
        privates.current = privates.start;
        privates.id = null;

        (function next() {
            if ((privates.status === 'down') && (privates.current < privates.end)) {
                privates.current += privates.GRAN_DIST;
                privates.el.style.top = privates.current + privates.UNITS;
                if (!privates.id) {
                    privates.id = $P.setInterval(next, privates.GRAN_TIME);
                }
            } else if ((privates.status === 'down') && (privates.current === privates.end)) {
                privates.status = 'up';
                $R.resetInterval(privates);
                $P.setTimeout(next, delay);
            } else if ((privates.status === 'up') && (privates.current > privates.start)) {
                privates.current -= privates.GRAN_DIST;
                privates.el.style.top = privates.current + privates.UNITS;
                if (!privates.id) {
                    privates.id = $P.setInterval(next, privates.GRAN_TIME);
                }
            } else if ((privates.status === 'up') && (privates.current === privates.start)) {
                $R.resetInterval(privates);
                callback();
            }
        }());
    };

    $R.resetInterval = function (privates) {
        $P.clearInterval(privates.id);
        privates.id = 0;
    };

    $R.expandFont = function (direction, max_time) {
        var self = this,
            el_prim = self[0],
            privates = {};

        if (el_prim.timer_id) {
            return;
        }

        el_prim.style.fontSize = $P.getComputedStyle(el_prim,
                null).getPropertyValue("font-size");

        privates.final_size = parseInt(el_prim.style.fontSize, privates.RADIX);
        privates.GRANULARITY = 10;
        privates.time_elapsed = 0;
        (function next() {
            $D.someKey(self, function (val) {
                if (direction === 'up') {
                    val.style.fontSize = ((privates.time_elapsed / max_time) *
                            privates.final_size) + 'px';

                } else if (direction === 'down') {
                    val.style.fontSize = ((max_time - privates.time_elapsed) /
                            max_time) + 'px';
                }
            });
            privates.time_elapsed += privates.GRANULARITY;

            // completed, do not call next

            if (el_prim.timer_id_done) {
                $P.clearTimeout(el_prim.timer_id);
                el_prim.timer_id = undefined;
                el_prim.timer_id_done = undefined;

            // intermediate call to next

            } else if (privates.time_elapsed < max_time) {
                el_prim.timer_id = $P.setTimeout(next, privates.GRANULARITY);

            // normalizing call to guarante (elapsed === max)

            } else if (privates.time_elapsed >= max_time) {
                el_prim.timer_id = $P.setTimeout(next, privates.GRANULARITY);
                el_prim.timer_id_done = true;
                privates.time_elapsed = max_time;
            }
        }());
    };

    $R.proto.expandFont = function (direction, max_time, big_size) {
        return $R.expandFont.call(this, direction, max_time, big_size);
    };

    $P.expandFont = (function () {
        return function (element, direction, max_time, big_size) {
            var temp = [];
            temp[0] = element;
            $R.expandFont.call(temp, direction, max_time, big_size);
        };
    }());

/******************************************************************************/
// EVENTS

    $R.functionNull = function () {
        return undefined;
    };

    // createEvent

    $R.createEvent = function () {
        if (doc.createEvent) {
            return function (type) {
                var event = doc.createEvent("HTMLEvents");
                event.initEvent(type, true, false);
                $D.someKey(this, function (val) {
                    val.dispatchEvent(event);
                });
            };
        }
        if (doc.createEventObject) {
            return function (type) {
                var event = doc.createEventObject();
                event.eventType = type;
                $D.someKey(this, function (val) {
                    val.fireEvent('on' + type, event);
                });
            };
        }
        return $R.functionNull;
    };

    $R.proto.createEvent = function (type) {
        return $R.createEvent.call(this, type);
    };

    $P.createEvent = (function () {
        return function (element, type) {
            var temp = [];
            temp[0] = element;
            $R.createEvent.call(temp, type);
        };
    }());

    // addEvent

    $R.addEvent = (function () {
        if (win.addEventListener) {
            return function (type, callback) {
                $D.someKey(this, function (val) {
                    val.addEventListener(type, callback);
                });
            };
        }
        if (win.attachEvent) {
            return function (type, callback) {
                $D.someKey(this, function (val) {
                    val.attachEvent('on' + type, callback);
                });
            };
        }
        return $R.functionNull;
    }());

    $R.proto.addEvent = function (type, callback) {
        return $R.addEvent.call(this, type, callback);
    };

    $P.addEvent = (function () {
        return function (element, type, callback) {
            var temp = [];
            temp[0] = element;
            $R.addEvent.call(temp, type, callback);
        };
    }());

    // removeEvent

    $R.proto.removeEvent = (function () {
        if (win.removeEventListener) {
            return function (type, callback) {
                $D.someKey(this, function (val) {
                    val.removeEventListener(type, callback);
                });
            };
        }
        if (win.detachEvent) {
            return function (type, callback) {
                $D.someKey(this, function (val) {
                    val.detachEvent('on' + type, callback);
                });
            };
        }
        return $R.functionNull;
    }());

    $R.proto.removeEvent = function (type, callback) {
        return $R.removeEvent.call(this, type, callback);
    };

    $P.removeEvent = (function () {
        return function (element, type, callback) {
            var temp = [];
            temp[0] = element;
            $R.removeEvent.call(temp, type, callback);
        };
    }());

/******************************************************************************/
// AJAX

    $P.ajax = function (config_ajax) {
        var xhr;

        // get

        if (config_ajax.type === 'get') {
            xhr = new win.XMLHttpRequest();
            xhr.open('GET', config_ajax.url, true);
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    config_ajax.callback(xhr.responseText);
                }
            };
            xhr.send(null);
        }

        // post

        if (config_ajax.type === 'post') {
            xhr = new win.XMLHttpRequest();
            xhr.open("POST", config_ajax.url, true);
            xhr.setRequestHeader("Content-type",
                    "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    config_ajax.callback(xhr.responseText);
                }
            };
            xhr.send(config_ajax.data);
        }

        // post for form_data

        if (config_ajax.type === 'multi') {
            xhr = new win.XMLHttpRequest();
            xhr.open("POST", config_ajax.url, true);
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    config_ajax.callback(xhr.responseText);
                }
            };
            xhr.send(config_ajax.data);
        }

    };

    $R.Queue = (function () {
        var queue = [],
            publik = {};
        function getIndexFromToken(callback) {
            var hold;
            $D.someIndex(queue, function (val, index) {
                if (val.callback === callback) {
                    hold = index;
                    return index;
                }
            });
            return hold;
        }
        function getBlockedProperty(item) {
            var blocked;
            if (item) {
                blocked = item.blocked;
            } else {
                blocked = false;
            }
            return blocked;
        }
        publik.addItem = function (callback) {
            var temp = {};
            temp.blocked = false;
            temp.callback = callback;
            temp.response_text = null;
            queue.push(temp);
        };
        publik.itemCompleted = function (response_text, callback) {
            var index,
                item,
                blocked;
            index = getIndexFromToken(callback);
            if (index !== 0) {
                queue[index].blocked = true;
                queue[index].response_text = response_text;
            } else {
                item = queue.shift();
                item.callback(response_text);
                blocked = getBlockedProperty(queue[0]);
                while (blocked) {
                    item = queue.shift();
                    item.callback(item.response_text);
                    blocked = getBlockedProperty(queue[0]);
                }
            }
        };
        return publik;
    }());

    $P.serialAjax = function (source, callback) {
        $R.Queue.addItem(callback);
        $P.ajax({
            type:       'get',
            url:        source,
            callback:   function (response_text) {
                $R.Queue.itemCompleted(response_text, callback);
            }
        });
    };

/******************************************************************************/
// WRAPS

    // timeouts

    $P.setTimeout = function () {
        return win.setTimeout.apply(win, arguments);
    };

    $P.clearTimeout = function () {
        return win.clearTimeout.apply(win, arguments);
    };

    $P.setInterval = function () {
        return win.setInterval.apply(win, arguments);
    };

    $P.clearInterval = function () {
        return win.clearInterval.apply(win, arguments);
    };

    // styles

    $P.getComputedStyle = function () {
        return win.getComputedStyle.apply(win, arguments);
    };

    // fragments

    $P.createDocumentFragment = function () {
        return doc.createDocumentFragment.apply(doc, arguments);
    };

    // elements

    $P.createElement = function () {
        return doc.createElement.apply(doc, arguments);
    };

    // oo style

    $P.FormData = win.FormData;

    $P.FileReader = win.FileReader;

    // other style

    $P.localStorage = win.localStorage;

    $P.sessionStorage = win.sessionStorage;

/******************************************************************************/
// LOG

    $P.log = function (obj) {
        var logger,
            type,
            temp,
            completed;

        // wrap win.console to protect from IE
        // bind to satisfy Safari

        if (win.console) {
            logger = win.console.log.bind(win.console);
        } else {
            return;
        }

        // validation

        type = $D.getType(obj);
        if (!type) {
            logger("Object did not stringify");
            return;
        }

        // host objects, event ...

        if (type === 'Event') {
            logger('LOG|host|event>');
            logger(obj);
            return;
        }

        // library objects

        if (win.jQuery && (obj instanceof win.jQuery)) {
            logger('LOG|library|jquery>');
            logger(obj);
            return;
        }

        // language objects

        $D.someIndex(['Arguments', 'Array', 'Object'], function (val) {
            if (type === val) {
                try {
                    temp = JSON.stringify(obj, null, 1);
                } catch (e) {
                    temp = false;
                }
                if (temp) {
                    logger('LOG|language|' + type + '>');
                    logger(temp);
                } else {
                    logger('LOG|language|' + type + '>');
                    logger(obj);
                }
                completed = true;
            }
        });

        if (completed) {
            return;
        }

        $D.someIndex(['Boolean', 'Date', 'Error', 'Function', 'JSON', 'Math',
            'Number', 'Null', 'RegExp', 'String', 'Undefined'],
            function (val) {
                if (type === val) {
                    logger('LOG|language|' + type + '>');
                    logger(obj);
                    completed = true;
                }
            });

        if (completed) {
            return;
        }

        // remaining

        logger('LOG|not_implemented|>');
        logger(obj);
        return;

    };

    win[$R.g] = $D.extendSafe($P, $D);

}(window, window.document));


/*******************************************************************************
**COMS
*******************************************************************************/


(function () {

    "use strict";

    var $A,
        $P = {};

    // require utility

    (function manageGlobal() {
        if (window.$A && window.$A.molist && window.$A.molist.utility) {
            $A = window.$A;
            $A.molist.comms = true;
        } else {
            throw "comms requires utility module";
        }
    }());

/******************************************************************************/

    $P.Debug = (function () {
        var publik = {},
            hold = {};
        publik.boot = function () {
            $A.boot(true);
        };
        publik.addTags = function (tag) {
            if (hold[tag]) {
                $A.someIndex(hold[tag], function (val) {
                    if (tag === 'script' || tag === 'style') {
                        document.head.appendChild(val);
                    } else {
                        document.body.appendChild(val);
                    }
                });
            }
        };
        publik.removeTags = function (tag) {
            var styles = document.getElementsByTagName(tag),
                i;
            hold[tag] = [];
            for (i = styles.length; i; i--) {
                hold[tag][i] = styles[i];
                $A.removeElement((styles[i]));
            }
        };
        publik.removeStorage = function () {
            localStorage.clear();
            sessionStorage.clear();
        };
        return publik;
    }());

/******************************************************************************/

    // a basic registry pattern with get/set and getMany/setMany

    $P.Reg = (function () {
        var publik = {},
            register = {};
        publik.get = function (key) {
            return register[key];
        };
        publik.set = function (key, value) {
            register[key] = value;
        };
        publik.setMany = function (o) {
            $A.someKey(o, function (val, key) {
                register[key] = val;
            });
        };
        publik.getMany = function () {
            return register;
        };
        return publik;
    }());

/******************************************************************************/

    // a basic event system using an internal bus

    $P.Event = (function () {
        var publik = {},
            events = {};
        publik.add = function (name, callback) {
            if (!events[name]) {
                events[name] = [];
            }
            events[name].push(callback);
        };
        publik.remove = function (name, callback) {
            if (name && callback) {
                delete events[name][callback];
            } else if (name) {
                delete events[name];
            }
        };
        publik.trigger = function (name) {
            if (events[name]) {
                $A.someIndex(events[name], function (val) {
                    val();
                });
            }
        };
        return publik;
    }());
    window.$A = $A.extendSafe($A, $P);
}());




/*******************************************************************************
**BOOTER
*******************************************************************************/




(function () {
    "use strict";
    var $A,
        $P = {},
        $R = {};

    // holds boot configuration info.

    $R.config_boot = {};

    // requires utility, comms, and dom
    // resources are loaded to the dom and their status is
    // communicated to other modules

    (function manageGlobal() {
        if (window.$A && window.$A.molist && window.$A.molist.utility &&
                window.$A.molist.comms && window.$A.molist.dom) {
            $A = window.$A;
            $A.molist.booter = true;
        } else {
            throw "booter requires utility, dom, and comms module";
        }
    }());

/******************************************************************************/

// ascii printable characters
// https://en.wikipedia.org/wiki/ASCII_Character_Set#ASCII_printable_characters
// [\x20-\x7E]

    $P.addElement = function (source) {
        var file_type = source.match(/temp/)[1],
            element;
        if (file_type === 'js') {
            element = document.createElement('script');
            // element.onload = callback;
            element.async = true;
            element.src = source;
            document.head.appendChild(element);
            return;
        }
    };

/******************************************************************************/

    // parses .txt file w/ the form "<!--|identifier_extension|-->"

    $R.addElementText = function (callback, response_text) {
        var regex,
            token_content,
            subtoken,
            subtoken_text,
            name,
            name_is_variable,
            index,
            length;
        regex = /<!--<\|([\x20-\x7E]+)(_[\x20-\x7E]+)\|>-->/g;
        token_content = response_text.split(regex);
        length = token_content.length;
        for (index = 1; index < length; index += 3) {
            subtoken = 'file_' + token_content[index] +
                    token_content[index + 1];
            subtoken_text = token_content[index + 2];
            name = token_content[index];

            // handles variable based statics

            name_is_variable = name.match(/\{([\x20-\x7E]*)\}/);
            if (name_is_variable) {
                if (name_is_variable[1] === $A.Reg.get('browser_type')) {
                    $R.addElement(subtoken, callback, subtoken_text);
                }

            // straight statics

            } else {
                $R.addElement(subtoken, callback, subtoken_text);
            }
        }
    };

/******************************************************************************/

    // dynamically adds resources to the dom
    // file token is of the form "file_identifier_extension"

    $R.addElement = function (file_token, callback, response_text, source) {
        var file_type = file_token.match(/file_[\x20-\x7E]+_([\x20-x7E]+)$/)[1],
            element;
        if (file_type === 'txt') {
            $R.addElementText(callback, response_text);
            return;
        }
        if (file_type === 'htm') {
            element = document.createElement("div");
            element.id = file_token;
            if (!source) {
                element.innerHTML = response_text;
                document.body.appendChild(element);
                if (callback) {
                    callback();
                }
                $A.Event.trigger(file_token);
            }
            return;
        }
        if (file_type === 'js') {
            element = document.createElement('script');
            element.id = file_token;
            if (!source) {
                element.innerHTML = response_text;
                document.head.appendChild(element);
                if (callback) {
                    callback();
                }
            } else {
                element.onload = callback;
                element.async = true;
                element.src = source;
                document.head.appendChild(element);
            }
            $A.Event.trigger(file_token);
            return;
        }
        if (file_type === 'css') {
            if (!source) {
                element = document.createElement('style');
                element.id = file_token;
                element.innerHTML = response_text;
                document.head.appendChild(element);
                if (callback) {
                    callback();
                }
            } else {
                element = document.createElement("link");
                element.onload = callback;
                element.id = file_token;
                element.rel = "stylesheet";
                element.type = "text/css";
                element.href = source;
                document.head.appendChild(element);
            }
            $A.Event.trigger(file_token);
            return;
        }
        if (file_type === 'ico') {
            element = document.createElement("link");
            element.onload = callback;
            element.id = file_token;
            element.rel = "icon";
            if (!source) {
                element.href = response_text;
            } else {
                element.href = source;
            }
            document.head.appendChild(element);
            $A.Event.trigger(file_token);
            return;
        }
        if (file_type === 'png') {
            element = document.getElementById(file_token);
            element.onload = callback;
            element.id = file_token;
            element.src = response_text;
            $A.Event.trigger(file_token);
            return;
        }
    };

/******************************************************************************/

    $R.parseResourceToken = function (source, callback) {
        var matches,
            prefix,
            file_token;
        matches = source.match(/^(\/\/|\/)?([\w\/\.]*)\/([\w\.]+)(\.)([\w]+)$/);
        if (matches) {
            prefix = matches[1];
            file_token = 'file_' + matches[3] + '_' + matches[5];
            source = source + '?_time=' + new Date().getTime();
        }
        if ($R.config_boot.cached) {
            $R.addElement(file_token, callback, localStorage[file_token]);
            return;
        }

        // relative to directory || relative to root

        if (prefix === undefined || prefix === '/') {

            // serialed ajax

            $A.serialAjax(source, function (response_text) {
                $R.addElement(file_token, callback, response_text);
                localStorage[file_token] = response_text;
            });
            return;
        }
        if (prefix === '//') {
            return;
        }
    };

/******************************************************************************/

    $R.checkStorage = function () {
        var kindex,
            length;

        // determine if a cached version of the static resources 

        if (localStorage.file_version && localStorage.file_version >=
                $R.config_boot.file_version) {
            $R.config_boot.cached = true;
        } else {
            localStorage.file_version = $R.config_boot.file_version;
            $R.config_boot.cached = false;
        }
        for (kindex = 0, length = $R.config_boot.resources.length;
                kindex < length; kindex += 1) {
            $R.parseResourceToken($R.config_boot.resources[kindex], null);
        }

    };

/******************************************************************************/

    $P.validate = function (obj) {
        var name = 'unknown',
            browser_version = 'unknown',
            element,
            temp;
        $A.Reg.set('browser_type', null);
        $A.Reg.set('browser_validated', null);

        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
            $A.Reg.set('browser_type', 'ie');
            name = 'Internet Explorer';
            browser_version = parseFloat(RegExp.$1);
            if (browser_version >= obj.In) {
                $A.Reg.set('browser_validated', true);
                return;
            }
        } else if (/Chrome[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
            $A.Reg.set('browser_type', 'ch');
            name = 'Chrome';
            browser_version = parseFloat(RegExp.$1);
            if (browser_version >= obj.Ch) {
                $A.Reg.set('browser_validated', true);
                return;
            }
        } else if (/Safari/.test(navigator.userAgent)) {
            $A.Reg.set('browser_type', 'sa');
            /Version[\/\s](\d+\.\d+)/.test(navigator.userAgent);
            name = 'Safari';
            browser_version = parseFloat(RegExp.$1);
            if (browser_version >= obj.Sa) {
                $A.Reg.set('browser_validated', true);
                return;
            }
        } else if (navigator.userAgent.match(/Firefox[\/\s](\d+\.\d+)/)) {
            $A.Reg.set('browser_type', 'ff');
            temp = navigator.userAgent.match(/Firefox[\/\s](\d+\.\d+)/);
            name = 'Firefox';
            browser_version = parseFloat(temp[1]);
            if (browser_version >= obj.Fi) {
                $A.Reg.set('browser_validated', true);
                return;
            }
        }
        if (!name) {
            name = 'X';
        }
        if (!browser_version) {
            browser_version = 'y';
        }
        element = document.getElementById('browser_validation');
        element.innerHTML += " You are running " + name +
            " " + browser_version + ".";
        element.style.display = 'block';

        $A.Reg.set('browser_validated', false);
        $A.Reg.set('browser_element', element);

    };

    $P.config = function (func) {
        $R.config_boot.func = func;
    };

    $P.setResources = function (obj) {
        $R.config_boot = $A.extend($R.config_boot, obj);
    };

    // validate, configure, check storage

    $P.boot = function (skip_validation) {
        var validated = $A.Reg.get('browser_validated');
        if (!skip_validation && !validated) {
            return;
        }
        if (!validated) {
            var element = $A.Reg.get('browser_element');
            element.style.display = 'none';
        }
        if ($R.config_boot.func) {
            $R.config_boot.func();
        }
        $R.checkStorage();
    };

    window.$A = $A.extendSafe($A, $P);

}());


/*******************************************************************************
**FRAME
*******************************************************************************/


(function () {

    "use strict";

    var $A,
        $P = {},
        $R = {};

    $P.last = {};
    $R.Parsel = {};
    $R.pipe_hold = {};

/******************************************************************************/

    (function manageGlobal() {
        if (window.$A && window.$A.molist && window.$A.molist.utility &&
                window.$A.molist.comms) {
            $A = window.$A;
            $A.molist.frame = true;
        } else {
            throw "frame requires utility and comms module";
        }
    }());

/******************************************************************************/

    // used to time performance

    var time = (function () {
        var measurements = [];
        return function (control) {
            var index,
                intervals = [],
                time_current = new Date().getTime();
            if (control === 'start') {
                measurements = [];
                measurements.push(time_current);
                return;
            }
            if (control !== 'finish') {
                measurements.push(time_current);
                return;
            }
            if (control === 'finish') {
                measurements.push(time_current);
                index = measurements.length;
                while (index) {
                    index -= 1;
                    intervals[index - 1] = (measurements[index] -
                            measurements[index - 1]) + 'ms';
                }
                return intervals;
            }
        };
    }());

    // get dom elements for each module

    $P.getDomElements = function (el_hold) {
        var list;

        // iterate through each module

        $A.someKey($R.Parsel, function (val) {
            list = val[el_hold];
            if (list) {

                // iterate through each module's el_hold properties

                $A.someKey(list, function (val, key) {

                    // replace the id w/ an element reference

                    list[key] = $A.el(val);
                });
            }
        });
    };

    // get library elements for each module

    $P.getLibElements = function (lib_hold, lib_global) {
        var list;

        // iterate through each module

        $A.someKey($R.Parsel, function (val) {
            list = val[lib_hold];
            if (list) {

                // iterate through the module property's properties

                $A.someKey(list, function (val, key) {
                    list[key] = lib_global(val);
                });
            }
        });
    };

    // intialize each module by property

    $P.initByProperty = function (prop) {

        // iterate through each module

        $A.someKey($R.Parsel, function (val) {

            // if the property exists execute it

            if (val[prop]) {
                val[prop]();
            }
        });
    };

    $P.list = function () {
        $A.log($R.Parsel);
    };

    $P.support = $P.parsel = function (obj, config_module) {
        $R.Parsel[obj.Name] = obj;

        // all properties are private

        if (!config_module) {
            return undefined;
        }

        // all properties are public

        if (config_module === true) {
            return obj;
        }

        // constructor based, all properties are publik

        if (config_module === 'constructor') {
            var object_public;
            if (obj.constructor) {
                object_public = obj.constructor;
                delete obj.constructor;
            }
            $A.someKey(obj, function (val, key) {
                if (/^s_/.test(key)) {
                    object_public[key] = val;
                } else if (/^p_/.test(key)) {
                    object_public.prototype[key] = val;
                } else {
                    object_public.prototype[key] = val;
                }

            });
            return object_public;
        }
    };

/******************************************************************************/

    // automates ajax using pre() and post()

    $P.machine = function (obj) {
        var pipe = $A.makePipe(obj),
            data_send,
            ajax_type,
            wait_animation = document.getElementById('wait_animation');
        if ($R.Parsel[pipe.model] && $R.Parsel[pipe.model].hasOwnProperty("pre")) {
            time('start');
            pipe = $R.Parsel[pipe.model].pre(pipe);
            time('middle');
            $A.Reg.set('pipe_pre', pipe);
        } else {
            return;
        }
        if (pipe.state === true) {
            if (pipe.form_data) {
                var form_data = pipe.form_data;
                ajax_type = 'multi';
                delete pipe.form_data;
                form_data.append("pipe", JSON.stringify(pipe));
                data_send = form_data;
            } else {
                ajax_type = 'post';
                data_send = 'pipe=' + encodeURIComponent(JSON.stringify(pipe));
            }
            if (wait_animation) {
                wait_animation.style.opacity = 1;
            }
            $A.ajax({
                type:     ajax_type,
                url:      $A.Reg.get('path') + $A.Reg.get('path_ajax'),
                data:     data_send,
                callback: function (pipe_string_receive) {
                    var pass_prefix = pipe_string_receive.slice(0, 3),
                        times;
                    if (wait_animation) {
                        wait_animation.style.opacity = 0;
                    }
                    if (pass_prefix === '|D|') {
                        //http://jsfiddle.net/Ke9CK/
                        //http://stackoverflow.com/questions/1068280/javascript-regex-multiline-flag-doesnt-work
                        var message = pipe_string_receive.match(/^(\|D\|)([\s\S]*)(\|A\|)/);
                        $A.log('|D|');
                        $A.log(message[2]);
                        pipe_string_receive = pipe_string_receive.slice((message[1] + message[2]).length);
                        pass_prefix = pipe_string_receive.slice(0, 3);
                    }
                    if (pass_prefix === '|A|') {
                        time('middle');
                        pipe = JSON.parse(pipe_string_receive.slice(3));
                        if ($R.Parsel[pipe.model].hasOwnProperty("post")) {
                            pipe = $R.Parsel[pipe.model].post(pipe);
                            times = time('finish');
                            pipe.time.pre = times[0];
                            pipe.time.transit = times[1];
                            pipe.time.post = times[2];
                            $A.Reg.set('pipe_post', pipe);
                        } else {
                            return;
                        }
                    } else {
                        throw "<No 'A' or 'D'>" + pipe_string_receive;
                    }
                }
            });
        }
    };

    // holds the pipe definition

    $P.definePipe = function (obj) {
        $R.pipe_hold = obj;
    };

    // clones the pipe definition and extend any additional properties

    $P.makePipe = function (obj) {
        return $A.extend($A.clone($R.pipe_hold), obj);
    };

    $A = $A.extendSafe($A, $P);

}());


/*******************************************************************************
**ALGORITHMS
*******************************************************************************/


(function () {


    "use strict";

    var $A,
        $P = {};

    (function manageGlobal() {
        if (window.$A && window.$A.molist) {
            $A = window.$A;
            $A.molist.algo = true;
        }
    }());

    $P.swap = function (arr, i, j) {
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    };

    // repeatedly orders two items ( a bubble ) at a time

    $P.bubbleSort = function (arr) {
        var index_outer,
            index_inner,
            swapped = false,
            length = arr.length;
        for (index_outer = 0; index_outer < length; index_outer++) {
            swapped = false;
            for (index_inner = 0; index_inner < length - index_outer; index_inner++) {
                if (arr[index_inner] > arr[index_inner + 1]) {
                    $P.swap(arr, index_inner, index_inner + 1);
                    swapped = true;
                }
            }
            if (swapped === false) {
                break;
            }
        }
        return arr;
    };

    // repeatedly finds minimum and places it the next index

    $P.selectionSort = function (arr) {
        var index_outer,
            index_inner,
            index_min,
            length = arr.length;
        for (index_outer = 0; index_outer < length; index_outer++) {
            index_min = index_outer;
            for (index_inner = index_outer + 1; index_inner < length; index_inner++) {
                if (arr[index_inner] < arr[index_min]) {
                    index_min = index_inner;
                }
            }
            if (index_outer !== index_min) {
                $P.swap(arr, index_outer, index_min);
            }
        }
        return arr;
    };

    // repeatedly places next item in correct spot using a "shift"

    $P.insertionSort = function (arr) {
        var index_outer,
            index_inner,
            value,
            length = arr.length;
        for (index_outer = 0; index_outer < length; index_outer++) {
            value = arr[index_outer];
            for (index_inner = index_outer - 1; (index_inner >= 0 && (arr[index_inner] > value));
                    index_inner--) {
                arr[index_inner + 1] = arr[index_inner];
            }
            arr[index_inner + 1] = value;
        }
        return arr;
    };

    // module complete, release to outer scope

    $A = $A.extendSafe($A, $P);

}());
