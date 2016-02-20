/* Set up Map */
var map, polys = [];
var mapOptions = {
mapTypeId: google.maps.MapTypeId.ROADMAP
};
map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

var southWest = new google.maps.LatLng(30, -98);
var northEast = new google.maps.LatLng(40, -65);
var bounds = new google.maps.LatLngBounds(southWest,northEast);
map.fitBounds(bounds);

var Item_1 = new google.maps.LatLng(30, -118);

var myPlace = new google.maps.LatLng(40, -75);

var bounds = new google.maps.LatLngBounds();
bounds.extend(myPlace);
bounds.extend(Item_1);
map.fitBounds(bounds);

var apikey = "0bdac353861f41c0a27d7583243cc317";


/* Render state color */
var render = function(demNorm) {
    var blue = red = 0x00;
    var colour;
    if (demNorm > 0){
        var blueHex = (demNorm * 0xFF).toString(16);
        blue = blueHex.slice(0,2);
        colour = "#" + "00" + "00" + blue;
    }
    else {
        var redHex = (-demNorm * 0xFF).toString(16);
        red = redHex.slice(0,2);
        colour = "#" + red + "00" + "00";
    }
    var points = this.getElementsByTagName("point");
    var pts = [];
    for (var i = 0; i < points.length; i++) {
    pts[i] = new google.maps.LatLng(parseFloat(points[i].getAttribute("lat")), parseFloat(points[i].getAttribute("lng")));
    }
    var poly = new google.maps.Polygon({
    paths: pts,
    strokeColor: '#000000',
    strokeOpacity: 1,
    fillColor: colour,
    fillOpacity: 0.35
    });
    polys.push(poly);
    poly.setMap(map);
}


/* Get state boundaries and draw on map */
jQuery.get("/lib/states.xml", {}, function(data) {
    jQuery(data).find("state").each(function() {

        var state = this.getAttribute("name");
        var stateResults = {"R": 0, "D": 0};
        var that = this;
        $.ajax({
            url: "http://congress.api.sunlightfoundation.com/legislators?" +
                "apikey=" + apikey +
                "&state_name=" + state
            ,
            success: function(response) {
                var legislatorResults = response.results;
                for (i in legislatorResults) {
                    var party = legislatorResults[i].party;
                    if (party in stateResults){
                        stateResults[party] += 1;
                    }
                }

                var demMinusRepub = stateResults["D"] - stateResults["R"];
                var demNorm = demMinusRepub/Math.max(1, legislatorResults.length); //-1 to 1

                render.call(that, demNorm);
            }
        });
    });
});
