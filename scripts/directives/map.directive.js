(function (undefiend) {
	'use strict';

	angular
		.module('noerd.Hjemis.FangIsBilen.Web')
		.directive('map', [map]);

	function map() {
		var directive = {
			replace: true,
			link: link,
			scope: {
				width: '@width',
				height: '@height',
				type: '@type',
				coords: '=coords',
				markerlist: '=markerlist'
			},
			template: '<div></div>',
			restrict: 'A',
			controller: controller,
			controllerAs: 'map',
			bindToController: true
		};
		return directive;

		function link(scope, element, attrs) {}

		/* @ngInject */
		function controller($scope, $element, $attrs, $http, $interval) {
		    /*jshint validthis: true */
			var map = this;
			map.options = {

			};
			map.width = map.width || '200';
			map.height = map.height || '200';
			map.type = map.type || 'overview';
			map.map = null;
			map.overlay  = null;
			map.infowindow = null;
			map.markerCluster = null;
			map.markers = [];
			map.currentMarkers = [];
			//map.css = {};
			map.states = {
        loaded: false,
				pendingImage: false
      };


			// Listen to changes in scope variables and update the control
			var arr = ['this.width', 'this.height'];
			for (var i = 0, cnt = arr.length; i < arr.length; i++) {
				watchValue(arr[i]);
			}
			function watchValue(prop) {
				$scope.$watch(function () {
					return prop;
				}.bind(this), function(newVal) {
					if (newVal) {
						updateControl();
					}
				}.bind(this));
			}

			// Watch the two way binding of coords
			$scope.$watch(function () {
				return this.coords;
			}.bind(this), function(newVal) {
				if (newVal) {
					if (map.type === 'picker') {
						if (newVal.lat() !== undefiend && newVal.lng() !== undefiend) {
							if (map.currentMarkers[0].getPosition() !== newVal) {
								var latLng = new google.maps.LatLng(newVal.lat(), newVal.lng());
								map.currentMarkers[0].setPosition(latLng);
								map.map.setCenter(latLng);
								//map.map.setZoom(11);
							}
						}
					}
					else if (map.type === 'deliveries') {

					}
				}
			}.bind(this));

			// Watch the two way binding of markerlist
			$scope.$watch(function () {
				return this.markerlist;
			}.bind(this), function(newVal, oldVal) {
				if (newVal) {
					map.markers = newVal;
					updateMarkers();
				}
			}.bind(this));


			// Broadcast events
			$scope.$on('map:resize', function (e, id) {
				google.maps.event.trigger(map.map, 'resize');
				map.map.setCenter(new google.maps.LatLng(56.1, 10.277710));
			});


			/** FUNCTIONS */
			// Update Map Parameters
			var updateControl = function() {
				updateMarkers();
			}.bind(this);

			var updateMarkers = function() {
				var i;
				// Remove all markers
				for (i = 0; i < this.currentMarkers.length; i++) {
					map.currentMarkers[i].setMap(null);
				}
				map.currentMarkers = [];

				for (i = 0; i < map.markers.length; i++) {
					var m = map.markers[i];
					var mm = new google.maps.Marker(m);

					//mm.setMap(map.map); // If set, then all thumbs will be loaded at start

					if (this.type === 'overview') {
						google.maps.event.addListener(mm , 'click', function() {
							var imageUrl = this.image;
							var content = '<a href="' + imageUrl + '" target="_blank"><img src="' + imageUrl + '" style="width:100%;" /></a>';
							map.infowindow.setContent(content);
							map.infowindow.open(map.map, this);
							//map.map.setCenter(this.getPosition());
						});
					}
					else if (this.type === 'picker') {
						google.maps.event.addListener(mm , 'dragend', function() {
							var position = this.getPosition();
							$scope.$apply(function() {
								map.coords = position;
							});
						});
					}
					else if (this.type === 'deliveries') {
						google.maps.event.addListener(mm , 'click', function() {
							var position = this.getPosition();

						});
					}

					this.currentMarkers.push(mm);
				}

				var clusterStyles = [
					{
						textColor: 'white',
						url: '/images/icon-marker-small.png',
						height: 33,
						width: 33
					},
					{
						textColor: 'white',
						url: '/images/icon-marker.png',
						height: 44,
						width: 44
					},
					{
						textColor: 'white',
						url: '/images/icon-marker-large.png',
						height: 55,
						width: 55
					}
				];
				var clusterOptions = {
					gridSize: 15,
					styles: clusterStyles,
					maxZoom: 12
				};
				// At lease over 20 markers for clustering to be used
				if (this.currentMarkers.length > 1) {
					map.markerCluster = new MarkerClusterer(map.map, this.currentMarkers, clusterOptions);
				}
				else {
					for (i = 0; i < this.currentMarkers.length; i++) {
						map.currentMarkers[i].setMap(map.map);
					}
				}
			}.bind(this);


			/** INITIATE */
			var options = {};
			var image = {};
			var marker = {};

			if (map.type === 'picker') {
				options = {
					center: new google.maps.LatLng(56.1, 10.277710),
					zoom: 7,
					mapTypeId: 'roadmap'
				};
				image = {
					url: '/images/icon-marker.png',
					width: 44,
					height: 44
				};
				marker = {
					name: 'Your image',
					position: new google.maps.LatLng(56.1, 10.277710),
					icon: image,
					image: 'http://placehold.it/600x450',
					draggable: true
				};
				map.markers.push(marker);
				map.coords = marker.position;
			}
			else if (map.type === 'overview') {
				options = {
					center: new google.maps.LatLng(56.1, 10.277710),
					zoom: 7,
					mapTypeId: 'roadmap'
				};
			}

			else if (map.type === 'deliveries') {
				options = {
					center: new google.maps.LatLng(56.1, 10.277710),
					zoom: 7,
					mapTypeId: 'roadmap'
				};
			}


			// create the map
			map.map = new google.maps.Map($element[0], options);
			map.infowindow = new google.maps.InfoWindow({
				maxWidth: 350
				//maxHeight: 250
			});


			/*
			$interval(function() {
				console.log('redraw');
				google.maps.event.trigger(map.map, 'resize');
			}, 10000);

			google.maps.event.addListener(map, 'bounds_changed', function() {
				var bounds = map.getBounds();
			}
			*/

			/*
			google.maps.event.addListener(map.map, 'bounds_changed', function() {
				//var bounds = map.map.getBounds();
				console.log('..............>');
				google.maps.event.trigger(map.map, 'resize');
			});
			*/



			// Draw markders
			updateControl();

		}
	}
})();

