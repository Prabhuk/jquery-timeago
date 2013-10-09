/**
 * Timeago is a jQuery plugin that makes it easy to support automatically
 * updating fuzzy timestamps (e.g. "4 minutes ago" or "about 1 day ago").
 *
 * @name timeago
 * @version 1.3.0
 * @requires jQuery v1.2.3+
 * @author Ryan McGeary
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://timeago.yarp.com/
 *
 * Copyright (c) 2008-2013, Ryan McGeary (ryan -[at]- mcgeary [*dot*] org)
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.timeago = function(timestamp) {
        if (timestamp instanceof Date) {
            return inWords(timestamp);
        } else if (typeof timestamp === "string") {
            return inWords($.timeago.parse(timestamp));
        } else if (typeof timestamp === "number") {
            return inWords(new Date(timestamp));
        } else {
            return inWords($.timeago.datetime(timestamp));
        }
    };

    $.daysago = function(timestamp) {
        if (timestamp instanceof Date) return inWords(timestamp);
        else if (typeof timestamp == "string") return inWords($.timeago.parse(timestamp));
        else return inWords($.timeago.parse($(timestamp).attr("name")));
    };

    var $t = $.timeago;

    $.extend($.timeago, {
        settings: {
            refreshMillis: 60000,
            refreshMillisForDaysAgo: 3600000, //1 hr
            allowFuture: false,
            localeTitle: false,
            cutoff: 0,
            strings: {
                prefixAgo: null,
                prefixFromNow: null,
                suffixAgo: "ago",
                suffixFromNow: "from now",
                seconds: "less than a minute",
                minute: "about a minute",
                minutes: "%d minutes",
                hour: "about an hour",
                hours: "about %d hours",
                day: "a day",
                days: "%d days",
                month: "about a month",
                months: "%d months",
                year: "about a year",
                years: "%d years",
                wordSeparator: " ",
                numbers: [],
                today:"Today",
                yesterday:"Testerday",
                sunday:"Sunday",
                monday:"Monday",
                tuesday:"Tuesday",
                wednesday:"Wednesday",
                thursday:"Thursday",
                friday:"Friday",
                saturday:"Saturday",
                jan:"January",
                feb:"February",
                march:"March",
                april:"April",
                may:"May",
                june:"June",
                july:"July",
                august:"August",
                sep:"September",
                oct:"October",
                nov:"November",
                dec:"December"
            }
        },


        daysInWords : function(datePassed, distanceMillis) {
            var currentDateTime = new Date();
            var currDate = currentDateTime.getDate();
            var currMonth = currentDateTime.getMonth();
            var currYear = currentDateTime.getFullYear();

            var todayStartTime = new Date(currYear, currMonth, currDate, 0, 0, 0, 0);
            var yesterdayStartTime = new Date(currYear, currMonth, currDate-1, 0, 0, 0, 0);
            var prevDays = new Date(currYear, currMonth, currDate-6, 0, 0, 0, 0);

            var refForToday = currentDateTime - todayStartTime;
            var refForYesterday = currentDateTime - yesterdayStartTime;
            var refForPrevDays = currentDateTime - prevDays;

            var getWeekDay = function(datePassed) {
                var weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
                var day = weekdays[datePassed.getDay()];
                return ($.timeago.settings.strings[day.toLowerCase()]) || "today";
            };

            var getDate = function(datePassed) {
                var date = new Date(datePassed);
                var month = date.getMonth();
                var d = date.getDate();
                var monthMapping = {
                    0   : $.timeago.settings.strings.jan,
                    1   : $.timeago.settings.strings.feb,
                    2   : $.timeago.settings.strings.march,
                    3   : $.timeago.settings.strings.april,
                    4   : $.timeago.settings.strings.may,
                    5   : $.timeago.settings.strings.june,
                    6   : $.timeago.settings.strings.july,
                    7   : $.timeago.settings.strings.august,
                    8   : $.timeago.settings.strings.sep,
                    9   : $.timeago.settings.strings.oct,
                    10  : $.timeago.settings.strings.nov,
                    11  : $.timeago.settings.strings.dec
                };
                return monthMapping[month] + " " + d;
            };

            var strings = $.timeago.settings.strings;
            var ourOwnWords = distanceMillis < refForToday
                    ? strings.today
                    : (distanceMillis < refForYesterday
                    ? strings.yesterday
                    : distanceMillis < refForPrevDays ? getWeekDay(datePassed) : getDate(datePassed)
                    );

            // var ourOwnWords = Math.round(days) == 0 ? $.timeago.settings.strings.today : (days < 6 ? getWeekDay(days) : getDate(datePassed));
            return (ourOwnWords);
        },


        inWords: function(distanceMillis) {
            var $l = this.settings.strings;
            var prefix = $l.prefixAgo;
            var suffix = $l.suffixAgo;
            if (this.settings.allowFuture) {
                if (distanceMillis < 0) {
                    prefix = $l.prefixFromNow;
                    suffix = $l.suffixFromNow;
                }
            }

            var seconds = Math.abs(distanceMillis) / 1000;
            var minutes = seconds / 60;
            var hours = minutes / 60;
            var days = hours / 24;
            var years = days / 365;

            function substitute(stringOrFunction, number) {
                var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
                var value = ($l.numbers && $l.numbers[number]) || number;
                return string.replace(/%d/i, value);
            }

            var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
                    seconds < 90 && substitute($l.minute, 1) ||
                    minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
                    minutes < 90 && substitute($l.hour, 1) ||
                    hours < 24 && substitute($l.hours, Math.round(hours)) ||
                    hours < 42 && substitute($l.day, 1) ||
                    days < 30 && substitute($l.days, Math.round(days)) ||
                    days < 45 && substitute($l.month, 1) ||
                    days < 365 && substitute($l.months, Math.round(days / 30)) ||
                    years < 1.5 && substitute($l.year, 1) ||
                    substitute($l.years, Math.round(years));

            var separator = $l.wordSeparator || "";
            if ($l.wordSeparator === undefined) { separator = " "; }
            return $.trim([prefix, words, suffix].join(separator));
        },
        parse: function(iso8601) {
            var s = $.trim(iso8601);
            s = s.replace(/\.\d+/,""); // remove milliseconds
            s = s.replace(/-/,"/").replace(/-/,"/");
            s = s.replace(/T/," ").replace(/Z/," UTC");
            s = s.replace(/([\+\-]\d\d)\:?(\d\d)/," $1$2"); // -04:00 -> -0400
            return new Date(s);
        },
        datetime: function(elem) {
            var iso8601 = $t.isTime(elem) ? $(elem).attr("datetime") : $(elem).attr("title");
            return $t.parse(iso8601);
        },
        isTime: function(elem) {
            // jQuery's `is()` doesn't play well with HTML5 in IE
            return $(elem).get(0).tagName.toLowerCase() === "time"; // $(elem).is("time");
        }
    });

    // functions that can be called via $(el).timeago('action')
    // init is default when no action is given
    // functions are called with context of a single element
    var functions = {
        init: function(){
            var refresh_el = $.proxy(refresh, this);
            refresh_el();
            var $s = $t.settings;
            if ($s.refreshMillis > 0) {
                setInterval(refresh_el, $s.refreshMillis);
            }
        },
        update: function(time){
            $(this).data('timeago', { datetime: $t.parse(time) });
            refresh.apply(this);
        },
        updateFromDOM: function(){
            $(this).data('timeago', { datetime: $t.parse( $t.isTime(this) ? $(this).attr("datetime") : $(this).attr("title") ) });
            refresh.apply(this);
        }
    };

    $.fn.timeago = function(action, options) {
        var fn = action ? functions[action] : functions.init;
        if(!fn){
            throw new Error("Unknown function name '"+ action +"' for timeago");
        }
        // each over objects here and call the requested function
        this.each(function(){
            fn.call(this, options);
        });
        return this;
    };

    $.fn.daysago = function() {
        var self = this;
        self.each(refreshDays);

        var $s = $t.settings;
        if ($s.refreshMillisForDaysAgo > 0) {
            setInterval(function() { self.each(refreshDays); }, $s.refreshMillisForDaysAgo);
        }
        return self;
    };

    function refreshDays() {
        var date = new Date(this.getAttribute("name")/1.0);
        if (!isNaN(date)) {
            $(this).text(daysInWords(date));
            $(this).attr("title", $.timeago.settings.formatDate(date,null));
        }
        return this;
    }

    function daysInWords(date) {
        return $t.daysInWords(date, distance(date));
    }

    function refresh() {
        var data = prepareData(this);
        var $s = $t.settings;

        if (!isNaN(data.datetime)) {
            if ( $s.cutoff == 0 || distance(data.datetime) < $s.cutoff) {
                $(this).text(inWords(data.datetime));
            }
        }
        return this;
    }

    function prepareData(element) {
        element = $(element);
        if (!element.data("timeago")) {
            element.data("timeago", { datetime: $t.datetime(element) });
            var text = $.trim(element.text());
            if ($t.settings.localeTitle) {
                element.attr("title", element.data('timeago').datetime.toLocaleString());
            } else if (text.length > 0 && !($t.isTime(element) && element.attr("title"))) {
                element.attr("title", text);
            }
        }
        return element.data("timeago");
    }

    function inWords(date) {
        return $t.inWords(distance(date));
    }

    function distance(date) {
        return (new Date().getTime() - date.getTime());
    }

    // fix for IE6 suckage
    document.createElement("abbr");
    document.createElement("time");
}));
