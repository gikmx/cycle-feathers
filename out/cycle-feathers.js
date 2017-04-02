'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (socket) {

    if (!socket) throw new Error('Expecting a socket connection');

    var debug = (0, _debug2.default)('feathers:driver');

    var client = (0, _feathersClient2.default)().configure(_feathersClient2.default.hooks()).configure(_feathersClient2.default.socketio(socket));

    // Returns a function that accepts a Sink Stream and returns a source.
    return function (sink$) {

        // Process the received sink stream.
        // - emits the specified method on the socket service
        // - triggers a local event that can be later selected from the sources.
        sink$.map(function (sink) {
            (0, _validate2.default)(sink, {
                service: { type: String, required: true },
                method: { type: String, required: true },
                args: { type: Array, value: [] }
            });
            var event = sink.service + '::' + sink.method;
            var service = client.service(sink.service);
            var method = service[sink.method];
            var args = sink.args || [];
            if (typeof method !== 'function') throw new Error('Invalid method \'' + sink.method + '\' for ' + sink.service);
            debug('sink request \u2192 ' + event, args);
            return _xstream2.default.fromPromise(service[sink.method].apply(service, _toConsumableArray(args))).map(function (response) {
                return _extends({}, sink, { response: response, event: event });
            });
        }).flatten().addListener({
            error: function error(_error) {
                throw _error;
            },
            next: function next(sink) {
                // emit locally
                debug('sink response \u2192 ' + sink.event, sink.response);
                client.emit(sink.event, sink.response);
            }
        });

        // The source stream that will handle the intents
        return {
            select: function select(selector) {
                var _Validate = (0, _validate2.default)(selector, {
                    service: { type: String, required: true },
                    method: { type: String, required: true },
                    type: { type: String, required: true }
                }),
                    type = _Validate.type,
                    service = _Validate.service,
                    method = _Validate.method;

                var event = service + '::' + method;
                return _xstream2.default.create({
                    stop: function stop() {},
                    start: function start(listener) {
                        var handler = function handler(response) {
                            debug('source ' + type + ':emitted \u2192 ' + service + '::' + method, response);
                            listener.next(response);
                        };
                        if (type == 'local') client.on(event, handler);
                        if (type == 'socket') client.service(service).on(method, handler);
                        debug('source ' + type + ':added \u2192 ' + event);
                    }
                });
            }
        };
    };
};

var _xstream = require('xstream');

var _xstream2 = _interopRequireDefault(_xstream);

var _feathersClient = require('feathers-client');

var _feathersClient2 = _interopRequireDefault(_feathersClient);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _validate = require('@gik/validate');

var _validate2 = _interopRequireDefault(_validate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function typeValidate(type, event) {
    var types = ['local', 'socket'];
    var msg = 'Invalid type for ' + event + ', expecting [' + types.join(',') + ']; got: ' + type;
    if (types.indexOf(type) === -1) throw new Error(msg);
    return true;
}

//# sourceMappingURL=data:application/json;charset=utf-8;base64,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UCxDQUFlLE9BQWYsRUFBd0IsRUFBeEIsQ0FBMkIsTUFBM0IsRUFBbUMsT0FBbkM7QUFDdEIsMENBQWdCLElBQWhCLHNCQUFnQyxLQUFoQztBQUNIO0FBUmUsaUJBQVQsQ0FBUDtBQVNIO0FBakJFLFNBQVA7QUFtQkgsS0FyREQ7QUFzREgsQzs7QUF2RUQ7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBc0VBLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0QixLQUE1QixFQUFrQztBQUM5QixRQUFNLFFBQVEsQ0FBQyxPQUFELEVBQVUsUUFBVixDQUFkO0FBQ0EsUUFBTSw0QkFBMEIsS0FBMUIscUJBQStDLE1BQU0sSUFBTixDQUFXLEdBQVgsQ0FBL0MsZ0JBQXlFLElBQS9FO0FBQ0EsUUFBSSxNQUFNLE9BQU4sQ0FBYyxJQUFkLE1BQXdCLENBQUMsQ0FBN0IsRUFBZ0MsTUFBTSxJQUFJLEtBQUosQ0FBVSxHQUFWLENBQU47QUFDaEMsV0FBTyxJQUFQO0FBQ0giLCJmaWxlIjoiY3ljbGUtZmVhdGhlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCAkIGZyb20gJ3hzdHJlYW0nO1xuaW1wb3J0IEZlYXRoZXJzIGZyb20gJ2ZlYXRoZXJzLWNsaWVudCc7XG5pbXBvcnQgRGVidWcgZnJvbSAnZGVidWcnO1xuaW1wb3J0IFZhbGlkYXRlIGZyb20gJ0BnaWsvdmFsaWRhdGUnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChzb2NrZXQpe1xuXG4gICAgaWYgKCFzb2NrZXQpIHRocm93IG5ldyBFcnJvcignRXhwZWN0aW5nIGEgc29ja2V0IGNvbm5lY3Rpb24nKTtcblxuICAgIGNvbnN0IGRlYnVnID0gRGVidWcoJ2ZlYXRoZXJzOmRyaXZlcicpO1xuXG4gICAgY29uc3QgY2xpZW50ID0gRmVhdGhlcnMoKVxuICAgICAgICAuY29uZmlndXJlKEZlYXRoZXJzLmhvb2tzKCkpXG4gICAgICAgIC5jb25maWd1cmUoRmVhdGhlcnMuc29ja2V0aW8oc29ja2V0KSlcblxuICAgIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgYSBTaW5rIFN0cmVhbSBhbmQgcmV0dXJucyBhIHNvdXJjZS5cbiAgICByZXR1cm4gZnVuY3Rpb24gKHNpbmskKSB7XG5cbiAgICAgICAgLy8gUHJvY2VzcyB0aGUgcmVjZWl2ZWQgc2luayBzdHJlYW0uXG4gICAgICAgIC8vIC0gZW1pdHMgdGhlIHNwZWNpZmllZCBtZXRob2Qgb24gdGhlIHNvY2tldCBzZXJ2aWNlXG4gICAgICAgIC8vIC0gdHJpZ2dlcnMgYSBsb2NhbCBldmVudCB0aGF0IGNhbiBiZSBsYXRlciBzZWxlY3RlZCBmcm9tIHRoZSBzb3VyY2VzLlxuICAgICAgICBzaW5rJFxuICAgICAgICAgICAgLm1hcChzaW5rID0+IHtcbiAgICAgICAgICAgICAgICBWYWxpZGF0ZShzaW5rLCB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2U6eyB0eXBlOlN0cmluZywgcmVxdWlyZWQ6dHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6eyB0eXBlOlN0cmluZywgcmVxdWlyZWQ6dHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICBhcmdzOnsgdHlwZTpBcnJheSwgdmFsdWU6W10gfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gYCR7c2luay5zZXJ2aWNlfTo6JHtzaW5rLm1ldGhvZH1gO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlcnZpY2UgPSBjbGllbnQuc2VydmljZShzaW5rLnNlcnZpY2UpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IHNlcnZpY2Vbc2luay5tZXRob2RdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBzaW5rLmFyZ3MgfHwgW107XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgIT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBtZXRob2QgJyR7c2luay5tZXRob2R9JyBmb3IgJHtzaW5rLnNlcnZpY2V9YCk7XG4gICAgICAgICAgICAgICAgZGVidWcoYHNpbmsgcmVxdWVzdCDihpIgJHtldmVudH1gLCBhcmdzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJFxuICAgICAgICAgICAgICAgICAgICAuZnJvbVByb21pc2Uoc2VydmljZVtzaW5rLm1ldGhvZF0oLi4uYXJncykpXG4gICAgICAgICAgICAgICAgICAgIC5tYXAocmVzcG9uc2UgPT4gKHsgLi4uc2luaywgcmVzcG9uc2UsIGV2ZW50IH0pKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5mbGF0dGVuKClcbiAgICAgICAgICAgIC5hZGRMaXN0ZW5lcih7XG4gICAgICAgICAgICAgICAgZXJyb3I6IGVycm9yID0+IHsgdGhyb3cgZXJyb3IgfSxcbiAgICAgICAgICAgICAgICBuZXh0IDogc2luayA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVtaXQgbG9jYWxseVxuICAgICAgICAgICAgICAgICAgICBkZWJ1Zyhgc2luayByZXNwb25zZSDihpIgJHtzaW5rLmV2ZW50fWAsIHNpbmsucmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICBjbGllbnQuZW1pdChzaW5rLmV2ZW50LCBzaW5rLnJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuXG4gICAgICAgIC8vIFRoZSBzb3VyY2Ugc3RyZWFtIHRoYXQgd2lsbCBoYW5kbGUgdGhlIGludGVudHNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNlbGVjdDogc2VsZWN0b3IgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgdHlwZSwgc2VydmljZSwgbWV0aG9kIH0gPSBWYWxpZGF0ZShzZWxlY3Rvciwge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlOnsgdHlwZTpTdHJpbmcsIHJlcXVpcmVkOnRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOnsgdHlwZTpTdHJpbmcsIHJlcXVpcmVkOnRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTp7IHR5cGU6U3RyaW5nLCByZXF1aXJlZDp0cnVlIH0sXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IGAke3NlcnZpY2V9Ojoke21ldGhvZH1gO1xuICAgICAgICAgICAgICAgIHJldHVybiAkLmNyZWF0ZSh7IHN0b3AoKXt9LCBzdGFydChsaXN0ZW5lcil7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWJ1Zyhgc291cmNlICR7dHlwZX06ZW1pdHRlZCDihpIgJHtzZXJ2aWNlfTo6JHttZXRob2R9YCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXIubmV4dChyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdsb2NhbCcpIGNsaWVudC5vbihldmVudCwgaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09ICdzb2NrZXQnKSBjbGllbnQuc2VydmljZShzZXJ2aWNlKS5vbihtZXRob2QsIGhhbmRsZXIpO1xuICAgICAgICAgICAgICAgICAgICBkZWJ1Zyhgc291cmNlICR7dHlwZX06YWRkZWQg4oaSICR7ZXZlbnR9YClcbiAgICAgICAgICAgICAgICB9fSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIHR5cGVWYWxpZGF0ZSh0eXBlLCBldmVudCl7XG4gICAgY29uc3QgdHlwZXMgPSBbJ2xvY2FsJywgJ3NvY2tldCddO1xuICAgIGNvbnN0IG1zZyA9IGBJbnZhbGlkIHR5cGUgZm9yICR7ZXZlbnR9LCBleHBlY3RpbmcgWyR7dHlwZXMuam9pbignLCcpfV07IGdvdDogJHt0eXBlfWA7XG4gICAgaWYgKHR5cGVzLmluZGV4T2YodHlwZSkgPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==