# StreamOptions #
*An easy way to allow end-users to create a JSON set of options*


----------


When authoring a content management system, you need to allow users to have the ability add in options. The best way to store a list of options is arguably in a JSON object, which this plugin allows users to do without even knowing what JSON is


----------

##Test

Jasmine is used to run the unit tests. Be sure to update '/path/to' in the HTML file to the path to the specified file.

----------


##Initialising##
####HTML####
    <script type="text/javascript" src="/path/to/streamoptions.js"></script>
    <link rel="stylesheet" type="text/css" href="/path/to/streamoptions.css">

####JavaScript####
    $(function () {
        $(selector).streamOptions({...});
    });
> *NB, `$(function () {})` is shorthand for `$(document).ready(function () {})`*

##Options##

### availableoptions
*A list of available options to limit the editor to create*
