window.markers = [];
window.infowindows = [];

jQuery(document).ready(function (){
    addDivs();

    //for opc
    if(orderProcess == 'order-opc') {
        jQuery(document).ajaxComplete(function (event, xhr, settings) {
            url = settings.url;
            if (!url.includes('dpdbenelux')) {
                if( window.parcelShops == undefined ||  window.parcelShops == null){
                    getParcelShops(true);
                }else{
                    jQuery('[id^="delivery_option_"]').each(function () {
                        if (jQuery(this).prop("checked")) {
                            if (this.value == parcelshopId + ',') {
                                DpdInitGoogleMaps();
                                initMap();
                                jQuery('#parcelshops').show();
                                addChosen(cookieParcelId);
                                jQuery('.selected-parcelshop').show();
                            }
                        }
                    });
                }
            }
        });
    }

    if(jQuery('.delivery_options').length !== 0 ) {
        if (!saturdaySenderIsAllowed) {
            jQuery('#opc_delivery_methods input.delivery_option_radio').each(function () {
                if (this.value === saturdaySender + ',' || this.value === classicSaturdaySender + ',') {
                    jQuery(this).parent().parent().parent().parent().remove();
                };
            });
        }

        jQuery("#page").on('change', '.delivery_option_radio', function () {
            if (jQuery(this).prop("checked")) {
                if (this.value == parcelshopId + ',') {

                    jQuery('#parcelshops').show();
                    jQuery('.selected-parcelshop').show();

                } else {
                    jQuery('#parcelshops').hide();
                    jQuery('.selected-parcelshop').hide();
                }
            }
        });

        jQuery("#page").on("click", ".ParcelShops", function () {
            jQuery.post(baseUri + 'module/dpdbenelux/OneStepParcelshop', {
                'method': 'setParcelShop',
                'parcelId' : this.id,
            }, function (id) {
                cookieParcelId = id;
                addChosen(id);
                jQuery('.selected-parcelshop').show();
            });


        });
        getParcelShops(false);
    }


}); // document ready

function getParcelShops(ajaxRequest){
    jQuery.post(baseUri + 'module/dpdbenelux/OneStepParcelshop', {
            'method': 'getParcelShops'
        },
        function (response) {
            var jsonObject = JSON.parse(response);

            geoData = jsonObject.geoData;

            window.parcelShops = jsonObject.parcelShops;

            window.latitude = geoData.latitude;
            window.longitude = geoData.longitude;
            DpdInitGoogleMaps();
            initMap();
            addChosen(cookieParcelId);

            // for the first time
            jQuery('[id^="delivery_option_"]').each(function () {
                if (jQuery("#" + this.id).prop("checked")) {
                    if (this.value == parcelshopId + ',') {
                        jQuery('.selected-parcelshop').show();

                    }
                }
            });

            jQuery('.loader').hide();
            if(ajaxRequest){
                jQuery('[id^="delivery_option_"]').each(function () {
                    if (jQuery(this).prop("checked")) {
                        if (this.value == parcelshopId + ',') {
                            jQuery('#parcelshops').show();
                            addChosen(cookieParcelId);
                            jQuery('.selected-parcelshop').show();
                        }
                    }
                });
            }

        });
}

// functions
function addDivs()
{

    jQuery('.delivery_options').append('<div id="parcelshops"><img class="loader" src="/img/loader.gif"/></div>');
    // for the first time
    jQuery('[id^="delivery_option_"]').each(function () {
        if (jQuery("#" + this.id).prop("checked")) {
            if (this.value == parcelshopId + ',') {
                jQuery('#parcelshops').show();
                jQuery('.selected-parcelshop').show();

            }
        }
    });
}

function DpdInitGoogleMaps() {
    if(jQuery('#parcelshops').length == 0 ){
        jQuery('.delivery_options').append('<div id="parcelshops"></div>');
    }
    if(jQuery('#googlemap').length == 0 ){
        jQuery('#parcelshops').append('<div id="googlemap"></div>');
    }
    if(jQuery('#googlemap_shops').length == 0 ) {
        jQuery('#parcelshops').append('<ul id="googlemap_shops"></ul>');
    }
    window.parcelShops.parcelShop.map(function (shop) {
        var content = "<img src='/img/pickup.png'/><strong class='modal-title'>" + shop.company + "</strong><br/>" + shop.street + " " + shop.houseNo + "<br/>" + shop.zipCode + " " + shop.city + "<hr>";
        var openingshours = "";

        for (var i = 0; i < shop.openingHours.length; i++) {
            var openingshours = openingshours + "<div class='modal-week-row'><strong class='modal-day'>" + shop.openingHours[i].weekday + "</strong>" + " " + "<p>" + shop.openingHours[i].openMorning + " - " + shop.openingHours[i].closeMorning + "  " + shop.openingHours[i].openAfternoon + " - " + shop.openingHours[i].closeAfternoon + "</p></div>";
        }

        jQuery('#parcelshops').append('<div class="parcel_modal" id="info_' + shop.parcelShopId + '">' +
            '<img src="/modules/dpdbenelux/img/pickup.png">' +
            '<a class="go-back"> Terug</a>' +
            '<strong class="modal-title">' + shop.company + '</strong><br>' +
            shop.street + ' ' + shop.houseNo + '<br>' + shop.zipCode + ' ' + shop.city +
            '<hr>' + openingshours +
            '<strong class="modal-link"><a id="' + shop.parcelShopId + '" class="ParcelShops">Ship to this parcel</a></strong>' +
            '</div>');

        jQuery('#parcelshops').on('click', '.go-back', function () {
            jQuery('#googlemap_shops').show();
            jQuery('.parcel_modal').hide();
        });

        var sidebar_item = jQuery("<li><div class='sidebar_single'><strong class='company'>" + shop.company + "</strong><br/><span class='address'>" + shop.street + " " + shop.houseNo + "</span><br/><span class='address'>" + shop.zipCode + " " + shop.city + "</span><br/><strong class='modal-link'><a id='more_info_" + shop.parcelShopId + "' class='more-information'>More information.</a></strong></div></li>");

        sidebar_item.on('click', '.more-information', function () {
            jQuery('#googlemap_shops').hide();
            jQuery('#info_' + shop.parcelShopId).show();
        });


        jQuery('#googlemap_shops').append(sidebar_item);


    });
}

function initMap() {
    var styledMapType = new google.maps.StyledMapType(
        [
            {
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                ]
            },
            {
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#616161"
                    }
                ]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "color": "#f5f5f5"
                    }
                ]
            },
            {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#bdbdbd"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                ]
            },
            {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                ]
            },
            {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#ffffff"
                    }
                ]
            },
            {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#757575"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#dadada"
                    }
                ]
            },
            {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#616161"
                    }
                ]
            },
            {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            },
            {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#e5e5e5"
                    }
                ]
            },
            {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#eeeeee"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [
                    {
                        "color": "#d2e4f3"
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "color": "#9e9e9e"
                    }
                ]
            }
        ],
        {name: 'Styled Map'});

    // Create a map object, and include the MapTypeId to add
    // to the map type control.
    window.map = new google.maps.Map(document.getElementById('googlemap'), {
        center: {lat: window.latitude, lng: window.longitude},
        zoom: 11,
        mapTypeControlOptions: {
            mapTypeIds: ['styled_map']
        }
    });

    //Associate the styled map with the MapTypeId and set it to display.
    window.map.mapTypes.set('styled_map', styledMapType);
    window.map.setMapTypeId('styled_map');

    setParcelshops(parcelShops);
}

function setParcelshops(parcelshops) {

    parcelshops.parcelShop.map(function(shop) {
        var marker_image = new google.maps.MarkerImage('/modules/dpdbenelux/img/pickup.png', new google.maps.Size(57, 62), new google.maps.Point(0, 0), new google.maps.Point(0, 31));

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(parseFloat(shop.latitude),parseFloat(shop.longitude)),
            icon: marker_image,
            map: window.map
        });

        var infowindow = new google.maps.InfoWindow();


        var content = "<img src='/modules/dpdbenelux/img/pickup.png'/><strong class='modal-title'>"+shop.company+"</strong><br/>"+ shop.street + " " + shop.houseNo + "<br/>" + shop.zipCode + " " + shop.city + "<hr>";
        var openingshours = "";

        for (var i = 0; i < shop.openingHours.length; i++) {
            var openingshours = openingshours + "<div class='modal-week-row'><strong class='modal-day'>" +shop.openingHours[i].weekday + "</strong>" + " "+ "<p>"+ shop.openingHours[i].openMorning + " - " + shop.openingHours[i].closeMorning + "  " + shop.openingHours[i].openAfternoon + " - " + shop.openingHours[i].closeAfternoon +"</p></div>";
        }

        infowindow.setContent("<div class='info-modal-content'>" + content + openingshours + "<strong class='modal-link'><a id='"+shop.parcelShopId+"' class='ParcelShops'>Ship to this parcel </a></strong> " + "</div>");
        window.infowindows.push(infowindow);

        google.maps.event.addListener(marker, 'click', (function (marker) {
            return function () {
                closeInfoWindows();
                infowindow.open(window.map, marker);
            }
        })(marker));

        window.markers.push(marker);

    });
}

function closeInfoWindows() {
    for (var i = 0; i < window.infowindows.length; i++) {
        window.infowindows[i].close();
    }
}


function addChosen(parcelId){
    var verified = false;
    jQuery(window.parcelShops.parcelShop).each(function (index, value) {
        if (value.parcelShopId == parcelId){
            verified = true;
            if(jQuery('.selected-parcelshop').length !== 0){
                jQuery('.selected-parcelshop').remove();
            }
            selectedParcelShop = "<ul class='selected-parcelshop'> <li> <div class='sidebar_single'> <strong class='company'>" + value.company + "</strong> <br> <span class='address'>" + value.street + " " + value.houseNo + "</span> <br /> <span class='address '>" + value.zipCode + " " + value.city + "</span> <br /> </div> </li> </ul>";
            jQuery('#parcelshops').parent().append(selectedParcelShop);
        }
    });
    if(verified){
        jQuery("#parcel-id").val(parcelId);
    }

}


