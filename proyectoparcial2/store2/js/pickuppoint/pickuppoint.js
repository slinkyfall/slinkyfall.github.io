var PickupPointManager = (function () {
    var getDistanceString = function (x) {
        x = parseFloat(x);
        var distanceString;
        if (x < 0.01) {
            distanceString = "0.01 km"
        } else if (0.01 <= x && x < 0.1) {
            distanceString = x.toFixed(2) + " km";
        } else if (0.1 <= x && x < 1) {
            distanceString = x.toFixed(1) + " km";
        } else {
            distanceString = x.toFixed(0) + " km";
        }
        return distanceString;
    };

    Ajax.Responders.register({
        onException: function (xhr, e) {
            console.error(e);
        }
    });

    var k = Class.create();
    k.prototype = {
        initialize: function (changeMethodUrl, locationKiosksUrl) {
            this.changeMethodUrl = changeMethodUrl;
            this.locationKiosksUrl = locationKiosksUrl;

            this.kiosks = [];
            this.markers = [];
            this.location = null;
            this.map = null;

            this.openedInfoWindow = null;
            this.openedInfoWindowIndex = null;

            this.onInit = null;
            this.onSearchStart = null;
            this.onSearchEnd = null;
            this.onSelectPoint = null;

            this.minZoom = 9;

            this.defaultPos = {
                lat: 45.465311,
                lng: 9.186352
            };

            this.setUpHook();
        },

        setUpHook: function () {
            // validation of PickupPoint selection
            Shipping.prototype.save = Shipping.prototype.save.wrap(function(parent){
                var rdUseShippingPoint = $('billing:use_for_shipping_point');
                if(rdUseShippingPoint && rdUseShippingPoint.checked) {
                    if($('shipping:pup_id_pdv').value == '') {
                        alert(Translator.translate("You should select one of available pick-up points to continue"));
                        return false;
                    }
                }

                parent();
            }) ;
        },

        rebound: function () {
            var i,
                bounds;

            if (!this.markers.length)
                return;

            bounds = new google.maps.LatLngBounds();

            if (this.location)
                bounds.extend(this.location.getPosition());

            for (i = 0; i < this.markers.length; i++)
                bounds.extend(this.markers[i].getPosition());

            this.map.fitBounds(bounds);
        },

        _clearMarkers: function () {
            while (this.markers.length) {
                this.markers.pop().setMap(null);
            }

            Element.childElements($("items")).each(Element.remove);
            Element.childElements($("items-mobile")).each(Element.remove);
        },

        _switchInfoWindow: function (index) {
            if (this.openedInfoWindowIndex === index) {
                return;
            }

            if (this.openedInfoWindow) {
                this.openedInfoWindow.close();
            }

            this.openedInfoWindow = this._getKioskInfoWindow(index);
            this.openedInfoWindowIndex = index;

            if (this.openedInfoWindow) {
                var marker = this.markers[index];
                this.map.setCenter(marker.position);
                this.openedInfoWindow.open(this.map, marker);
            }
        },

        _getKioskInfoWindow: function (index) {
            if (index !== 0 && !index) {
                return null;
            }

            if (index === this.openedInfoWindowIndex) {
                return this.openedInfoWindow;
            }

            var markerData = this._getKioskModel(index, this.kiosks[index]);

            var contentTemplate = new Template("<div class='kiosks_item'>"
                + "<span class='kiosks_link'>#{name}</span>"
                + "<p class='kiosks_address'>#{address}</p>"
                + "<p class='kiosks_address'>#{zip} - #{city} (#{country})</p>"
                + "<p class='kiosks_address'>~#{distance}</p>"
                + '<button type="button" class="button kiosk-select" data-marker-id="#{markerID}">Consegna qui</button>'
                + "</div>"
            );

            var content = contentTemplate.evaluate(markerData);

            var infoWindow = new google.maps.InfoWindow({
                content: content
            });

            return infoWindow;
        },

        _createMarker: function (index, kiosk) {
            var caller = this;

            var position = {
                lat: parseFloat(kiosk.kiosk_latitude),
                lng: parseFloat(kiosk.kiosk_longitude)
            }

            var marker = new google.maps.Marker({
                position: position,
                map: this.map,
                title: kiosk.kiosk_name
            });

            this.markers.push(marker);

            google.maps.event.addListener(marker, 'click', function () {
                caller._switchInfoWindow(index);
            });
        },

        _getKioskModel: function (index, kiosk) {
            return {
                markerID: index,
                id_pdv: kiosk.id_pdv_mdis,
                latitude: parseFloat(kiosk.kiosk_latitude),
                longitude: parseFloat(kiosk.kiosk_longitude),
                name: kiosk.kiosk_name,
                address: kiosk.kiosk_address,
                city: kiosk.kiosk_city,
                zip: kiosk.kiosk_zip,
                country: kiosk.kiosk_country,
                distance: getDistanceString(kiosk.distance_km)
            };
        },

        _createListItem: function (index, kiosk) {
            var model = this._getKioskModel(index, kiosk);

            var template = new Template("<div class='kiosks_item'>"
                + "<a href='#' data-marker-id='#{markerID}' class='kiosks_link js-kiosks-link'>#{name}</a>"
                + "<p class='kiosk_address'>#{address}</p>"
                + "<p class='kiosk_address'>#{zip} - #{city} (#{country})</p>"
                + "<p class='kiosk_address'>#{distance}</p>"
                + "</div>"
            );

            var content = template.evaluate(model);
            $("items").insert(content);


            var templateMobile = new Template("<option value='#{markerID}' class='kiosks-option'>#{name}</option>");

            var contentMobile = templateMobile.evaluate(model);
            $("items-mobile").insert(contentMobile);
        },

        setKiosks: function (kiosks) {
            this._clearMarkers();

            this.kiosks = kiosks;

            // clear desktop list
            Element.childElements($('items')).each(Element.remove);
            $('items').insert('<div class="kiosks_list_title">Edicole trovate<br/>(ordinate per vicinanza)</div>');

            // clear mobile list
            Element.childElements($('items-mobile')).each(Element.remove);
//            $$('#items-mobile-container .kiosks_list_title').each(Element.remove);
            $('items-mobile-container').insert({top: '<div class="kiosks_list_title">Edicole trovate<br/>(ordinate per vicinanza)</div>'});

            for (var i = 0; i < kiosks.length; i++) {
                this._createMarker(i, kiosks[i]);
                this._createListItem(i, kiosks[i]);
            }
        },

        selectKiosk: function (idx) {
            this._switchInfoWindow();

            if (typeof(this.onSelectPoint) === 'function')
                this.onSelectPoint.call(this, this.kiosks[idx]);
        },

        initMap: function (container) {
            if(this.map !== null)
                return;

            var mapOptions = {
                    minZoom: this.minZoom,
                    maxZoom: 17,
                    zoom: this.minZoom,
                    center: new google.maps.LatLng(41.9000, 12.4833)
                },
                caller = this;

            Event.observe(container, 'click', function (event) {
                var target = Event.findElement(event);

                // handles kiosk selection
                if (target.hasClassName('kiosk-select')) {
                    Event.stop(event);
                    caller.selectKiosk(parseInt(target.readAttribute('data-marker-id')));
                }
            });

            Event.observe('items', 'click', function (event) {
                var target = Event.findElement(event);

                // handle list item selection
                if (target.hasClassName('js-kiosks-link')) {
                    Event.stop(event);
                    caller._switchInfoWindow(parseInt(target.readAttribute('data-marker-id')));
                }
            });

//            this.openedInfoWindow = new google.maps.InfoWindow();

            this.map = new google.maps.Map(document.getElementById(container), mapOptions);
            this.map.addListener('dragend', function () {
                var center = caller.map.getCenter();
                caller.getByLocation({
                    lat: center.lat(),
                    lng: center.lng()
                });
            });

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    caller.navigateTo({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                }, function () {
                    caller.navigateTo(caller.defaultPos);
//                handleLocationError(true, info, map.getCenter());
                });
            } else {
                caller.navigateTo(caller.defaultPos);
//            handleLocationError(false, info, map.getCenter());
            }

            this._initSearch();

            if (typeof(this.onInit) === 'function')
                this.onInit.call(this);
        },

        _initSearch: function () {
            var input = document.getElementById('pac-input');

            //var searchBox = new google.maps.places.SearchBox(input, options);
            var searchBox = new google.maps.places.Autocomplete(input, {
                types: ['geocode'],
                componentRestrictions: {country: 'it'}
            });

            this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            searchBox.bindTo('bounds', this.map);

            var infowindow = new google.maps.InfoWindow();
            var marker = new google.maps.Marker({
                map: this.map,
                anchorPoint: new google.maps.Point(0, -29)
            });

            //Bias the SearchBox results towards current map's viewport.
            /*map.addListener('bounds_changed', function() {
             searchBox.setBounds(map.getBounds());
             });*/

            var that = this;

            // Listen for the event fired when the user selects a prediction and retrieve
            // more details for that place.
            searchBox.addListener('place_changed', function () {
                var places = searchBox.getPlace();
                if (places.length === 0) {
                    return;
                }

                infowindow.close();
                marker.setVisible(false);

                var place = searchBox.getPlace();
                if (!place.geometry) {
                    window.alert("Selezionare un luogo dalla tendina.");
                    return;
                }

                that.navigateTo({
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                });
            });
        },

        // _createKiosks: function () {
        //     this._clearMarkers();
        //
        //     $('#items').append('<div class="kiosks_list_title">Edicole trovate (ordinate per vicinanza)</div>');
        //     $('#items-mobile-container .kiosks_list_title').remove();
        //     $('#items-mobile-container').prepend('<div class="kiosks_list_title">Edicole trovate (ordinate per vicinanza)</div>');
        //
        //     for (var i = 0; i < locations.length; i++) {
        //         createMarker(i, locations[i]);
        //         createListItem(i, locations[i]);
        //     }
        //
        //     if (!currentFound && !isEmpty(current)) {
        //         createMarker(markers.length, current);
        //         createListItem(markers.length, current);
        //     }
        //     initLinkTrigger();
        //     $('#items').removeClass('loading');
        // },

        navigateTo: function (pos) {
            this.getByLocation(pos, this.rebound);
            this.map.setZoom(this.minZoom);
            this.map.setCenter(pos);
        },

        getByLocation: function (pos, cb) {
            if (typeof(this.onSearchStart) === 'function')
                this.onSearchStart.call(this);

            var url = this.locationKiosksUrl + 'lat/' + pos.lat + '/lng/' + pos.lng;

            var that = this;
            new Ajax.Request(url, {
                onComplete: function () {
                    if (typeof(that.onSearchEnd) === 'function')
                        that.onSearchEnd.call(that, that.kiosks);
                },
                onSuccess: function (transport) {
                    var json = transport.responseText.evalJSON();

                    if (json.error) {
                        alert(json.message ? json.message : Translator.translate('Error'));
                        return;
                    }

                    that.setKiosks(json.kiosks);

                    if (typeof(cb) === 'function') {
                        cb.call(that);
                    }
                }
            });
        },

        setLocation: function (lat, lng) {
            this.location = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: this.map,
                icon: this.mediaUrl + 'marker_location.png',
                shadow: 'https://chart.googleapis.com/chart?chst=d_map_pin_shadow'
            });

            this.rebound();
        },

        locate: function (address) {
            var url = this.locationUrl,
                caller = this;

            if (this.location) {
                this.location.setMap(null);
                this.location = null;
            }

            url = url + 'address/' + address;

            new Ajax.Request(url, {
                onSuccess: function (transport) {
                    var json = transport.responseText.evalJSON();

                    if (json.error) {
                        return;
                    }

                    caller.setLocation(json.latitude, json.longitude);
                }
            });
        },

        search: function (address, radius) {
            var url = this.locationKiosksUrl,
                caller = this;

            if (typeof(this.onSearchStart) === 'function')
                this.onSearchStart.call(this);

            this.locate(address);

            url = url + 'address/' + address + '/radius/' + radius;

            new Ajax.Request(url, {
                onComplete: function () {
                    if (typeof(caller.onSearchEnd) === 'function')
                        caller.onSearchEnd.call(caller, caller.points);
                },
                onSuccess: function (transport) {
                    var json = transport.responseText.evalJSON();

                    if (json.error) {
                        alert(json.message ? json.message : Translator.translate('Error'));
                        return;
                    }

                    caller.setKiosks(json.points);
                }
            });
        },

        initGoogleMap: function (scriptUrl, container) {
            if (!window.google || !google.maps)
                this.loadGoogleMap(scriptUrl, container);
            else
                this.initMap(container);
        },

        loadGoogleMap: function (scriptUrl, container) {
            var script = document.createElement('script'),
                functionName = 'initMap' + Math.floor(Math.random() * 1000001),
                caller = this;

            window[functionName] = function () {
                caller.initMap(container);
            };

            script.type = 'text/javascript';
            script.src = scriptUrl + '&callback=' + functionName;
            document.body.appendChild(script);
        },

        setUseStorePickup: function (flag) {
            var url = this.changeMethodUrl;

            if (flag)
                url += 'flag/1';
            else
                url += 'flag/0';

            var request = new Ajax.Request(url, {method: 'get', onFailure: ""});
        }
    };

    return k;
})();

//
// Validation.add('validate-pup-id-pdv', 'Please select kiosk!', function(v, el) {
//     return !Validation.get('IsEmpty').test(v);
// })
