/** This program uses the RouteBoxer library by Thor Mitchell Copyright @2010 by Google, lines 6-303 inclusive
** Thanks to Andrew Hedges with a simple to use formula to find the distance between two latitude and longitude objects used under an MIT license
** And a very special thanks to DevPoint labs for all of their support, and long hours screaming at this program, Jake Source, Dave Jungst, you guys rock!
*/

$(document).ready(function() {

function RouteBoxer() {
  this.R = 6371;
}
RouteBoxer.prototype.box = function (path, range) {
  this.grid_ = null;
  this.latGrid_ = [];
  this.lngGrid_ = [];
  this.boxesX_ = [];
  this.boxesY_ = [];
  var vertices = null;
  if (path instanceof Array) {
    vertices = path;
  } else if (path instanceof google.maps.Polyline) {
    if (path.getPath) {
      vertices = new Array(path.getPath().getLength());
      for (var i = 0; i < vertices.length; i++) {
        vertices[i] = path.getPath().getAt(i);
      }
    } else {
      // v2 Maps API Polyline object
      vertices = new Array(path.getVertexCount());
      for (var j = 0; j < vertices.length; j++) {
        vertices[j] = path.getVertex(j);
      }
    }
  }
  this.buildGrid_(vertices, range);
  this.findIntersectingCells_(vertices);
  this.mergeIntersectingCells_();
  return (this.boxesX_.length >= this.boxesY_.length ?
          this.boxesX_ :
          this.boxesY_);
};
RouteBoxer.prototype.buildGrid_ = function (vertices, range) {
  var routeBounds = new google.maps.LatLngBounds();
  for (var i = 0; i < vertices.length; i++) {
    routeBounds.extend(vertices[i]);
  }
  var routeBoundsCenter = routeBounds.getCenter();
  this.latGrid_.push(routeBoundsCenter.lat());
  this.latGrid_.push(routeBoundsCenter.rhumbDestinationPoint(0, range).lat());
  for (i = 2; this.latGrid_[i - 2] < routeBounds.getNorthEast().lat(); i++) {
    this.latGrid_.push(routeBoundsCenter.rhumbDestinationPoint(0, range * i).lat());
  }
  for (i = 1; this.latGrid_[1] > routeBounds.getSouthWest().lat(); i++) {
    this.latGrid_.unshift(routeBoundsCenter.rhumbDestinationPoint(180, range * i).lat());
  }
  this.lngGrid_.push(routeBoundsCenter.lng());
  this.lngGrid_.push(routeBoundsCenter.rhumbDestinationPoint(90, range).lng());
  for (i = 2; this.lngGrid_[i - 2] < routeBounds.getNorthEast().lng(); i++) {
    this.lngGrid_.push(routeBoundsCenter.rhumbDestinationPoint(90, range * i).lng());
  }
  for (i = 1; this.lngGrid_[1] > routeBounds.getSouthWest().lng(); i++) {
    this.lngGrid_.unshift(routeBoundsCenter.rhumbDestinationPoint(270, range * i).lng());
  }
  this.grid_ = new Array(this.lngGrid_.length);
  for (i = 0; i < this.grid_.length; i++) {
    this.grid_[i] = new Array(this.latGrid_.length);
  }
};


RouteBoxer.prototype.findIntersectingCells_ = function (vertices) {
  var hintXY = this.getCellCoords_(vertices[0]);
  for (var i = 1; i < vertices.length; i++) {
    var gridXY = this.getGridCoordsFromHint_(vertices[i], vertices[i - 1], hintXY);
    if (gridXY[0] === hintXY[0] && gridXY[1] === hintXY[1]) {
      continue;
    } else if ((Math.abs(hintXY[0] - gridXY[0]) === 1 && hintXY[1] === gridXY[1]) ||
        (hintXY[0] === gridXY[0] && Math.abs(hintXY[1] - gridXY[1]) === 1)) {
      this.markCell_(gridXY);
    } else {
      this.getGridIntersects_(vertices[i - 1], vertices[i], hintXY, gridXY);
    }
    hintXY = gridXY;
  }
};
RouteBoxer.prototype.getCellCoords_ = function (latlng) {
  for (var x = 0; this.lngGrid_[x] < latlng.lng(); x++) {}
  for (var y = 0; this.latGrid_[y] < latlng.lat(); y++) {}
  return ([x - 1, y - 1]);
};

RouteBoxer.prototype.getGridCoordsFromHint_ = function (latlng, hintlatlng, hint) {
  var x, y;
  if (latlng.lng() > hintlatlng.lng()) {
    for (x = hint[0]; this.lngGrid_[x + 1] < latlng.lng(); x++) {}
  } else {
    for (x = hint[0]; this.lngGrid_[x] > latlng.lng(); x--) {}
  }

  if (latlng.lat() > hintlatlng.lat()) {
    for (y = hint[1]; this.latGrid_[y + 1] < latlng.lat(); y++) {}
  } else {
    for (y = hint[1]; this.latGrid_[y] > latlng.lat(); y--) {}
  }

  return ([x, y]);
};
RouteBoxer.prototype.getGridIntersects_ = function (start, end, startXY, endXY) {
  var edgePoint, edgeXY, i;
  var brng = start.rhumbBearingTo(end);         // Step 1.
  var hint = start;
  var hintXY = startXY;
  if (end.lat() > start.lat()) {
    for (i = startXY[1] + 1; i <= endXY[1]; i++) {
      edgePoint = this.getGridIntersect_(start, brng, this.latGrid_[i]);
      edgeXY = this.getGridCoordsFromHint_(edgePoint, hint, hintXY);
      this.fillInGridSquares_(hintXY[0], edgeXY[0], i - 1);
      hint = edgePoint;
      hintXY = edgeXY;
    }
    this.fillInGridSquares_(hintXY[0], endXY[0], i - 1);
  } else {
    for (i = startXY[1]; i > endXY[1]; i--) {
      edgePoint = this.getGridIntersect_(start, brng, this.latGrid_[i]);
      edgeXY = this.getGridCoordsFromHint_(edgePoint, hint, hintXY);
      this.fillInGridSquares_(hintXY[0], edgeXY[0], i);
      hint = edgePoint;
      hintXY = edgeXY;
    }
    this.fillInGridSquares_(hintXY[0], endXY[0], i);
  }
};

RouteBoxer.prototype.getGridIntersect_ = function (start, brng, gridLineLat) {
  var d = this.R * ((gridLineLat.toRad() - start.lat().toRad()) / Math.cos(brng.toRad()));
  return start.rhumbDestinationPoint(brng, d);
};

RouteBoxer.prototype.fillInGridSquares_ = function (startx, endx, y) {
  var x;
  if (startx < endx) {
    for (x = startx; x <= endx; x++) {
      this.markCell_([x, y]);
    }
  } else {
    for (x = startx; x >= endx; x--) {
      this.markCell_([x, y]);
    }
  }
};

RouteBoxer.prototype.markCell_ = function (cell) {
  var x = cell[0];
  var y = cell[1];
  this.grid_[x - 1][y - 1] = 1;
  this.grid_[x][y - 1] = 1;
  this.grid_[x + 1][y - 1] = 1;
  this.grid_[x - 1][y] = 1;
  this.grid_[x][y] = 1;
  this.grid_[x + 1][y] = 1;
  this.grid_[x - 1][y + 1] = 1;
  this.grid_[x][y + 1] = 1;
  this.grid_[x + 1][y + 1] = 1;
};

RouteBoxer.prototype.mergeIntersectingCells_ = function () {
  var x, y, box;
  var currentBox = null;
  for (y = 0; y < this.grid_[0].length; y++) {
    for (x = 0; x < this.grid_.length; x++) {
      if (this.grid_[x][y]) {
        box = this.getCellBounds_([x, y]);
        if (currentBox) {
          currentBox.extend(box.getNorthEast());
        } else {
          currentBox = box;
        }
      } else {
        this.mergeBoxesY_(currentBox);
        currentBox = null;
      }
    }
    this.mergeBoxesY_(currentBox);
    currentBox = null;
  }
  for (x = 0; x < this.grid_.length; x++) {
    for (y = 0; y < this.grid_[0].length; y++) {
      if (this.grid_[x][y]) {
        if (currentBox) {
          box = this.getCellBounds_([x, y]);
          currentBox.extend(box.getNorthEast());
        } else {
          currentBox = this.getCellBounds_([x, y]);
        }
      } else {
        this.mergeBoxesX_(currentBox);
        currentBox = null;
      }
    }
    this.mergeBoxesX_(currentBox);
    currentBox = null;
  }
};
RouteBoxer.prototype.mergeBoxesX_ = function (box) {
  if (box !== null) {
    this.boxesX_.push(box);
  }
};
RouteBoxer.prototype.mergeBoxesY_ = function (box) {
  if (box !== null) {
    this.boxesY_.push(box);
  }
};
RouteBoxer.prototype.getCellBounds_ = function (cell) {
  return new google.maps.LatLngBounds(
    new google.maps.LatLng(this.latGrid_[cell[1]], this.lngGrid_[cell[0]]),
    new google.maps.LatLng(this.latGrid_[cell[1] + 1], this.lngGrid_[cell[0] + 1]));
};
google.maps.LatLng.prototype.rhumbDestinationPoint = function (brng, dist) {
  var R = 6371; // earth's mean radius in km
  var d = parseFloat(dist) / R;  // d = angular distance covered on earth's surface
  var lat1 = this.lat().toRad(), lon1 = this.lng().toRad();
  brng = brng.toRad();

  var lat2 = lat1 + d * Math.cos(brng);
  var dLat = lat2 - lat1;
  var dPhi = Math.log(Math.tan(lat2 / 2 + Math.PI / 4) / Math.tan(lat1 / 2 + Math.PI / 4));
  var q = (Math.abs(dLat) > 1e-10) ? dLat / dPhi : Math.cos(lat1);
  var dLon = d * Math.sin(brng) / q;
  if (Math.abs(lat2) > Math.PI / 2) {
    lat2 = lat2 > 0 ? Math.PI - lat2 : - (Math.PI - lat2);
  }
  var lon2 = (lon1 + dLon + Math.PI) % (2 * Math.PI) - Math.PI;
  if (isNaN(lat2) || isNaN(lon2)) {
    return null;
  }
  return new google.maps.LatLng(lat2.toDeg(), lon2.toDeg());
};
google.maps.LatLng.prototype.rhumbBearingTo = function (dest) {
  var dLon = (dest.lng() - this.lng()).toRad();
  var dPhi = Math.log(Math.tan(dest.lat().toRad() / 2 + Math.PI / 4) / Math.tan(this.lat().toRad() / 2 + Math.PI / 4));
  if (Math.abs(dLon) > Math.PI) {
    dLon = dLon > 0 ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon);
  }
  return Math.atan2(dLon, dPhi).toBrng();
};
Number.prototype.toRad = function () {
  return this * Math.PI / 180;
};
Number.prototype.toDeg = function () {
  return this * 180 / Math.PI;
};
Number.prototype.toBrng = function () {
  return (this.toDeg() + 360) % 360;
};
  var map = null;
  var boxpolys = null;
  var directions = null;
  var routeBoxer = null;
  var distance = null;
  var distanceCounter = null;
  function initialize() {
    var mapOptions = {
      center: new google.maps.LatLng(37.09024, -95.712891),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoom: 4
    };
    map = new google.maps.Map(document.getElementById("google_map"), mapOptions);
    routeBoxer = new RouteBoxer();
    directionService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
      map: map
    });
  }
  function initMap() {
    var chicago = {
      lat: 41.85,
      lng: -87.65
    };
    var indianapolis = {
      lat: 39.79,
      lng: -86.14
    };

    var map = new google.maps.Map(document.getElementById('map'), {
      center: chicago,
      scrollwheel: false,
      zoom: 7
    });
  }

  function route() {
    clearBoxes();
    distance = .25 * 1.609344;
    var request = {
      origin: document.getElementById("from").value,
      destination: document.getElementById("to").value,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    }
    directionService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        var path = result.routes[0].overview_path;
        var boxes = routeBoxer.box(path, distance);
        var waypoints = [];
        var centerCord = [];
        var userStops = document.getElementById("userStops").value;
        var geocoder = new google.maps.Geocoder;
        centerCord = getBoxes(boxes);
        preliminary = findDistance(centerCord, userStops);
        semiFinal = waypointFinal(preliminary, userStops);
        points = waypointFinal(semiFinal, userStops);
        addressWaypoints = geocodeLatLng(points, geocoder, request);
      } else {
        alert("Directions query failed: " + status);
      }
    });
  }

  function getBoxes(boxes) {
    var centerCord = [];
      for (var i = 0; i < boxes.length; i++) {

        var northeast = boxes[i].getNorthEast();
        var southwest = boxes[i].getSouthWest();
        centerCord.push({
          latitude: (parseFloat((northeast.lat()+southwest.lat())/2).toFixed(5)),
          longitude: (parseFloat((northeast.lng()+southwest.lng())/2).toFixed(5))
        });
      }
      return centerCord;
  }
  var Rm = 3961;
  var Rk = 6373;
  function findDistance(centerCord, userStops) {
    var preliminary = [];
    preliminary.push(centerCord[0]);
    var x = 0;
    var distanceCounter = 0;
    for (var i = 1; i < centerCord.length; i++) {
      x = (i + 1);
      distanceCounter += mathMatics(centerCord, i, x);
      if (i == centerCord.length-2){
        preliminary.push(centerCord[i + 1]);
        distanceCounter = 0;
        break
      }
      else if ((distanceCounter == userStops) || ((distanceCounter < userStops) &&
        ((distanceCounter + mathMatics(centerCord, x , (x + 1))) > userStops))){
        preliminary.push(centerCord[i]);
        distanceCounter = 0;
      }
      else if ((distanceCounter > userStops)) {
        preliminary.push(centerCord[i]);
          distanceCounter = 0;
      }
    }
    return preliminary;
  }
  function mathMatics(centerCord, i , x){
    var lat1, lon1, lat2, lon2, dlat, dlon, a, c, dm, dk, mi, km;
      lat1 = deg2rad(centerCord[i].latitude);
      lon1 = deg2rad(centerCord[i].longitude);
      lat2 = deg2rad(centerCord[x].latitude);
      lon2 = deg2rad(centerCord[x].longitude);
      // find the differences between the coordinates
      dlat = lat2 - lat1;
      dlon = lon2 - lon1;

      // here's the heavy lifting
      a  = Math.pow(Math.sin(dlat/2),2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon/2),2);
      c  = 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); // great circle distance in radians
      dm = c * Rm; // great circle distance in miles

      // round the results down to the nearest 1/1000
      mi = round(dm);
      km = round(dk);
      return mi;
  }
  function waypointFinal(preliminary, userStops) {
    var array = preliminary;
    var a = 0
    for (var i = 0; i < preliminary.length-2; i++) {
      for (var x = i + 1; x < preliminary.length-2; x++) {
        if (x == (preliminary.length-1)) {
          a = array.indexOf(preliminary[x]);
          array.splice((a-1), 1);
          continue;
        }
        else if ((mathMatics(preliminary, i, x)) < (.5 * userStops)) {
          a = array.indexOf(preliminary[x]);
          array.splice(a, 1);
        }
      }
    }
    return array;
  }
  function deg2rad(deg) {
    rad = deg * Math.PI/180;
    return rad;
  }
  function round(x) {
    return Math.round( x * 1000) / 1000;
  }
  function clearBoxes() {
    if (boxpolys != null) {
      for (var i = 0; i < boxpolys.length; i++) {
        boxpolys[i].setMap(null);
      }
    }
    boxpolys = null;
  }
  function geocodeLatLng(waypoints, geocoder, userRequest) {
    var delay = 120;
    var addressWaypoints = [];
    var counter = waypoints.length-1;
    for (var i = 0; i < waypoints.length-1; i++) {
      var latlng = {lat: parseFloat(waypoints[i].latitude), lng: parseFloat(waypoints[i].longitude)}
      geocoder.geocode({'location': latlng }, function(results, status) {
        counter = counter - 1;
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            addressWaypoints.push(results[0]);
            if (counter == 0) {
              waypointSender(waypoints, addressWaypoints, userRequest);
            }
          } else {
            setTimeout(function(){console.log(delay)}, delay);
          }
        } else {
          if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            i = i - 1;
            counter = counter + 1;
            delay = delay + 1;
          } else {
            var reason="Code "+status;
            var msg = 'address"" error=' +reason+ '(delay='+delay+'ms)<br>';
            document.getElementById("messages").innerHTML += msg;
          }   
        }
      });
    }
    return addressWaypoints;
  }
  function waypointSender(waypoints, addressWaypoints, request){
    var addresses = []
    var origin = request.origin;
    var destination = request.destination;
    for(var x = 0; x < addressWaypoints.length-1; x++) {
      addresses.push(addressWaypoints[x].formatted_address);
    }
    $.ajax({
      url: "/waypoints",
      type: 'POST',
      data: { waypoints: waypoints, addresses: addresses, origin: origin, destination: destination }
    }).success( function(data){
      window.location = 'road_trips/display?road_trip_id=' + data.road_trip_id
    }).error( function(data){
      console.log(data);
    });
  }
  initialize();

  $('#go_to_route').click(function() {
    route();
  });
});