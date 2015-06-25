(function (undefined) {
	'use strict';

	/**
	 * @ngdoc overview
	 * @name noerd.Tingstrom.Web - MainController
	 * @description
	 * # noerd.Tingstrom.Web
	 *
	 * Main module of the application.
	 */

	angular
		.module('noerd.Tingstrom.Web')
		.controller('MainCtrl', MainCtrl);

	/* @ngInject */
	function MainCtrl($rootScope, $scope, $window, $cookies, $timeout, $http, $sce, $q) {

		var main = this;
		main.options = {
			debug: true,
			headerHeight: 60
		};
		main.deboundTimer = null;
		main.states = {
			pending: false,
			success: false,
			error: false,
			cookiesAccepted: cookiesAccepted(),
			showOverlay: false,
			collapseHeader: false
		};


		// Public functions
		main.validateForm = validateForm;
		main.acceptCookies = acceptCookies;


		// Utilities
		function debounce(func, time) {
			$timeout.cancel(main.deboundTimer);
			main.deboundTimer = $timeout(function() {
				func();
			}, time);
		}


		// Form functions
		function validateForm(formData) {
			var valid = false;
			// Make it dirty
			if (formData.$error.required !== undefined) {
				for (var i = 0; i < formData.$error.required.length; i++) {
					var required = formData.$error.required[i];
					required.$setViewValue(required.$viewValue);
					required.$setDirty();
				}
			}
			// Is it valid
			if (formData.$valid) {
				valid = formData.$valid;
			}
			return valid;
		}


		// Cookie functions
		function cookiesAccepted() {
			return $cookies.cookiesAccepted;
		}

		function acceptCookies() {
			$cookies.cookiesAccepted = true;
			main.states.cookiesAccepted = true;
		}


		// Debug log
		function log(msg1, msg2) {
			msg1 = (msg1 === undefined) ? null : msg1;
			msg2 = (msg2 === undefined) ? null : msg2;
			if (main.options.debug) {
				if (msg2 !== null) {
					try {
						console.log(msg1, msg2);
					}
					catch (err) {

					}
				}
				else {
					try {
						console.log(msg1);
					}
					catch (err) {

					}
				}
			}
		}



		// BINDINGS
		angular.element($window).bind('scroll', function(event) {
			log('scrollY', $window.scrollY);
			var scrollY = $window.scrollY;
			if (scrollY > main.options.headerHeight && !main.states.collapseHeader) {
				$scope.$apply(function() {
					main.states.collapseHeader = true;
				});
			}
			else if (scrollY <= main.options.headerHeight && main.states.collapseHeader){
				$scope.$apply(function() {
					main.states.collapseHeader = false;
				});
			}
		});


	}
})();
