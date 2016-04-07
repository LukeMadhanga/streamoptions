(function (window, count) {
    
    "use strict";
    
    var app = {c: {}, v: {}, m: {}},
    methods = {
        /**
         * Initialise the streamOptions plugin on a HTML input element
         * @param {object} opts [optional] An object with one or more of the following options<pre>
         *  {
         *      availableoptions: String - A comma separated list of options; Object - An object in one of two forms: {title: datatype} 
         *                        or {name: {title: string, type: string}} (the outputted data format); Array - An array of titles, 
         *                        e.g. ['Title', 'Another title', ...]
         *  }
         * @returns {$}
         */
        init: function (opts) {
            if (this.tagName !== 'input') {
                $.error('This function may only be initialised on an input element');
            }
            var T = $(this);
            if (T.data('streamoptions') || ! T.length) {
                // Already initialized
                return T;
            } else if (T.length > 1) {
                T.each(function () {
                    return $(this).streamOptions(opts);
                });
                return T;
            }
            opts = opts || {};
            var data = {
                instanceid: ++count,
                s: {
                    availableoptions: parseAvailableOptions(opts.availableoptions || T.data('availableoptions') || null)
                },
                value: T[0].value ? JSON.parse(T[0].value) : {}
            };
            T.data('streamoptions', data);
            app.v.initView.call(T, data);
        },
        /**
         * Get the value of the current set of options
         * @param {callback} validate [optional] A function to validate the output. If set, a value of <b>true MUST</b> be returned in
         *  order to allow the function to continue 
         * @returns {undefined|Boolean|streamoptions_L1.methods.getValue.T|$}
         */
        getValue: function (validate) {
            var T = $(this);
            if (T.length > 1) {
                T.each(function () {
                    return T.streamOptions('getValue');
                });
                return T;
            }
            var data = T.data('streamoptions');
            if (!data) {
                $.error('Call to function streamOptions(getValue) of an uninitialized object');
                return;
            }
            var scope = T.closest('.streamoptions-list'),
            output = {};
            $('.streamoptions-list-item', scope).each(function () {
                var key = $('.streamoptions-list-item-title', this).val(),
                // @todo throw exception if key value not set
                value = $('.streamoptions-list-item-value', this).val();
                output[key] = value;
            });
            if (is_a(validate, 'function') && validate.call(T, output) !== true) {
                $.error('Options did not validate');
                return false;
            }
            T[0].value = JSON.stringify(output);
            return output;
        },
        /**
         * Redraw the output
         * @returns {$|undefined}
         */
        redraw: function () {
            var T = $(this);
            if (T.length > 1) {
                T.each(function () {
                    return T.streamOptions('redraw');
                });
                return T;
            }
            var data = T.data('streamoptions');
            if (!data) {
                $.error('Call to function streamOptions(redraw) of an uninitialized object');
                return;
            }
            T.streamOptions('getValue');
            $('.streamoptions-list-item', T.closest('.streamoptions-list'));
            app.v.drawOutput.call(T, data);
            return T;
        }
    };
    
    /**
     * Initialise the view
     * @param {object} data The object describing this instance
     * @returns {undefined}
     */
    app.v.initView = function (data) {
        var addhtml = getHtml('div', '+', null, 'streamoptions-add');
        $(getHtml('div', addhtml, 'streamoptions-' + data.instanceid, 'streamoptions-list')).insertAfter(this);
        app.v.drawOutput.call(this, data);
    };
    
    /**
     * Draw the output body
     * @param {object} data The object describing this instance
     * @returns {undefined}
     */
    app.v.drawOutput = function (data) {
        var x,
        scope = $('#streamoptions-' + data.instanceid).append(this.hide()),
        add = $('.streamoptions-add', scope);
        for (x in data.value) {
            $(app.v.renderOpt(x, data.value[x], data.s.availableoptions)).insertBefore(add);
        }
        app.c.bindEvents.call(this);
    };
    
    /**
     * Bind events onto all of the created elements in this instance
     * @returns {undefined}
     */
    app.c.bindEvents = function () {
        var t = this,
        scope = this.closest('.streamoptions-list'),
        opts = this.data('streamoptions').s.availableoptions;
        $('.streamoptions-list-item-del', scope).unbind('click.removeitem').on('click.removeitem', function () {
            if (confirm('Are you sure you want to remove this item?')) {
                $(this).closest('.streamoptions-list-item').remove();
            }
        });
        $('.streamoptions-add', scope).unbind('click.addone').on('click.addone', function () {
            $(app.v.renderOpt('', '', opts)).insertBefore(this);
            app.c.bindEvents.call(t);
        });
        $('select.streamoptions-list-item-title', scope).unbind('change.focusinput').on('change.focusinput', function () {
            $('.streamoptions-list-item-value', scope).focus();
        });
    };
    
    /**
     * Render a key-value option
     * @param {string} title The title (key) of the option
     * @param {string} value The value of the option
     * @param {object} options [optional] The availableoptions, if any
     * @returns {html}
     */
    app.v.renderOpt = function (title, value, options) {
        var main = app.v.renderKeySelector(title, options) + 
                getHtml('input', null, null, 'streamoptions-list-item-value', {value: value}),
        html = getHtml('div', main, null, 'streamoptions-list-item-main') + getHtml('div', 'x', null, 'streamoptions-list-item-del');
        return getHtml('div', html, null, 'streamoptions-list-item');
    };
    
    /**
     * Render the key selector, either an input if there are no availableoptions or a select
     * @param {string} key The selected key
     * @param {object} options [optional] The availableoptions, if any
     * @returns {html}
     */
    app.v.renderKeySelector = function (key, options) {
        if (options) {
            var opts = getHtml('option', 'select...'),
            x,
            attrs;
            for (x in options) {
                attrs = {value: x};
                if (x === key) {
                    attrs['selected'] = 'selected';
                }
                opts += getHtml('option', options[x].title, null, null, attrs);
            }
            return getHtml('select', opts, null, 'streamoptions-list-item-title');
        } else {
            return getHtml('input', null, null, 'streamoptions-list-item-title', {value: key});
        }
    };
    
    /**
     * Test to see if an object is of a particular type
     * @param {mixed} variable The object to test
     * @param {string} expected The type expected
     * @returns {String|Boolean} False if the object is undefined, or a boolean depending on whether the object matches
     */
    function is_a(variable, expected) {
        if (variable === undefined) {
            // Undefined is an object in IE8
            return false;
        }
        var otype = expected.substr(0, 1).toUpperCase() + expected.substr(1).toLowerCase();
        return Object.prototype.toString.call(variable) === '[object ' + otype + ']';
    }
    
    /**
     * Generate a xhtml element, e.g. a div element
     * @syntax cHE.getHtml(tagname, body, htmlid, cssclass, {attribute: value});
     * @param {string} tagname The type of element to generate
     * @param {string} body The body to go with 
     * @param {string} id The id of this element
     * @param {string} cssclass The css class of this element
     * @param {object} moreattrs An object in the form {html_attribute: value, ...}
     * @returns {html} The relevant html as interpreted by the browser
     */
    function getHtml(tagname, body, id, cssclass, moreattrs) {
        var html = document.createElement(tagname);
        if (body) {
            html.innerHTML = body;
        }
        if (id) {
            html.id = id;
        }
        if (cssclass) {
            html.className = cssclass;
        }
        setAttributes(html, moreattrs);
        return html.outerHTML;
    };

    /**
     * Set the custom attributes
     * @param {object(DOMElement)} obj
     * @param {object(plain)} attrs
     * @returns {object(DOMElement)}
     */
    function setAttributes(obj, attrs) {
        if (is_a(attrs, 'object')) {
            for (var x in attrs) {
                if (attrs.hasOwnProperty(x)) {
                    var val = attrs[x];
                    if (typeof val === 'boolean') {
                        // Convert booleans to their integer representations
                        val = val ? 1 : 0;
                    }
                    obj.setAttribute(x, val);
                }
            }
        }
    }
    
    /**
     * Parse available options into a format the software understands
     * @param {mixed} set <b>String</b><br/>A comma separated list of options<br/><br/><b>Object</b.<br/>An object in one of two forms:
     *  <br/> {title: datatype} or<br/><br/>{name: {title: string, type: string}} (the outputted data format)<br/><br/><b>Array</b><br/>
     *  An array of titles
     * @returns {object} An object in the form {name: {title: string, type: string}, ...}
     */
    function parseAvailableOptions(set) {
        var output = null;
        switch (Object.prototype.toString.call(set)) {
            case '[object Object]':
                for (var x in set) {
                    if (Object.prototype.toString.call(set[x]) === '[object String]') {
                        // Allow the user to supply data in the form {key: datatype}
                        set[x.replace(' ', '')] = {title: x, type: set[x]};
                    }
                };
                break;
            case '[object String]':
                // Allow for a comma-separated list of options
                set = set.split(',');
                /*falls through*/
            case '[object Array]':
                set.sort(function (a, b) {
                    // Sort alphabetically regardless of case
                    return (a || '').toLowerCase() > (b || '').toLowerCase() ? 1 : -1;
                });
                output = {};
                for (var i = 0; i < set.length; i++) {
                    var title = set[i],
                    key = title.replace(' ', '').toLowerCase();
                    output[key] = {title: title, type: 'text'};
                }
                break;
        }
        return output;
    }
    
    /**
     * Instantiate the streamOptions plugin on a HTML input element
     * @param {mixed} methodOrOpts If left empty or an object is passed, the initialise function will be called, otherwise this will be
     *  the name of the function to call
     * @returns {unresolved} Usually a jQuery object, but may be different depending on the function called
     */
    $.fn.streamOptions = function(methodOrOpts) {
        if (methods[methodOrOpts]) {
            // The first option passed is a method, therefore call this method
            return methods[methodOrOpts].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (Object.prototype.toString.call(methodOrOpts) === '[object Object]' || !methodOrOpts) {
            // The default action is to call the init function
            return methods.init.apply(this, arguments);
        } else {
            // The user has passed us something dodgy, throw an error
            $.error(['The method ', methodOrOpts, ' does not exist'].join(''));
        }
    };
    
}(this, 0));
