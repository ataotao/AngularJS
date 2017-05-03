
import angular from 'angular';
export default angular.module('PubSub', []).factory('PubSub', ['$timeout', function ($timeout) {
    function alias(fn) {
        return function closure() {
            return this[fn].apply(this, arguments);
        };
    }

    var PubSub = {
        topics: {},
        subUid: -1
    };

    PubSub.subscribe = function (topic, callback, once) {
        var token = this.subUid += 1,
            obj = {};

        if (typeof callback !== 'function') {
            throw new TypeError('When subscribing for an event, a callback function must be defined.');
        }

        if (!this.topics[topic]) {
            this.topics[topic] = [];
        }

        obj.token = token;
        obj.callback = callback;
        obj.once = !!once;

        this.topics[topic].push(obj);

        return token;
    };

    PubSub.subscribeOnce = function (topic, callback) {
        return this.subscribe(topic, callback, true);
    };

    PubSub.publish = function (topic, data) {
        var that = this,
            len, subscribers, currentSubscriber, token;

        if (!this.topics[topic]) {
            return false;
        }

        $timeout(function () {
            subscribers = that.topics[topic];
            len = subscribers ? subscribers.length : 0;

            while (len) {
                len -= 1;
                token = subscribers[len].token;
                currentSubscriber = subscribers[len];

                currentSubscriber.callback(data, {
                    name: topic,
                    token: token
                });

                if (currentSubscriber.once === true) {
                    that.unsubscribe(token);
                }
            }
        }, 0);

        return true;
    };

    PubSub.unsubscribe = function (topic) {
        var tf = false,
            prop, len;

        for (prop in this.topics) {
            if (Object.hasOwnProperty.call(this.topics, prop)) {
                if (this.topics[prop]) {
                    len = this.topics[prop].length;

                    while (len) {
                        len -= 1;

                        if (this.topics[prop][len].token === topic) {
                            this.topics[prop].splice(len, 1);
                            return topic;
                        }

                        if (prop === topic) {
                            this.topics[prop].splice(len, 1);
                            tf = true;
                        }
                    }

                    if (tf === true) {
                        return topic;
                    }
                }
            }
        }

        return false;
    };

    PubSub.on = alias('subscribe');
    PubSub.once = alias('subscribeOnce');
    PubSub.trigger = alias('publish');
    PubSub.off = alias('unsubscribe');

    return PubSub;
}]).name;

