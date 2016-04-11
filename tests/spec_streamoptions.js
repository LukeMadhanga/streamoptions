(function () {
    
    "use strict";
    /*global window,JSON,$,describe,xdescribe,it,xit,expect*/
    
    $(function () {
        $('<input class="jasmine-test-streamoptions"/>').appendTo('body');
        var so = $('.jasmine-test-streamoptions').streamOptions();
        
        describe('StreamOptions init', function () {
            it('correctly sets value to empty object', function () {
                // Expecting to have the same number options, i.e. 0
                expect(so.streamOptions('getValue')).toEqual({});
            });
        });
        
        describe('StreamOptions updateAvailableOptions', function () {
            it('correctly update available options to comma separated list', function () {
                // Expecting to have the same number options, i.e. 0
                so.streamOptions('updateAvailableOptions', 'string,int,Array');
                var data = so.data('streamoptions');
                expect(data.s.availableoptions).toEqual({
                    string: {title: 'string', type: 'string'},
                    int: {title: 'int', type: 'string'},
                    array: {title: 'Array', type: 'string'}
                });
            });
            
            it('correctly update available options to array after csv', function () {
                // Expecting to have the same number options, i.e. 0
                so.streamOptions('updateAvailableOptions', ['string', 'int', 'Array']);
                var data = so.data('streamoptions');
                expect(data.s.availableoptions).toEqual({
                    string: {title: 'string', type: 'string'},
                    int: {title: 'int', type: 'string'},
                    array: {title: 'Array', type: 'string'}
                });
            });
            
            it('correctly update available options to array after array and csv', function () {
                // Expecting to have the same number options, i.e. 0
                so.streamOptions('updateAvailableOptions', {string: 'string', int: 'int', Array: 'boolean'});
                var data = so.data('streamoptions');
                expect(data.s.availableoptions).toEqual({
                    string: {title: 'string', type: 'string'},
                    int: {title: 'int', type: 'int'},
                    Array: {title: 'Array', type: 'boolean'}
                });
            });
            
            it('correctly unsets all available options', function () {
                // Expecting to have the same number options, i.e. 0
                so.streamOptions('updateAvailableOptions');
                var data = so.data('streamoptions');
                expect(data.s.availableoptions).toBe(null);
            });
        });
        
        describe('StreamOptions core app', function () {
            
            var app = so.data('streamoptions').app;
            it('correctly sorts an array regardless of case', function () {
                // Expecting to have the same number options, i.e. 0
                expect(['1', 1, '2', 'aB', 'Ab', '1AB'].sort(app.m.sortValues)).toEqual(['1', 1, '1AB', '2', 'aB', 'Ab']);
            });
            
            it('correctly draws an option', function () {
                // Expecting to have the same number options, i.e. 0
                expect(app.v.renderOpt('Boom', 'string')).toBe('<div class="streamoptions-list-item">' +
                    '<div class="streamoptions-list-item-main"><input class="streamoptions-list-item-title" value="Boom">' +
                    '<input class="streamoptions-list-item-value" value="string"></div>' +
                    '<div class="streamoptions-list-item-del">x</div></div>');
            });
            
        });
    });
    
}());
