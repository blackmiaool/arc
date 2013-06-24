/*******************************************************************************

Arc ( consolidates 6 library types )

 - 80 character maximum width
 - file passes jslint with options below
 - file correctly minifies using google closure w/ default settings
 - consolidates 6 library types - utility, dom, comms, booter, frame, 
   and algorithms ( academic ) into a single library, which decreases 
   code redundancy and outside dependencies
 - Uses single global
 - safe extending of the global

Utility ( compare to underscore.js )

 - additional coverage including isObjectAbstract and isArrayAbstract
 - provides consistent naming convention for type checking
 - increased speed for looping idioms ( tested and eliminated native call )
 - positive asserting conditionals for increased efficiency ( "drop-throughs" )

Dom ( compare to jquery.js )

 - integration w/ utilities for cleaner code
 - readable code w/ limited dependencies and function branches
 - consistent style
 - encapsulation, i.e. real privacy when relevant

Comms ( Compare to backbone.js)

 - provides registry and event system to facilitate communications
 - reduces dependencies and "sub-globals"

Booter ( compare to head.js)

 - serialized ajax guarantees ordering of resources /w out halting page
 - completely dynamic file loads
 - text blob allows consolidating static data into single request
 - revision control eliminates redundant downloads
 - browser detection for targeted CSS = eliminates incorrect CSS delivery
 - browser detection to eliminate older browsers and require upgrade

Frame ( compare to backbone.js  )

 - integrated ajax framework to eliminate redundant ajax code
 - consolidated model system for a single point of troubleshooting
   that takes advantage of JavaScripts dynamic objects

Algorithms ( compare to nczonline.net )

 - provided for academic reasons only
 - native implementations are likely faster

*******************************************************************************/




/*global
    $A: true,
    $: true
*/




/*jslint
    ass: true
    browser: true,
    vars: true,
    forin: true,
    plusplus: true
*/




/*******************************************************************************
**utility
*******************************************************************************/




(function (self, undef) {

    "use strict";

        // not used, for consistency

    var $A = {},

        // public, will copy reference to window scope

        $P = {},

        // shortcuts to native implementations

        isArrayNative = Array.isArray,
        toString = Object.prototype.toString,
        slice = Array.prototype.slice;

    (function manageGlobal() {
        $P.previous = self.$A;

        // add utility and beging the module load list

        $P.molist = {
            utility: true
        };
    }());

    $P.noConflict = function() {
        self.$A = $P.previous;
        return self;
    };

/******************************************************************************/

    // !! is a boolean cast, && does not return a boolean

    $P.isElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };

/******************************************************************************/

    // GENERIC TYPE CHECKS

    // multi-window, slow

    $P.isType = function (type, obj) {
        return $P.getType(obj) === type;
    };

    $P.getType = function (obj) {
        return toString.call(obj).slice(8, -1);
    };

    // single window, fast

    $P.isTypeFast = function (type, obj) {
        return $P.getTypeFast(obj) === type;
    };

    $P.getTypeFast = function (obj) {
        if (obj.constructor) {
            return obj.constructor.name;
        }
    };

    // ARRAY TYPE CHECKS

    $P.isArray = isArrayNative || function (obj) {
        return toString.call(obj) === '[object Array]';
    };

    // + casts to a numeric type

    $P.isArrayAbstract = function (obj) {
        return obj.length === +obj.length;
    };

    // OBJECT TYPE CHECKS

    // {}.constructor(obj) = Object(obj)

    $P.isObjectAbstract = function (obj) {
        return obj === {}.constructor(obj);
    };

    // SPECEFIC TYPE CHECKS

    // handles `boxed` booleans as well

    $P.isBoolean = function (obj) {
        return obj === true || obj === false ||
            toString.call(obj) === '[object Boolean]';
    };

    $P.isUndefined = function (obj) {
        return obj === undef;
    };

    $P.isNull = function (obj) {
        return obj === null;
    };

/******************************************************************************/

    // LOOPING

    $P.eachKey = function(obj, func, context) {
        var kindex,
            result;
        for (kindex in obj) {
            if (obj.hasOwnProperty(kindex)) {
                result = func.call(context, obj[kindex], kindex, obj);
                if (result) {
                    return result;
                }
            }
        }
    };

    $P.eachIndex = function(obj, func, context) {
        var kindex,
            length,
            result;
        for (kindex = 0, length = obj.length; kindex < length; kindex += 1) {
            result = func.call(context, obj[kindex], kindex, obj);
            if (result) {
                return result;
            }
        }
    };

    // non looping types pass through

    $P.each = function (obj, func, context) {
        if ($P.isArrayAbstract(obj)) {
            $P.eachIndex(obj, func, context);
            return;
        }
        if ($P.isObjectAbstract(obj)) {
            $P.eachKey(obj, func, context);
        }
    };

/******************************************************************************/

    // build 'is' functions

    $P.eachIndex(['Arguments', 'Function', 'String', 'Number',
            'Date', 'RegExp', 'Object'], function(name) {
        $P['is' + name] = function(obj) {
            return $P.isType(name, obj);
        };
    });

/******************************************************************************/

    // extend

    $P.extend = function(obj) {
        $P.eachIndex(slice.call(arguments, 1), function(source) {
            var key;
            if (source) {
                for (key in source) {
                    obj[key] = source[key];
                }
            }
        });
        return obj;
    };

    // over-writing a key will throw an error w/ extendSafe

    $P.extendSafe = function (o1, o2) {
        var key;
        for (key in o2) {
            if (o2.hasOwnProperty(key) && o1.hasOwnProperty(key)) {
                throw "naming collision: " + key;
            }
            o1[key] = o2[key];
        }
        return o1;
    };

    // clone is just extend applied to an object literal

    $P.clone = function(obj) {
        return $P.extend({}, obj);
    };

    // ported from underscore

    $P.once = function(func) {
        var saved = false,
            memory;
        return function() {
            if (saved) {
                return memory;
            }
            memory = func.apply(this, arguments);
            saved = true;
            return memory;
        };
    };

    // ported from underscore

    $P.uniqueId = (function () {
        var id_counter = 0;
        return function(prefix) {
            var id = String(++id_counter);
            return prefix ? prefix + id : id;
        };
    }());

    // module complete

    self.$A = $P.extendSafe($P, $A);

}(this));




/*******************************************************************************
**dom
*******************************************************************************/




(function (win, doc, undef) {

    "use strict";

    var $A,
        $R = {},
        $P = function (selector) {
            return new $R.Constructor(selector);
        };

    (function manageGlobal() {

        // requires utility

        if (win.$A && window.$A.molist && win.$A.molist.utility) {
            $A = window.$A;
            $A.molist.dom = true;
        } else {
            throw "dom requires utility Module";
        }
    }());

    $R.Constructor = function (selector) {
        var type,
            type1,
            type2,
            temp,
            obj_type;

        // window object detected, single window apps only

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

        if ($A.isElement(selector)) {
            this[0] = selector;
            return this;
        }

        // only strings should be left

        if (selector) {
            obj_type = $A.getType(selector);
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
            $A.eachIndex(temp, function(val, index) {
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
            $A.eachIndex(temp, function(val, index) {
                this[index] = val;
            }, this);
            return this;
        }
    };

/******************************************************************************/

    $R.Constructor.prototype.fade = function (direction, max_time, callback) {
        var statics = {},
            self = this;
        statics.elapsed = 0;
        statics.GRANULARITY = 10;
        if (statics.timeout_id) {
            win.clearInterval(statics.timeout_id);
        }
        (function next() {
            var opacity;
            statics.elapsed += statics.GRANULARITY;
            if (!statics.timeout_id) {
                statics.timeout_id = win.setInterval(next, statics.GRANULARITY);
            }
            if (direction === 'up') {
                $A.eachKey(self, function (val) {
                    opacity = statics.elapsed / max_time;
                    val.style.opacity = opacity;
                });

            } else if (direction === 'down') {
                $A.eachKey(self, function (val) {
                    val.style.opacity = (max_time - statics.elapsed) / max_time;
                });
            }
            if (statics.elapsed >= max_time) {
                if (callback) {
                    callback();
                }
                win.clearInterval(statics.timeout_id);
            }
        }());
    };

/******************************************************************************/

    $R.functionNull = function () {
        return undefined;
    };

/******************************************************************************/

    // createEvent

    // "click" is one type of HTMLEvents

    $R.createEvent = function () {
        if (doc.createEvent) {
            return function (type) {
                var event = doc.createEvent("HTMLEvents");
                event.initEvent(type, true, false);
                $A.eachKey(this, function (val) {
                    val.dispatchEvent(event);
                });
            };
        }
        if (doc.createEventObject) {
            return function (type) {
                var event = doc.createEventObject();
                event.eventType = type;
                $A.eachKey(this, function (val) {
                    val.fireEvent('on' + type, event);
                });
            };
        }
        return $R.functionNull;
    };

    // two styles of calling

    $R.Constructor.prototype.createEvent = function (type) {
        return $R.createEvent.call(this, type);
    };

    $P.createEvent = (function () {
        return function (element, type) {
            var temp = [];
            temp[0] = element;
            $R.createEvent.call(temp, type);
        };
    }());

/******************************************************************************/

    // addEvent

    $R.addEvent = (function () {
        if (win.addEventListener) {
            return function (type, callback) {
                $A.eachKey(this, function (val) {
                    val.addEventListener(type, callback);
                });
            };
        }
        if (win.attachEvent) {
            return function (type, callback) {
                $A.eachKey(this, function (val) {
                    val.attachEvent('on' + type, callback);
                });
            };
        }
        return $R.functionNull;
    }());

    // two styles of calling

    $R.Constructor.prototype.addEvent = function (type, callback) {
        return $R.addEvent.call(this, type, callback);
    };

    $P.addEvent = (function () {
        return function (element, type, callback) {
            var temp = [];
            temp[0] = element;
            $R.addEvent.call(temp, type, callback);
        };
    }());

/******************************************************************************/

    // removeEvent

    $R.Constructor.prototype.removeEvent = (function () {
        if (win.removeEventListener) {
            return function (type, callback) {
                $A.eachKey(this, function (val) {
                    val.removeEventListener(type, callback);
                });
            };
        }
        if (win.detachEvent) {
            return function (type, callback) {
                $A.eachKey(this, function (val) {
                    val.detachEvent('on' + type, callback);
                });
            };
        }
        return $R.functionNull;
    }());

    // two styles of calling

    $R.Constructor.prototype.removeEvent = function (type, callback) {
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

    // clean version of undefined

    $P.undef = undef;

/******************************************************************************/

    // methods

    $P.getComputedStyle = function (arg1, arg2) {
        return win.getComputedStyle(arg1, arg2);
    };

    $P.clearTimeout = function (arg1) {
        return win.clearTimeout(arg1);
    };

    $P.setTimeout = function (arg1, arg2) {
        return win.setTimeout(arg1, arg2);
    };

    $P.createDocumentFragment = function () {
        return doc.createDocumentFragment();
    };

    $P.createElement = function (arg1) {
        return doc.createElement(arg1);
    };

    $P.setInterval = function (arg1, arg2) {
        return win.setInterval(arg1, arg2);
    };

    $P.clearInterval = function (arg1) {
        return win.clearInterval(arg1);
    };

    // objects

    $P.indexedDB = win.indexedDB || win.mozIndexedDB || win.webKitIndexedDB;

    $P.FormData = win.FormData;

    $P.FileReader = win.FileReader;

    $P.localStorage = localStorage;

    $P.sessionStorage = sessionStorage;

/******************************************************************************/

    // new types

    $P.FormClass = (function () {
        var publik = function (form_data) {
            this.form_hold = form_data;
            this.form = new win.FormData();
            $A.eachKey(form_data, function (val, key) {
                this.form.append(key, val);
            });
            return this;
        };
        publik.prototype.getFormData = function () {
            return this.form_data;
        };
        publik.prototype.getForm = function () {
            return this.form;
        };
        return publik;
    }());

/******************************************************************************/

    // new methods

    $P.el = function (selector) {
        var type = selector.match(/^(@|#|\.)([\x20-\x7E]+)$/),
            type1 = type[1],
            type2 = type[2];
        if (!type) {
            return;
        }
        if (type1 === '#') {
            return doc.getElementById(type2);
        }
        if (type1 === '.' && doc.getElementsByClassName) {
            return doc.getElementsByClassName(type2);
        }
        if (type1 === '@') {
            return doc.getElementsByName(type2);
        }
    };

    // class is a future reserved word

    $P.klass = function (klass) {
        return doc.getElementsByClassName(klass.slice(1));
    };

    $P.id = function (id) {
        return doc.getElementById(id.slice(1));
    };

    // name is read only, used names

    $P.names = function (name) {
        return doc.getElementsByName(name.slice(1));
    };

    $P.removeElement = function (element) {
        element.parentNode.removeChild(element);
    };

    $P.ajax = function (config_ajax) {
        var xhr;

        // get

        if (config_ajax.type === 'get') {
            xhr = new win.XMLHttpRequest();
            xhr.open('GET', config_ajax.url, true);
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        config_ajax.callback(xhr.responseText);
                    }
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
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        config_ajax.callback(xhr.responseText);
                    }
                }
            };
            xhr.send(config_ajax.data);
        }

        // handles FormData

        if (config_ajax.type === 'multi') {
            xhr = new win.XMLHttpRequest();
            xhr.open("POST", config_ajax.url, true);
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        config_ajax.callback(xhr.responseText);
                    }
                }
            };
            xhr.send(config_ajax.data);
        }

    };


/******************************************************************************/

    //Queue

    $R.Queue = (function () {
        var queue = [],
            publik = {};
        function getIndexFromToken(callback) {
            var hold;
            $A.eachIndex(queue, function(val, index) {
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

        // an item can not be blocked until its request has completed

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

            // if not item 0 , the item is blocked, as items before it
            // have not completed, save response_text

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

    $P.getData = function getData(id) {
        var data,
            obj,
            el;
        el = document.getElementById(id);
        obj = {};

        if (el.dataset) {
            $A.eachKey(el.dataset, function(val, key) {
                obj[key] = val;
            });
        } else {
            data = [].filter.call(el.attributes, function(at) {
                return (/^data-/).test(at.name);
            });
            $A.eachIndex(data, function(val, i) {
                obj[data[i].name.slice(5)] = val.value;
            });
        }
        return obj;
    };

/******************************************************************************/

    // log

    $P.log = function (obj) {
        var logger,
            type,
            temp,
            completed;

        // wrap win.console to protect from IE bug

        if (win.console) {
            logger = win.console.log.bind(win.console);
        } else {
            return;
        }

        // get and validate type of obj

        type = $A.getType(obj);
        if (!type) {
            logger("Object did not stringify");
            return;
        }

/******************************************************************************/

        // browser objects, just a place holder

        if (type === 'Event') {
            logger('LOG|host object|>');
            logger(obj);
            return;
        }

/******************************************************************************/

        // library objects

        if (win.jQuery && (obj instanceof win.jQuery)) {
            logger('LOG|jQuery object|>');
            logger(obj);
            return;
        }

/******************************************************************************/

        // language objects

        $A.eachIndex(['Arguments', 'Array', 'Object'], function(val) {
            if (type === val) {
                try {
                    temp = JSON.stringify(obj, null, 1);
                } catch (e) {
                    temp = false;
                }
                if (temp) {
                    logger('LOG|Language Object|>');
                    logger("LOG|" + val + "|> " + temp);
                } else {
                    logger('LOG|Language Object|>');
                    logger("LOG|" + val + "|> " + obj);
                }
                completed = true;
            }
        });

        if (completed) {
            return;
        }

        $A.eachIndex(['Boolean', 'Date', 'Error', 'Function', 'JSON', 'Math',
            'Number', 'Null', 'RegExp', 'String', 'Undefined'],
            function(val) {
                if (type === val) {
                    logger('LOG|Language Object|>');
                    logger(obj);
                    completed = true;
                }
            });

        if (completed) {
            return;
        }

        // catch remaining

        logger('LOG|Not Implmented|>');
        logger(obj);
        return;

    };

    win.$A = $A.extendSafe($P, $A);

}(window, window.document));





/*******************************************************************************
**comms
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
            $A.eachKey(o, function(val, key) {
                register[key] = val;
            });
        };
        publik.getMany = function () {
            return register;
        };
        return publik;
    }());

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
                $A.eachIndex(events[name], function(val) {
                    val();
                });
            }
        };
        return publik;
    }());

    window.$A = $A.extendSafe($A, $P);

}());




/*******************************************************************************
**booter
*******************************************************************************/



(function () {

    "use strict";

    var $A,
        $P = {},
        $R = {};

    $R.config_boot = {};

    // requires utility, comms, and dom

    (function manageGlobal() {
        if (window.$A && window.$A.molist && window.$A.molist.utility &&
                window.$A.molist.comms && window.$A.molist.dom) {
            $A = window.$A;
            $A.molist.booter = true;
        } else {
            throw "booter requires utility, dom, and comms module";
        }
    }());

    // parses a special text file used to consolidate 
    // static resources to a .txt file
    // text file has delimeters of the form "<!--|identifier_extension|-->"

/******************************************************************************/

    $R.addElementText = function (callback, response_text) {

        // parsing variables

        var regex,
            token_content,
            subtoken,
            subtoken_text,
            name,
            name_is_variable,

        // looping variables

            index,
            length;

        // broken up to shorten lines and make readable

        // note use of asci for token identifier

        regex = /<!--<\|([\x20-\x7E]+)(_[\x20-\x7E]+)\|>-->/g;

        token_content = response_text.split(regex);

        length = token_content.length;

        for (index = 1; index < length; index += 3) {

            // holds the token found in the super token

            subtoken = 'file_' + token_content[index] +
                    token_content[index + 1];

            // holds the content found in the subtoken

            subtoken_text = token_content[index + 2];

            // holds the name

            name = token_content[index];

            // checks to see if the name is a variable

            name_is_variable = name.match(/\{([\x20-\x7E]*)\}/);

            if (name_is_variable) {
                if (name_is_variable[1] === $A.Reg.get('browser_type')) {
                    $R.addElement(subtoken, callback, subtoken_text);
                }

            // non-variable based

            } else {
                $R.addElement(subtoken, callback, subtoken_text);
            }
        }
    };

    // dynamically adds resources to the dom
    // file token is of the form "file_identifier_extension"

/******************************************************************************/

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

    // parses the input to boot()
    // accepts "//", "/" and "" prefixes for urls

    $R.parseToken = function (source, callback) {
        var matches,
            prefix,
            file_token;
        matches = source.match(/^(\/\/|\/)?([\w\/\.]*)\/([\w\.]+)(\.)([\w]+)$/);
        if (matches) {
            prefix = matches[1];
            file_token = 'file_' + matches[3] + '_' + matches[5];
            source = source + '?_time=' + new Date().getTime();
        }

        // already cached, do not ajax in

        if ($R.config_boot.cached) {
            $R.addElement(file_token, callback, localStorage[file_token]);
            return;
        }

        // no prefix or forward slash

        // relative to directory || relative to root

        if (prefix === undefined || prefix === '/') {

            // serialed ajax

            $A.serialAjax(source, function (response_text) {

                // add the resource to the dom

                $R.addElement(file_token, callback, response_text);

                // save it in localStorage for later use

                localStorage[file_token] = response_text;

            });

            return;
        }

        // double forward slash, not implemented

        if (prefix === '//') {
            return;
        }
    };

/******************************************************************************/

    // manages version using localStorage
    // simple serial loading of resources
    // check version number to see if cache is available, then load

    $R.updateAndLoad = function () {
        var kindex,
            length;

        // determine if a cached version of the static resources 

        if (localStorage.file_version && localStorage.file_version >=
                $R.config_boot.version) {
            $R.config_boot.cached = true;
        } else {
            localStorage.file_version = $R.config_boot.version;
            $R.config_boot.cached = false;
        }
        for (kindex = 0, length = $R.config_boot.resources.length;
                kindex < length; kindex += 1) {
            $R.parseToken($R.config_boot.resources[kindex], null);
        }

    };

    // validate browser using version number

    $P.validate = function (obj) {
        var name = 'unknown',
            version = 'unknown',
            element,
            temp;
        $A.Reg.set('browser_type', null);
        $A.Reg.set('browser_validated', null);

        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
            $A.Reg.set('browser_type', 'ie');
            name = 'Internet Explorer';
            version = parseFloat(RegExp.$1);
            if (version >= obj.In) {
                $A.Reg.set('browser_validated', true);
                return;
            }
        } else if (/Chrome[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
            $A.Reg.set('browser_type', 'ch');
            name = 'Chrome';
            version = parseFloat(RegExp.$1);
            if (version >= obj.Ch) {
                $A.Reg.set('browser_validated', true);
                return;
            }
        } else if (/Safari/.test(navigator.userAgent)) {
            $A.Reg.set('browser_type', 'sa');
            /Version[\/\s](\d+\.\d+)/.test(navigator.userAgent);
            name = 'Safari';
            version = parseFloat(RegExp.$1);
            if (version >= obj.Sa) {
                $A.Reg.set('browser_validated', true);
                return;
            }
        } else if (navigator.userAgent.match(/Firefox[\/\s](\d+\.\d+)/)) {
            $A.Reg.set('browser_type', 'ff');
            temp = navigator.userAgent.match(/Firefox[\/\s](\d+\.\d+)/);
            name = 'Firefox';
            version = parseFloat(temp[1]);
            if (version >= obj.Fi) {
                $A.Reg.set('browser_validated', true);
                return;
            }
        }

        element = document.getElementById('browser_validation');
        element.innerHTML += " You are running " + name + " " + version + ".";
        element.style.display = 'block';

        $A.Reg.set('browser_validated', false);
        $A.Reg.set('browser_element', element);

    };

    // configure the framework, mostly paths

    $P.config = function (func) {
        $R.config_boot.func = func;
    };

    // set resources

    $P.setResources = function (obj) {
        $R.config_boot = $A.extend($R.config_boot, obj);
    };

    $P.boot = function (skip) {

        var val = $A.Reg.get('browser_validated');

        if (!skip && !val) {
            return;
        }

        if (!val) {
            var element = $A.Reg.get('browser_element');
            element.style.display = 'none';
        }

        // run the configuration function

        if ($R.config_boot.func) {
            $R.config_boot.func();
        }

        // boot the application

        $R.updateAndLoad();
    };

    window.$A = $A.extendSafe($A, $P);

}());


/*******************************************************************************
**frame
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

    $P.getElements = function (prop) {
        var list;

        // iterate through each module

        $A.eachKey($R.Parsel, function(val) {
            list = val[prop];
            if (list) {

                // iterate through the module property's properties

                $A.eachKey(list, function (val, key) {

                    // replace the id w/ the element reference

                    list[key] = $A.id(val);
                });
            }
        });
    };

    // get library elements for each module

    $P.getLibElements = function (prop, lib) {
        var list;

        // iterate through each module

        $A.eachKey($R.Parsel, function(val) {
            list = val[prop];
            if (list) {

                // iterate through the module property's properties

                $A.eachKey(list, function (val, key) {
                    list[key] = lib(val);
                });
            }
        });
    };

    // intialize each module by property

    $P.initByProperty = function (prop) {

        // iterate through each module

        $A.eachKey($R.Parsel, function(val) {

            // if the property exists execute it

            if (val[prop]) {
                val[prop]();
            }
        });
    };

    $P.list = function () {
        $A.log($R.Parsel);
    };

    $P.support = $P.parsel = function (o, config_module) {
        var object_public;

        $R.Parsel[o.Name] = o;

        // all properties are private, i.e. nothing is returned

        if (!config_module) {
            return;
        }

        // all properties are public

        if (config_module === true) {
            return o;
        }

        // constructor based, all properties are publik
        // static support available via "s_"
        // private support available via "p_"

        if (config_module === 'constructor') {

/******************************************************************************/

            // add the constructor and then delete the temporary copy

            if (o.constructor) {
                object_public = o.constructor;
                delete o.constructor;
            }

            // loop through all remaining properties

            $A.eachKey(o, function(val, key) {

                if (/^s_/.test(key)) {

                    // s_ denotes a static property

                    object_public[key] = val;

                } else if (/^p_/.test(key)) {

                    // privacy not implemented yet

                    object_public.prototype[key] = val;

                } else {

                    // prototyped

                    object_public.prototype[key] = val;
                }

            });
            return object_public;
        }
    };

/******************************************************************************/

    // machine automates ajax using pre() and post()

    $P.machine = function (obj) {
        var pipe,
            data_send,
            ajax_type,
            wait_animation,
            set;
        wait_animation = document.getElementById('wait_animation');
        set = false;
        pipe = $A.makePipe(obj);
        if ($R.Parsel[pipe.model] === undefined) {
            return;
        }
        time('start');
        if ($R.Parsel[pipe.model].hasOwnProperty("pre")) {
            pipe = $R.Parsel[pipe.model].pre(pipe);
        } else {
            return;
        }
        if (pipe.form_data) {
            ajax_type = 'multi';
            var form_data = pipe.form_data;
            delete pipe.form_data;
            form_data.append("pipe", JSON.stringify(pipe));
            data_send = form_data;
        } else {
            ajax_type = 'post';
            data_send = 'pipe=' + encodeURIComponent(JSON.stringify(pipe));
        }
        if (pipe.state === true) {
            time('middle');
            if (wait_animation) {
                set = true;
                wait_animation.style.opacity = 1;
            }
            $A.ajax({
                type:     ajax_type,
                url:      $A.Reg.get('path') + $A.Reg.get('path_ajax'),
                data:     data_send,
                callback: function (pipe_string_receive) {
                    var pass_prefix = pipe_string_receive.slice(0, 3),
                        times;
                    if (wait_animation && set) {
                        wait_animation.style.opacity = 0;
                    }
                    if (pass_prefix === '|D|') {
                        $A.log('|DEBUG| ' + pipe_string_receive.slice(3));
                    } else if (pass_prefix === '|A|') {
                        time('middle');
                        pipe = JSON.parse(pipe_string_receive.slice(3));
                        if ($R.Parsel[pipe.model].hasOwnProperty("post")) {
                            pipe = $R.Parsel[pipe.model].post(pipe);
                            times = time('finish');
                            pipe.time.pre = times[0];
                            pipe.time.transit = times[1];
                            pipe.time.post = times[2];
                            $P.Debug.setPipe(pipe);
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

    // holds the last pipe for debug

    $P.Debug = (function () {

        var hold = {},
            publik = {};

        publik.boot = function () {
            $A.boot(true);
        };

        publik.nuke = function () {
            localStorage.clear();
            sessionStorage.clear();
        };

        publik.setPipe = function (pipe) {
            hold = pipe;
        };

        publik.getPipe = function () {
            $A.log(hold);
        };

        return publik;
    }());

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
**algorithms
*******************************************************************************/


(function () {


    "use strict";

    var $A,
        $P = {};

    (function manageGlobal() {
        if (window.$A && window.$A.molist && window.$A.molist.utility) {
            $A = window.$A;
            $A.molist.frame = true;
        } else {
            throw "frame requires utility and booter module";
        }
    }());

    $P.swap = function (arr, i, j) {
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    };

    $P.bubbleSort = function (arr) {
        var i,
            j,
            length = arr.length,
            swapped;
        for (i = 0; i < length; i++) {
            swapped = false;
            for (j = 0; j < length - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    $P.swap(arr, j, j + 1);
                    swapped = true;
                }
            }
            if (!swapped) {
                break;
            }
        }
        return arr;
    };

    $P.selectionSort = function (arr) {
        var i,
            j,
            len = arr.length,
            min;
        for (i = 0; i < len; i++) {
            min = i;
            for (j = i + 1; j < len; j++) {
                if (arr[j] < arr[min]) {
                    min = j;
                }
            }
            if (i !== min) {
                $P.swap(arr, i, min);
            }
        }
        return arr;
    };


    $P.insertionSort = function (arr) {
        var len = arr.length,
            value,
            i,
            j;
        for (i = 0; i < len; i++) {

            // cache current element

            value = arr[i];
            for (j = i - 1; (j > -1 && (arr[j] > value)); j--) {

                // shift the array by copying one over

                arr[j + 1] = arr[j];
            }

            // insert the check value after shift

            arr[j + 1] = value;
        }
        return arr;
    };

    // module complete, release to outer scope

    $A = $A.extendSafe($A, $P);

}());
