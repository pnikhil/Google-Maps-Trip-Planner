var map;
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();
var map_center;
var map_zoom;
$(function() {
    initialize()
});

function apply_autocomplete(input) {
    var options = {
        types: ['geocode']
    };
    var autocomplete = new google.maps.places.Autocomplete(input, options);
    autocomplete.bindTo('bounds', map)
}

function add_waypoint() {
    add_route = '<div class="control-group">';
    add_route += '  <label class="control-label">Additional Places :</label>';
    add_route += '  <div class="controls">';
    add_route += '      <input type="text" id="toWaypoints" name="toWaypoints[]" class="input" value="">';
    add_route += '      &nbsp;<a href="#" class="label label-success" onclick="return add_waypoint();">Add more places</a>';
    add_route += '      &nbsp;<a href="#" class="label label-important" onclick="return remove_waypoint(this);">Remove</a>';
    add_route += '  </div>';
    add_route += '</div>';
    $('.destination-container').before(add_route);
    $('[name="toWaypoints[]"]').each(function() {
        apply_autocomplete($(this)[0])
    });
    return false
}

function remove_waypoint(obj) {
    $(obj).parent().parent().remove();
    return false
}
$(document).ready(function() {
    $("#gMaps").submit(function() {
        $("#loader").html('&nbsp;<span class="label label-info">Getting route details...</span>');
        calcRoute();
        return false
    });
    $('#mapModal').on('shown', function() {
        map_center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(map_center);
        map.setZoom(map_zoom)
    })
});

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(40.730610, -73.935242),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map-display"), mapOptions);
    apply_autocomplete($("#fromAddress")[0]);
    apply_autocomplete($("#toAddress")[0])
}

function calcRoute() {
    var waypts = new Array();
    var start_address = $("#fromAddress").val();
    var end_address = $("#toAddress").val();
    $('input[name="toWaypoints[]"]').each(function() {
        waypts.push({
            location: $(this).val(),
            stopover: true
        })
    });
    var request = {
        origin: start_address,
        destination: end_address,
        waypoints: waypts,
        optimizeWaypoints: true,
        travelMode: google.maps.DirectionsTravelMode.DRIVING,
    };
    directionsService.route(request, function(response, status) {
        var directionsDiv = document.getElementById('directions');
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDiv.innerHTML = "";
            directionsDisplay.setMap(map);
            directionsDisplay.setDirections(response);
            directionsDisplay.setPanel(directionsDiv);
            var route = response.routes[0];
            var i, distance = 0,
                time = 0,
                loc_list = '<ol>';
            for (i = 0; i < route.legs.length; i++) {
                var theLeg = route.legs[i];
                loc_list += '<li>' + theLeg.start_address + '</li>';
                distance += theLeg.distance.value;
                time += theLeg.duration.value
            }
            loc_list += '<li>' + theLeg.end_address + '</li>';
            loc_list += '</ol>';
            $("#locations").html('<h4>Finding shortest route travelling to ' + theLeg.end_address + '</h4>' + loc_list);
            $(directionsDiv).append('<h4>Road Map :</h4>');
            total_summary = '<div class="alert alert-info">';
            total_summary += '  <strong>Total Distance : </strong>' + showDistance(distance) + " <br /> <b>Total Time:</b> Approximately " + Math.round(time / 60) + " minutes or " + (time / (60 * 60)).toFixed(2) + " Hours";
            total_summary += '</div>';
            $("#summary").html(total_summary);
            map_zoom = map.getZoom();
            $("#loader").html('')
        }
    })
}

function showDistance(distance) {
    return Math.round(distance / 100) / 10 + " km"
}
