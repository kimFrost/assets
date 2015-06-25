(function (undefiend) {
	'use strict';

	angular
		.module('noerd.BrugSkallen')
		.directive('lazysrc', [lazysrc]);

	function lazysrc() {
		var directive = {
			replace: false,
			link: link,
			scope: {
        url: '@lazysrc',
        doLoad: '@lazysrcLoad'
      },
			restrict: 'A',
			controller: controller,
			controllerAs: 'lazysrc',
			bindToController: true
		};
		return directive;

		function link(scope, element, attrs) {
      //console.log('-->', scope.doLoad);
		}

		// Inject dependecies to controller
		//controller.$inject = ['$element'];

		/* @ngInject */
		function controller($scope, $element, $attrs) {
		    /*jshint validthis: true */
			var lazysrc = this;
      lazysrc.options = {};
      lazysrc.elem = $element;
      lazysrc.states = {
        loaded: false
      };

      $scope.$watch(function () {
        return this.doLoad;
      }.bind(this), function(newVal) {
        if (newVal === true || newVal === 'true') {
          $element.attr('src', this.url);
        }
      }.bind(this));

      /*
      // This also works
      $scope.$watch('lazysrc.doLoad', function(newval, oldval) {
        console.log('doLoad', newval);
        if (newval === true || newval === 'true') {
          console.log('doLoad REpLACE');
          $element.attr('src', lazysrc.url);
        }
      });
      */

		}
	}
})();

