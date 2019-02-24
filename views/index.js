// Initialize and add the map
function initMap() {
    // The location of Taipei
    var taipei = { lat: 25.105497, lng: 125.105497 };
    // The map, centered at Taipei
    var map = new google.maps.Map(
        document.getElementById('map'), { zoom: 4, center: taipei });

    fetchNods(map)
}

function fetchNods(map) {
    fetch('http://34.80.48.90:8080/nodes', {})
        .then((response) => {
            // response is a readableStream object,
            // converts response by blob(), json(), text()
            return response.json();
        }).then((nodesJson) => {
            console.log(nodesJson);

            // create content map for each marker, i.e., one maker contains multiple node
            var contentMap = new Object();
            for (var i = 0; i < nodesJson.length; i++) {
                var obj = nodesJson[i];
                key = obj.lat.toString() + "," + obj.lng.toString();

                if (!(key in contentMap)) {
                    // create new entry for the node
                    contentMap[key] = createMakerContent(obj)
                } else {
                    // append node content to the existing entry
                    contentMap[key] += createMakerContent(obj)
                }
            }

            // draw makers
            for (var i = 0; i < nodesJson.length; i++) {
                var obj = nodesJson[i];
                key = obj.lat.toString() + "," + obj.lng.toString();

                // skip it because this node has been drawn in previous iteration
                if (!(key in contentMap)) {
                    continue
                }

                // if the status of one of node on the maker is "on", show red flag in map
                if (contentMap[key].includes("Status: on")) {
                    iconUrl = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
                } else {
                    // otherwise all nodes are "off", show shadow flag
                    iconUrl = "http://maps.google.com/mapfiles/ms/icons/msmarker.shadow.png";
                }

                // render makers
                var marker = new google.maps.Marker({
                    position: { lat: obj.lat, lng: obj.lng },
                    map: map,
                    icon: { url: iconUrl }
                });

                var infowindow = new google.maps.InfoWindow();
                bindInfoWindow(marker, map, infowindow, contentMap[key]);

                // current has been used in the marker, so delete this entry
                delete contentMap[key]
            }
        }).catch((err) => {
            console.log(err);
        });
}

function bindInfoWindow(marker, map, infowindow, markerContent) {
    marker.addListener('click', function () {
        infowindow.setContent(markerContent);
        infowindow.open(map, marker);
    });
}

function createMakerContent(obj) {
    if (obj.height == 0) {
        obj.height = "Unknown"
    }

    // consider node is off if timediff is larger than 1 hr
    if (obj.timediff.includes("h")) {
        status = "off"
    } else {
        status = "on"
    }

    s = '<div>' +
        'IP: ' + obj.ip + '<br>' +
        'Status: ' + status + '<br>' +
        // 'Latitude: ' + obj.lat + '<br>' +
        // 'Longitude: ' + obj.lng + '<br>' +
        'Block Height: ' + obj.height + '<br>' +
        'Last Update: ' + obj.timediff + '<br>' +
        '<br>' +
        '</div>';
    return s
}