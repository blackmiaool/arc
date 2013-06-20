/***************************************************************************************************
**
**file contains 5 separate modules - utilities, wom/dom, frame1, frame2, and algorithms
**file passes jslint with options below
**file correctly minifies using google closure w/ default settings
**
***************************************************************************************************/


/***************************************************************************************************

Arc ( consolidates 5 library types )

 - consolidates 5 library types - utility, dom abastractor, boot loader, application framework,
   and algorithms into a single library, which decreases code redundancy and outside dependencies

Utility ( compare to underscore.js )

 - additional coverage including isObjectAbstract and isArrayAbstract
 - provides consistent naming convention for type checking
 - increased speed for looping idioms by function delegation
  
***************************************************************************************************/


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


/***************************************************************************************************
**utilities
***************************************************************************************************/


(function (self, undef) {

    "use strict";

    var $A = {},
        $P = {},

        // shortcuts to native implementations

        isArrayNative = Array.isArray,
        toString = Object.prototype.toString,
        slice = Array.prototype.slice;

    (function manageGlobal() {
        $P.previous = window.$A;
        $P.m_list = {util1: true};
    }());

    $P.noConflict = function() {
        window.$A = $P.previous;
        return self;
    };

    $P.isElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };

    // multi-window, use toString

    $P.isType = function (type, obj) {
        return $P.getType(obj) === type;
    };

    $P.getType = function (obj) {
        return toString.call(obj).slice(8, -1);
    };

    // single window only, use constructor property

    $P.isTypeZ = function (type, obj) {
        return $P.getTypeZ(obj) === type;
    };

    $P.getTypeZ = function (obj) {
        if (obj.constructor) {
            return obj.constructor.name;
        }
    };

    $P.isArray = isArrayNative || function (obj) {
        return toString.call(obj) === '[object Array]';
    };

    $P.isObjectAbstract = function (obj) {
        return obj === {}.constructor(obj);
    };

    $P.isArrayAbstract = function (obj) {
        return obj.length === +obj.length;
    };

    $P.isBoolean = function (obj) {
        return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
    };

    $P.isUndefined = function (obj) {
        return obj === undef;
    };

    $P.isNull = function (obj) {
        return obj === null;
    };

    // looping for collections

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

    $P.each = function (obj, func, context) {
        if (obj === null || obj === undef) {
            return;
        }
        if ($P.isArrayAbstract(obj)) {
            $P.eachIndex(obj, func, context);
            return;
        }
        if ($P.isObjectAbstract(obj)) {
            $P.eachKey(obj, func, context);
        }
    };

    // build 'is' functions

    $P.eachIndex(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Object'], function(name) {
        $P['is' + name] = function(obj) {
            return $P.isType(name, obj);
        };
    });

    // extending

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

    // general

    $P.clone = function(obj) {
        return $P.extend({}, obj);
    };

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

    $P.uniqueId = (function () {
        var id_counter = 0;
        return function(prefix) {
            var id = String(++id_counter);
            return prefix ? prefix + id : id;
        };
    }());

    // module complete - release to outer scope

    window.$A = $P.extendSafe($P, $A);

}(this));


/***************************************************************************************************
**wom/dom-correlate to jquery.com
***************************************************************************************************/


(function (win, doc, undef) {

    "use strict";

    var $A,
        $R = {},
        $P = function (selector) {
            return new $R.Constructor(selector);
        };

    (function manageGlobal() {

        // validate dependency on util1

        if (win.$A && window.$A.m_list && win.$A.m_list.util1) {
            $A = window.$A;

            // add wom1

            $A.m_list.wom1 = true;
        } else {
            throw "wom1 requires util1 Module";
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

    $R.functionNull = function () {
        return undefined;
    };

    $R.Constructor.prototype.createEvent = (function () {
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
    }());

    $R.Constructor.prototype.addEvent = (function () {
        if (win.addEventListener) {
            return function (type, callback) {
                if (type === '_dom') {
                    type = 'DOMContentLoaded';
                }
                $A.eachKey(this, function (val) {
                    val.addEventListener(type, callback);
                });
            };
        }
        if (win.attachEvent) {
            return function (type, callback) {
                if (type === '_dom') {
                    return;
                }
                $A.eachKey(this, function (val) {
                    val.attachEvent('on' + type, callback);
                });
            };
        }
        return $R.functionNull;
    }());

    $R.Constructor.prototype.removeEvent = (function () {
        if (win.removeEventListener) {
            return function (type, func) {
                $A.eachKey(this, function (val) {
                    val.removeEventListener(type, func);
                });
            };
        }
        if (win.detachEvent) {
            return function (type, func) {
                $A.eachKey(this, function (val) {
                    val.detachEvent('on' + type, func);
                });
            };
        }
        return $R.functionNull;
    }());

    // wrap the dom

    $P.Name = function (name) {
        return doc.getElementsByName(name.slice(1));
    };

    $P.Class = function (klass) {
        return doc.getElementsByClassName(klass);
    };

    $P.Id = function (Id) {
        return doc.getElementById(Id.slice(1));
    };

    $P.createDocumentFragment = function () {
        return doc.createDocumentFragment();
    };

    $P.createElement = function (name) {
        return doc.createElement(name);
    };

    $P.setTimeout = function (func, delay) {
        return win.setTimeout(func, delay);
    };

    $P.clearTimeout = function (id) {
        win.clearTimeout(id);
    };

    $P.setInterval = function (func, delay) {
        return win.setInterval(func, delay);
    };

    $P.clearInterval = function (id) {
        return win.clearInterval(id);
    };

    $P.getComputedStyle = function (el, el_pseudo) {
        return win.getComputedStyle(el, el_pseudo);
    };

    $P.undef = undef;

    $P.indexedDB = win.indexedDB || win.mozIndexedDB || win.webKitIndexedDB;

    $P.XMLHttpRequest = win.XMLHttpRequest;

    $P.FormData = win.FormData;

    $P.FileReader = win.FileReader;

    $P.localStorage = localStorage;

    $P.sessionStorage = sessionStorage;

    // abstract the dom

    $P.removeElement = function (element) {
        element.parentNode.removeChild(element);
    };

    $P.removeElementById = function (id) {
        var elem;
        (elem = document.getElementById(id)).parentNode.removeChild(elem);
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
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        config_ajax.callback(xhr.responseText);
                    }
                }
            };
            xhr.send(config_ajax.data);
        }

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

    // gets HTML5 data attributes

    $P.getData = function (id) {
        var o = {},
            data_dom = document.getElementById(id);
        $A.eachKey(data_dom.dataset, function(val, key) {
            o[key] = val;
        });
        return o;
    };

    // log

    $P.log = function (obj) {
        var logger,
            temp,
            type,
            ES5a = ['Arguments', 'Array', 'Object'],
            ES5b = ['Boolean', 'Date', 'Error', 'Function', 'JSON', 'Math',
                'Number', 'Null', 'RegExp', 'String', 'Undefined'],
            completed = false;

        // prevents IE error when not in debug mode.

        if (win.console) {

            // safari requires bind instead of a simple alias

            logger = win.console.log.bind(win.console);
        } else {
            return;
        }
        type = Object.prototype.toString.call(obj).slice(8, -1);

        if (!type) {
            logger("Object type not found");
            return;
        }

        // browser (host) objects

        if (type === 'Event') {
            logger(obj);
            return;
        }

        // library objects

        if (win.jQuery && (obj instanceof win.jQuery)) {
            logger('LOG|jQuery object|> ');
            return;
        }

        // language objects

        $A.eachIndex(ES5a, function(val) {
            if (type === val) {
                try {
                    temp = JSON.stringify(obj, null, 1);
                } catch (e) {
                    temp = false;
                }
                if (temp) {
                    logger("LOG|" + val + "|> " + temp);
                } else {
                    logger("LOG|" + val + "|> " + obj);
                }
                completed = true;
            }
        });

        // broken

        $A.eachIndex(ES5b, function(val) {
            if (type === val) {
                logger("LOG|" + val + "|> " + obj);
                completed = true;
            }
        });

        // catch remaining using completed flag

        if (completed !== true) {
            logger(obj);
        }
    };



    // module complete - release to outer scope

    win.$A = $A.extendSafe($P, $A);

}(window, window.document));



/***************************************************************************************************
**frame1
***************************************************************************************************/


(function () {

    "use strict";

    var $A,
        $P = {}, // (p)ublic
        $R = {}; // p(r)ivate

    (function manageGlobal() {
        if (window.$A && window.$A.m_list && window.$A.m_list.util1) {
            $A = window.$A;
            $A.m_list.frame1 = true;
        } else {
            throw "frame1 requires util1 module";
        }
    }());


    //Reg


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


    //Event


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


    //Queue


    $R.Queue = (function () {
        var queue = [],
            publik = {};

        // returns index in queue that holds a token

        function getIndex(token) {
            var hold;
            $A.eachIndex(queue, function(val, index) {
                if (val.token === token) {
                    hold = index;
                    return;
                }
            });
            return hold;
        }

        // pass in queue[0], handles
        // special case that queue is empty

        function getNextBlocked(item) {
            var blocked;
            if (item) {
                blocked = item.blocked;

            // queue is empty, set blocked to false

            } else {
                blocked = false;
            }
            return blocked;
        }
        publik.add = function (token, callback) {

            // stores 3 property object in an array

            var temp = {};
            temp.token = token;
            temp.blocked = false;
            temp.callback = callback;

            // and pushes it on to the queue

            queue.push(temp);
        };
        publik.complete = function (token) {
            var index,
                item,
                blocked;
            index = getIndex(token);

            // if not item 0 , the item is blocked

            if (index !== 0) {
                queue[index].blocked = true;
            } else {

                // items is not blocked
                // remove it and run the callback

                item = queue.shift();
                item.callback();

                // check the next item to see if it was waiting and repeat

                blocked = getNextBlocked(queue[0]);
                while (blocked) {

                    item = queue.shift();
                    item.callback();
                    blocked = getNextBlocked(queue[0]);
                }
            }
        };
        return publik;
    }());


    //saca

    // takes multiple asynchronous requests and orders them
    // using localStorage

    $R.saca = function (token, source, callback) {
        $R.Queue.add(token, callback);
        $A.ajax({
            type:       'get',
            url:        source,
            callback:   function (response_text) {
                localStorage[token] = response_text;
                $R.Queue.complete(token);
            }
        });
    };


    //Boot


    $P.Boot = (function () {

        var publik = {},
            config_boot = {},
            addElementText,
            addElement,
            parseToken,
            updateAndLoad;

        // parses a special text file used to consolidate static resources to a .txt file
        // text file has delimeters of the form "<!--|identifier_extension|-->"

        addElementText = function (file_token, callback) {
            var tokens = localStorage[file_token].split(/<!--<\|([\x20-\x7E]+)(_[\x20-\x7E]+)\|>-->/g),
                f_token,
                index,
                length,
                text,
                name,
                temp;
            for (length = tokens.length, index = 1; index < length; index += 3) {
                name = tokens[index];
                f_token = 'file_' + tokens[index] + tokens[index + 1];
                text = tokens[index + 2];
                temp = name.match(/\{([\x20-\x7E]*)\}/);
                if (temp) {
                    if (temp[1] === $P.Reg.get('browser_type')) {
                        addElement(f_token, callback, text);
                    }
                } else {
                    addElement(f_token, callback, text);
                }
            }
        };

        // dynamically adds resources to the dom
        // file token is of the form "file_identifier_extension"

        addElement = function (file_token, callback, text, source) {
            var file_type = file_token.match(/file_[\x20-\x7E]+_([\x20-x7E]+)$/)[1],
                element;
            if (file_type === 'txt') {
                addElementText(file_token);
                return;
            }
            if (file_type === 'htm') {
                element = document.createElement("div");
                element.id = file_token;
                if (!source) {
                    element.innerHTML = text;
                    document.body.appendChild(element);
                    if (callback) {
                        callback();
                    }
                    $P.Event.trigger(file_token);
                }
                return;
            }
            if (file_type === 'js') {
                element = document.createElement('script');
                element.id = file_token;
                if (!source) {
                    element.innerHTML = text;
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
                $P.Event.trigger(file_token);
                return;
            }
            if (file_type === 'css') {
                if (!source) {
                    element = document.createElement('style');
                    element.id = file_token;
                    element.innerHTML = text;
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
                $P.Event.trigger(file_token);
                return;
            }
            if (file_type === 'ico') {
                element = document.createElement("link");
                element.onload = callback;
                element.id = file_token;
                element.rel = "icon";
                if (!source) {
                    element.href = text;
                } else {
                    element.href = source;
                }
                document.head.appendChild(element);
                $P.Event.trigger(file_token);
                return;
            }
            if (file_type === 'png') {
                element = document.getElementById(file_token);
                element.onload = callback;
                element.id = file_token;
                element.src = text;
                $P.Event.trigger(file_token);
                return;
            }
        };

        // parses the input to boot()
        // accepts "//", "/" and "" prefixes for urls

        parseToken = function (source, callback) {
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

            if (config_boot.cached) {
                addElement(file_token, callback, localStorage[file_token]);
                return;
            }

            // no prefix or forward slash

            // relative to directory || relative to root

            if (prefix === undefined || prefix === '/') {
                $R.saca(file_token, source, function () {
                    addElement(file_token, callback, localStorage[file_token]);
                });
                return;
            }

            // double forward slash, not implemented

            if (prefix === '//') {
                return;
            }
        };

        // manages version using localStorage
        // simple serial loading of resources
        // check version number to see if cache is available, then load

        updateAndLoad = function () {
            var kindex,
                length;

            // determine if a cached version of the static resources 

            if (localStorage.file_version && localStorage.file_version >= config_boot.version) {
                config_boot.cached = true;
            } else {
                localStorage.file_version = config_boot.version;
                config_boot.cached = false;
            }
            for (kindex = 0, length = config_boot.resources.length; kindex < length; kindex += 1) {
                parseToken(config_boot.resources[kindex], null);
            }

        };

        // validate browser using version number

        publik.validate = function (obj) {
            var name = 'unknown',
                version = 'unknown',
                element,
                temp;
            $P.Reg.set('browser_type', null);
            $P.Reg.set('browser_validated', null);

            if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
                $P.Reg.set('browser_type', 'ie');
                name = 'Internet Explorer';
                version = parseFloat(RegExp.$1);
                if (version >= obj.In) {
                    $P.Reg.set('browser_validated', true);
                    return;
                }
            } else if (/Chrome[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
                $P.Reg.set('browser_type', 'ch');
                name = 'Chrome';
                version = parseFloat(RegExp.$1);
                if (version >= obj.Ch) {
                    $P.Reg.set('browser_validated', true);
                    return;
                }
            } else if (/Safari/.test(navigator.userAgent)) {
                $P.Reg.set('browser_type', 'sa');
                /Version[\/\s](\d+\.\d+)/.test(navigator.userAgent);
                name = 'Safari';
                version = parseFloat(RegExp.$1);
                if (version >= obj.Sa) {
                    $P.Reg.set('browser_validated', true);
                    return;
                }
            } else if (navigator.userAgent.match(/Firefox[\/\s](\d+\.\d+)/)) {
                $P.Reg.set('browser_type', 'ff');
                temp = navigator.userAgent.match(/Firefox[\/\s](\d+\.\d+)/);
                name = 'Firefox';
                version = parseFloat(temp[1]);
                if (version >= obj.Fi) {
                    $P.Reg.set('browser_validated', true);
                    return;
                }
            }

            element = document.getElementById('browser_validation');
            element.innerHTML += " You are running " + name + " " + version + ".";
            element.style.display = 'block';

            $P.Reg.set('browser_validated', false);
            $P.Reg.set('browser_element', element);

        };

        // configure the framework, mostly paths

        publik.config = function (func) {
            config_boot.func = func;
        };

        // set resources

        publik.setResources = function (obj) {
            config_boot = $A.extend(config_boot, obj);
        };

        publik.run = function (skip) {

            var val = $P.Reg.get('browser_validated');

            if (!skip && !val) {
                return;
            }

            if (!val) {
                var element = $P.Reg.get('browser_element');
                element.style.display = 'none';
            }

            // run the configuration function

            if (config_boot.func) {
                config_boot.func();
            }

            // boot the application

            updateAndLoad();
        };

        return publik;

    }());

    window.$A = $A.extendSafe($A, $P);

}());


/***************************************************************************************************
**frame2
***************************************************************************************************/


(function () {

    "use strict";

    var $A,
        $P = {},  // public
        $R = {};  // private

    $P.last = {};
    $R.Parsel = {};
    $R.pipe_hold = {};

    (function manageGlobal() {
        if (window.$A && window.$A.m_list && window.$A.m_list.util1 && window.$A.m_list.frame1) {
            $A = window.$A;
            $A.m_list.frame2 = true;
        } else {
            throw "frame2 requires util1 and frame1 module";
        }
    }());


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
                    intervals[index - 1] = (measurements[index] - measurements[index - 1]) + 'ms';
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

                    list[key] = $A.Id(val);
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

            // add the constructor and then delete the temporary copy

            if (o.constructor) {
                object_public = o.constructor;
                delete o.constructor;
            }

            // loop through all remaining properties

            $A.eachKey(o, function(val, key) {

                if (/^s_/.test(key)) {

                    // s_ denotes a static property that is copied directly to the constructor

                    object_public[key] = val;

                } else if (/^p_/.test(key)) {

                    // privacy not implemented yet, just copy over as normal for now

                    object_public.prototype[key] = val;

                } else {

                    // prototyped

                    object_public.prototype[key] = val;
                }

            });
            return object_public;
        }
    };

    // machine automates ajax along with pre() and post()

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
            $A.Boot.run(true);
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


/***************************************************************************************************
**algorithms-correlate to nczonline.net
***************************************************************************************************/


(function () {


    "use strict";

    var $A,
        $P = {};  // public

    (function manageGlobal() {
        if (window.$A && window.$A.m_list && window.$A.m_list.util1) {
            $A = window.$A;
            $A.m_list.frame2 = true;
        } else {
            throw "frame2 requires util1 and frame1 module";
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

            // reverse loop
            // conditional - non-negative index && sorted value is greater then check value

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


/***************************************************************************************************
**Application Start
**
**
**
*/

(function () {


    "use strict";


    // validate


    $A.Boot.validate({
        In: 20,
        Fi: 14,
        Sa: 5,
        Ch: 40
    });


    // configure


    $A.Boot.config(function () {

        // fast

        $A.Event.add('file_arcmarks_js', function () {
            $A.Reg.setMany($A.getData('universals'));
            $A.getElements('E');
            $A.initByProperty('init');
        });

        // slow

        $A.Event.add('file_jqueryui_js', function () {
            $A.getLibElements('J', $);
            $A.initByProperty('initJ');
        });

        // paths

        $A.Reg.setMany({
            path_ajax:          'arcmarks/source/class.CMachine.php',
            path_pictures:      'arcmarks/pictures/',
            path_images:        'arcmarks/images/'
        });

    });


    // resources


    $A.Boot.setResources({
        version: Date.now(),
        resources:
            [
                'arcmarks/source/arccss.txt',
                'arcmarks/source/arcmarks.htm',
                'arcmarks/source/arcmarks.js',
                'arcmarks/source/arclibs.txt'
            ]
    });


    // run the booter


    $A.Boot.run();

}());

/***************************************************************************************************
**Application End
**
**
**
*/
