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
            if (T.prop('tagName') !== 'INPUT') {
                $.error('This function may only be initialised on an input element');
            }
            opts = opts || {};
            var data = {
                instanceid: ++count,
                s: {
                    availableoptions: parseAvailableOptions(opts.availableoptions || T.data('availableoptions') || null)
                },
                value: T[0].value ? JSON.parse(T[0].value) : {}
            };
            T.addClass('streamoptions-value').data('streamoptions', data);
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
         * @returns {$}
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
            }
            T.streamOptions('getValue');
            $('.streamoptions-list-item', T.closest('.streamoptions-list'));
            app.v.drawOutput.call(T, data);
            return T;
        },
        /**
         * Update the list of available options
         * @param {mixed} availableopts Either a String - A comma separated list of options; Object - An object in one of two forms: 
         *  {title: datatype} or {name: {title: string, type: string}} (the outputted data format); Array - An array of titles, 
         *  e.g. ['Title', 'Another title', ...]
         * @returns {$}
         */
        updateAvailableOptions: function (availableopts) {
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
            }
            data.s.availableoptions = availableopts ? parseAvailableOptions(availableopts) : null;
            app.v.redraw.call(T, data);
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
     * Redraw the output
     * @param {type} data
     * @returns {undefined}
     */
    app.v.redraw = function (data) {
        var scope = this.closest('.streamoptions-list');
        $('.streamoptions-list-item', scope).remove();
        app.v.drawOutput.call(this, data);
    };
    
    /**
     * Render a key-value option
     * @param {string} title The title (key) of the option
     * @param {string} value The value of the option
     * @param {object} options [optional] The availableoptions, if any
     * @returns {html}
     */
    app.v.renderOpt = function (title, value, options) {
        title = title.title || title;
        var curopt = options[title] || {type: 'string'};
        var main = app.v.renderKeySelector(title, options) + app.v.renderValueInput(curopt.type, value, curopt.options),
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
            attrs,
            order = [];
            for (x in options) {
                order.push(x);
            }
            order.sort(function (a, b) {
                (a || '') > (b || '') ? 1 : -1;
            });
            for (var i = 0; i < order.length; i++) {
                var x = order[i];
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
    
    
    app.v.renderValueInput = function (datatype, value, options) {
        var classes = ['streamoptions-list-item-value'];
        var attrs = {value: value};
        if (options) {
            var opts = '';
            for (var i = 0; i < options.length; i++) {
                var curopt = options[i];
                if (!is_a(curopt, 'object')) {
                    curopt = {title: curopt, value: curopt};
                }
                if (value === curopt.value) {
                    attrs.selected = 'selected';
                }
                attrs = {value: curopt.value};
                opts += getHtml('option', curopt.title, null, null, attrs);
            }
            classes.push('streamoptions-select-value');
            return getHtml('select', opts, null, classes.join(' '));
        }
        switch (datatype) {
            case 'float':
            case 'int':
                attrs.type = 'number';
                if (isNaN(Number(attrs.value))) {
                    // Make sure numbers are numbers
                    attrs.value = 0;
                }
                break;
            case 'boolean':
                attrs.type = 'range';
                attrs.min = 0;
                attrs.max = 1;
                attrs.step = 1;
                // Boolean can only have a maximum value of 1
                attrs.value = (attrs.value > 1 ? 1 : attrs.value) || 0;
                classes.push('streamoptions-boolean');
                if (attrs.value) {
                    classes.push('streamoptions-boolean-true');
                }
                break;
        }
        return getHtml('input', null, null, classes.join(' '), attrs);
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
            var t = $(this);
            var scope = t.closest('.streamoptions-list-item');
            var valueinput = $('.streamoptions-list-item-value', scope);
            var val = valueinput.val();
            var curopts = opts[this.value] || {type: 'string'};
            valueinput.replaceWith(app.v.renderValueInput(curopts.type, val, curopts.options)).focus();
            app.c.bindEvents.call($('.streamoptions-value', scope.closest('.streamoptions-list')));
        });
        $('.streamoptions-list-item-value.streamoptions-boolean', scope).unbind('change.colorise').on('change.colorise', function () {
            if (this.value > 0) {
                // true
                $(this).addClass('streamoptions-boolean-true');
            } else {
                $(this).removeClass('streamoptions-boolean-true');
            }
        });
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
                    } else {
                        // Add in some defaults if missing
                        if (!set[x].type) {
                            set[x].type = 'string';
                        }
                        if (!set[x].title) {
                            set[x].title = x;
                        }
                    }
                };
                output = set;
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
