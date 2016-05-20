/*global Rainbow, document, flipCounter */
(function () {
    'use strict';
    Rainbow.color();
    var editorsCounter = new flipCounter('editors-flip-counter', { auto: false }),
        visitorsCounter = new flipCounter('visitors-flip-counter', { auto: false }),
        incrementSlides = document.querySelectorAll('.increment');

    document.querySelector('.counters-trigger').addEventListener('click', function () {
        editorsCounter.incrementTo(300000, 2, 123);
        visitorsCounter.incrementTo(1200000, 3, 123);
    });

}());

(function (doc) {
    'use strict';
    var ngLogo = [
            [0, 0, 2000, 0],
            [2000, 100, 0, 100]
            /*[0, 0, 235, 85],
            [235, 85, 200, 385],
            [200, 385, 0, 500],
            [0, 500, -200, 385],
            [-200, 385, -235, 85],
            [-235, 85, 0, 0],
            [-145, 365, 0, 50],
            [0, 50, 145, 365]*/
        ],
        scale = 6,
        freeLength = 0,
        segments = [],
        currentIndex = 0,
        prevX = 0,
        prevY = 0,
        independantSlides = doc.querySelectorAll('.step'),
        unplacedSlides = independantSlides.length,
        allSlides = doc.querySelectorAll('.step');

    ngLogo = ngLogo.map(function (element) {
        return [
            element[0] * scale,
            element[1] * scale,
            element[2] * scale,
            element[3] * scale
        ];
    });

    ngLogo.forEach(function (seg, index) {
        var segment = {
            start: { x: seg[0], y: seg[1] },
            end: { x: seg[2], y: seg[3] }
        };
        segment.dx = segment.end.x - segment.start.x;
        segment.dy = segment.end.y - segment.start.y;
        segment.length = Math.sqrt(Math.pow(segment.dx, 2) + Math.pow(segment.dy, 2));
        segments.push(segment);
        freeLength += segment.length;
    });

    segments.forEach(function (segment, index) {
        var nbSlideInSegment = Math.round((segment.length / freeLength) * unplacedSlides),
            cumulativeX = segment.start.x,
            cumulativeY = segment.start.y,
            stepX = segment.dx / nbSlideInSegment,
            stepY = segment.dy / nbSlideInSegment,
            i = 0;

        unplacedSlides -= nbSlideInSegment;
        freeLength -= segment.length;
        for (i = 0; i < nbSlideInSegment; i++) {
            if (!allSlides[currentIndex]) {
                continue;
            }
            allSlides[currentIndex].setAttribute('data-x', cumulativeX);
            allSlides[currentIndex].setAttribute('data-y', cumulativeY);
            prevX = cumulativeX;
            prevY = cumulativeY;
            cumulativeX = cumulativeX + stepX;
            cumulativeY = cumulativeY + stepY;
            currentIndex++;

        }
    });


}(document));

(function () {
    'use strict';
    var impressApi = impress(),
        currentStep = null,
        moveSubstep = function (element, direction) {
            if (!element) { return false; }
            if (!element.dataset.steps) { return false; }
            var dataset = element.dataset,
                nbSteps = parseInt(dataset.steps, 10),
                currentStep = parseInt(dataset.current, 10) || 0,
                destStep = currentStep + direction;

            if (destStep < 0 || destStep > nbSteps) { return false; }
            dataset.current = destStep;
            if (direction < 0) {
                element.classList.remove('inc-' + currentStep);
            } else {
                element.classList.add('inc-' + destStep);
            }
            return true;
        };

    impressApi.init();

    document.addEventListener("keyup", function ( event ) {
        if ( ( event.keyCode > 32 && event.keyCode <= 34 ) || (event.keyCode >= 37 && event.keyCode <= 40) ) {
            switch( event.keyCode ) {
                case 33: // pg up
                case 37: // left
                case 38: // up
                    if (!moveSubstep(currentStep, -1)) {
                        currentStep = impressApi.prev();
                    }
                    break;
                case 9:  // tab
                case 32: // space
                case 34: // pg down
                case 39: // right
                case 40: // down
                    if (!moveSubstep(currentStep, 1)) {
                        currentStep = impressApi.next();
                    }
                    break;
            }

            event.preventDefault();
        }
    }, false);
 
}());

(function (document, angular) {
    'use strict';
    angular
        .module('services', [])
        .factory('dataManager', function () {
            return {
                datas: [],
                add: function (element) {
                    if (this.datas.length >= 3) {
                        return window.alert('dataManager dit : STOP je n\'ajouterai rien de plus');
                    }
                    this.datas.push(element);
                }
            };
        })
        .controller('firstController', ['$scope', 'dataManager', function (scope, dataManager) {
            scope.elements = dataManager.datas;
            scope.addElement = function (element) {
                dataManager.add(element);
            };
        }])
        .controller('secondController', ['$scope', 'dataManager', function (scope, dataManager) {
            scope.things = dataManager.datas;
            scope.addThing = function (thing) {
                dataManager.add(thing);
            };
        }]);

    angular
        .module('twoWay', [])
        .run(['$rootScope', function (rootScope) {
            rootScope.widget = {};
        }])
        .filter('stringify', function () {
            return function (input) { return JSON.stringify(input, null, 2); };
        });

    angular
        .module('dybBinding', ['ngAnimate'])
        .controller('mainController', ['$scope', '$timeout', function (scope, timeout) {
            var timer = null,
                render = function () {
                    scope.$request = true;
                    timeout(function () {
                        scope.$request = false;
                        scope.$response = true;

                        timeout(function () {
                            scope.$response = false;
                            scope.widget.$view = '<h3>' + scope.widget.title + '</h3>' +
                                '<ul><li>' + (scope.widget.detail1 || '') + '</li>' +
                                '<li>' + (scope.widget.detail2 || '') + '</li></ul>';
                        }, 4000);

                    }, 4000);
                },
                watchChange = function (newValue) {
                    if (!newValue) { return; }
                    if (timer) { timeout.cancel(timer); }
                    timer = timeout(render, 1000);
                };

            scope.widget = {};

            scope.$watch('widget.title', watchChange);
            scope.$watch('widget.description', watchChange);
        }])
        .filter('stringify', function () {
            return function (input) {
                var copy = angular.copy(input);
                if (copy.$view && copy.$view.length > 15) {
                    copy.$view = copy.$view.substr(0, 15) + "...";
                }
                return JSON.stringify(copy, null, 2);
            };
        })
        .filter('trustAsHtml', ['$sce', function (sce) {
            return function (input) { return sce.trustAsHtml(input); };
        }]);

    angular.bootstrap(document.getElementById('two-way-demo-app'), ['twoWay']);
    angular.bootstrap(document.getElementById('dyb-binding-demo-app'), ['dybBinding']);
    angular.bootstrap(document.getElementById('services-demo-app'), ['services']);

}(document, angular));
