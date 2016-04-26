/** This program uses the RouteBoxer library by Thor Mitchell Copyright @2010 by Google, lines 6-474 inclusive
** Thanks to Andrew Hedges with a simple to use formula to find the distance between two latitude and longitude objects used under an MIT license
** And a very special thanks to DevPoint labs for all of their support, and long hours screaming at this program, Jake Source, Dave Jungst, you guys rock!
*/

$(document).ready(function() {

function RouteBoxer() {
  this.R = 6371; // earth's mean radius in km
}

RouteBoxer.prototype.box = function (path, range) {
  // Two dimensional array representing the cells in the grid overlaid on the path
  this.grid_ = null;

  // Array that holds the latitude coordinate of each vertical grid line
  this.latGrid_ = [];

  // Array that holds the longitude coordinate of each horizontal grid line
  this.lngGrid_ = [];

  // Array of bounds that cover the whole route formed by merging cells that
  //  the route intersects first horizontally, and then vertically
  this.boxesX_ = [];

  // Array of bounds that cover the whole route formed by merging cells that
  //  the route intersects first vertically, and then horizontally
  this.boxesY_ = [];

  // The array of LatLngs representing the vertices of the path
  var vertices = null;

  // If necessary convert the path into an array of LatLng objects
  if (path instanceof Array) {
    // already an arry of LatLngs (eg. v3 overview_path)
    vertices = path;
  } else if (path instanceof google.maps.Polyline) {
    if (path.getPath) {
      // v3 Maps API Polyline object
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

  // Build the grid that is overlaid on the route
  this.buildGrid_(vertices, range);

  // Identify the grid cells that the route intersects
  this.findIntersectingCells_(vertices);

  // Merge adjacent intersected grid cells (and their neighbours) into two sets
  //  of bounds, both of which cover them completely
  this.mergeIntersectingCells_();

  // Return the set of merged bounds that has the fewest elements
  return (this.boxesX_.length >= this.boxesY_.length ?
          this.boxesX_ :
          this.boxesY_);
};


RouteBoxer.prototype.buildGrid_ = function (vertices, range) {

  // Create a LatLngBounds object that contains the whole path
  var routeBounds = new google.maps.LatLngBounds();
  for (var i = 0; i < vertices.length; i++) {
    routeBounds.extend(vertices[i]);
  }

  // Find the center of the bounding box of the path
  var routeBoundsCenter = routeBounds.getCenter();

  // Starting from the center define grid lines outwards vertically until they
  //  extend beyond the edge of the bounding box by more than one cell
  this.latGrid_.push(routeBoundsCenter.lat());

  // Add lines from the center out to the north
  this.latGrid_.push(routeBoundsCenter.rhumbDestinationPoint(0, range).lat());
  for (i = 2; this.latGrid_[i - 2] < routeBounds.getNorthEast().lat(); i++) {
    this.latGrid_.push(routeBoundsCenter.rhumbDestinationPoint(0, range * i).lat());
  }

  // Add lines from the center out to the south
  for (i = 1; this.latGrid_[1] > routeBounds.getSouthWest().lat(); i++) {
    this.latGrid_.unshift(routeBoundsCenter.rhumbDestinationPoint(180, range * i).lat());
  }

  // Starting from the center define grid lines outwards horizontally until they
  //  extend beyond the edge of the bounding box by more than one cell
  this.lngGrid_.push(routeBoundsCenter.lng());

  // Add lines from the center out to the east
  this.lngGrid_.push(routeBoundsCenter.rhumbDestinationPoint(90, range).lng());
  for (i = 2; this.lngGrid_[i - 2] < routeBounds.getNorthEast().lng(); i++) {
    this.lngGrid_.push(routeBoundsCenter.rhumbDestinationPoint(90, range * i).lng());
  }

  // Add lines from the center out to the west
  for (i = 1; this.lngGrid_[1] > routeBounds.getSouthWest().lng(); i++) {
    this.lngGrid_.unshift(routeBoundsCenter.rhumbDestinationPoint(270, range * i).lng());
  }

  // Create a two dimensional array representing this grid
  this.grid_ = new Array(this.lngGrid_.length);
  for (i = 0; i < this.grid_.length; i++) {
    this.grid_[i] = new Array(this.latGrid_.length);
  }
};


RouteBoxer.prototype.findIntersectingCells_ = function (vertices) {
  // Find the cell where the path begins
  var hintXY = this.getCellCoords_(vertices[0]);

  // Mark that cell and it's neighbours for inclusion in the boxes
  // this.markCell_(hintXY);

  // Work through each vertex on the path identifying which grid cell it is in
  for (var i = 1; i < vertices.length; i++) {
    // Use the known cell of the previous vertex to help find the cell of this vertex
    var gridXY = this.getGridCoordsFromHint_(vertices[i], vertices[i - 1], hintXY);

    if (gridXY[0] === hintXY[0] && gridXY[1] === hintXY[1]) {
      // This vertex is in the same cell as the previous vertex
      // The cell will already have been marked for inclusion in the boxes
      continue;

    } else if ((Math.abs(hintXY[0] - gridXY[0]) === 1 && hintXY[1] === gridXY[1]) ||
        (hintXY[0] === gridXY[0] && Math.abs(hintXY[1] - gridXY[1]) === 1)) {
      // This vertex is in a cell that shares an edge with the previous cell
      // Mark this cell and it's neighbours for inclusion in the boxes
      this.markCell_(gridXY);

    } else {
      // This vertex is in a cell that does not share an edge with the previous
      //  cell. This means that the path passes through other cells between
      //  this vertex and the previous vertex, and we must determine which cells
      //  it passes through
      this.getGridIntersects_(vertices[i - 1], vertices[i], hintXY, gridXY);
    }

    // Use this cell to find and compare with the next one
    hintXY = gridXY;
  }
};

/**
 * Find the cell a path vertex is in by brute force iteration over the grid
 *
 * @param {LatLng[]} latlng The latlng of the vertex
 * @return {Number[][]} The cell coordinates of this vertex in the grid
 */
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

  // Handle a line segment that travels south first
  if (end.lat() > start.lat()) {
    // Iterate over the east to west grid lines between the start and end cells
    for (i = startXY[1] + 1; i <= endXY[1]; i++) {
      // Find the latlng of the point where the path segment intersects with
      //  this grid line (Step 2 & 3)
      edgePoint = this.getGridIntersect_(start, brng, this.latGrid_[i]);

      // Find the cell containing this intersect point (Step 4)
      edgeXY = this.getGridCoordsFromHint_(edgePoint, hint, hintXY);

      // Mark every cell the path has crossed between this grid and the start,
      //   or the previous east to west grid line it crossed (Step 5)
      this.fillInGridSquares_(hintXY[0], edgeXY[0], i - 1);

      // Use the point where it crossed this grid line as the reference for the
      //  next iteration
      hint = edgePoint;
      hintXY = edgeXY;
    }

    // Mark every cell the path has crossed between the last east to west grid
    //  line it crossed and the end (Step 5)
    this.fillInGridSquares_(hintXY[0], endXY[0], i - 1);

  } else {
    // Iterate over the east to west grid lines between the start and end cells
    for (i = startXY[1]; i > endXY[1]; i--) {
      // Find the latlng of the point where the path segment intersects with
      //  this grid line (Step 2 & 3)
      edgePoint = this.getGridIntersect_(start, brng, this.latGrid_[i]);

      // Find the cell containing this intersect point (Step 4)
      edgeXY = this.getGridCoordsFromHint_(edgePoint, hint, hintXY);

      // Mark every cell the path has crossed between this grid and the start,
      //   or the previous east to west grid line it crossed (Step 5)
      this.fillInGridSquares_(hintXY[0], edgeXY[0], i);

      // Use the point where it crossed this grid line as the reference for the
      //  next iteration
      hint = edgePoint;
      hintXY = edgeXY;
    }

    // Mark every cell the path has crossed between the last east to west grid
    //  line it crossed and the end (Step 5)
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

  // The box we are currently expanding with new cells
  var currentBox = null;

  // Traverse the grid a row at a time
  for (y = 0; y < this.grid_[0].length; y++) {
    for (x = 0; x < this.grid_.length; x++) {

      if (this.grid_[x][y]) {
        // This cell is marked for inclusion. If the previous cell in this
        //   row was also marked for inclusion, merge this cell into it's box.
        // Otherwise start a new box.
        box = this.getCellBounds_([x, y]);
        if (currentBox) {
          currentBox.extend(box.getNorthEast());
        } else {
          currentBox = box;
        }

      } else {
        // This cell is not marked for inclusion. If the previous cell was
        //  marked for inclusion, merge it's box with a box that spans the same
        //  columns from the row below if possible.
        this.mergeBoxesY_(currentBox);
        currentBox = null;
      }
    }
    // If the last cell was marked for inclusion, merge it's box with a matching
    //  box from the row below if possible.
    this.mergeBoxesY_(currentBox);
    currentBox = null;
  }

  // Traverse the grid a column at a time
  for (x = 0; x < this.grid_.length; x++) {
    for (y = 0; y < this.grid_[0].length; y++) {
      if (this.grid_[x][y]) {

        // This cell is marked for inclusion. If the previous cell in this
        //   column was also marked for inclusion, merge this cell into it's box.
        // Otherwise start a new box.
        if (currentBox) {
          box = this.getCellBounds_([x, y]);
          currentBox.extend(box.getNorthEast());
        } else {
          currentBox = this.getCellBounds_([x, y]);
        }

      } else {
        // This cell is not marked for inclusion. If the previous cell was
        //  marked for inclusion, merge it's box with a box that spans the same
        //  rows from the column to the left if possible.
        this.mergeBoxesX_(currentBox);
        currentBox = null;

      }
    }
    // If the last cell was marked for inclusion, merge it's box with a matching
    //  box from the column to the left if possible.
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
  // check for going past the pole
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
  var distance = null; // km
  var distanceCounter = null;

  function initialize() {
    // Default the map view to the continental U.S.
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
    // Clear any previous route boxes from the map
    clearBoxes();

    // Convert the distance to box around the route from miles to km
    distance = .25 * 1.609344;

    var request = {
      origin: document.getElementById("to").value,
      destination: document.getElementById("from").value,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    }

    // Make the directions request
    directionService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        // Box around the overview path of the first route
        var path = result.routes[0].overview_path;
        var boxes = routeBoxer.box(path, distance);
        // getBoxes(boxes);
        var waypoints = [];
        var centerCord = [];
        var userStops = document.getElementById("userStops").value;
        var geocoder = new google.maps.Geocoder;
        centerCord = getBoxes(boxes);
        preliminary = findDistance(centerCord, userStops);
        semiFinal = waypointFinal(preliminary, userStops);
        points = waypointFinal(semiFinal, userStops);
        waypoints = waypointFinal(points, userStops);
        // waypointSender(waypoints);
        addressWaypoints = geocodeLatLng(waypoints, geocoder);
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

  var Rm = 3961; // mean radius of the earth (miles) at 39 degrees from the equator
  var Rk = 6373; // mean radius of the earth (km) at 39 degrees from the equator
  /* main function */
  function findDistance(centerCord, userStops) {
    var preliminary = [];
    preliminary.push(centerCord[0]);
    var x = 0;
    var distanceCounter = 0;
    for (var i = 1; i < centerCord.length; i++) {
      x = (i + 1); // this is to catch the next iteration

      distanceCounter += mathMatics(centerCord, i, x);

      if (i == centerCord.length-2){// catching the last box of the array and adding it as the destination waypoint
        preliminary.push(centerCord[i + 1]);
        distanceCounter = 0;
        break
      }
      else if ((distanceCounter == userStops) || ((distanceCounter < userStops) &&
        ((distanceCounter + mathMatics(centerCord, x , (x + 1))) > userStops))){ // price is right style waypoint adding
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



  // convert degrees to radians
  function deg2rad(deg) {
    rad = deg * Math.PI/180; // radians = degrees * pi/180
    return rad;
  }


  // round to the nearest 1/1000
  function round(x) {
    return Math.round( x * 1000) / 1000;
  }

  // Clear boxes currently on the map
  function clearBoxes() {
    if (boxpolys != null) {
      for (var i = 0; i < boxpolys.length; i++) {
        boxpolys[i].setMap(null);
      }
    }
    boxpolys = null;
  }

  function geocodeLatLng(waypoints, geocoder) {
    var addressWaypoints = [];
    var counter = waypoints.length-1;
    for (var i = 0; i < waypoints.length-1; i++) {
      var latlng = {lat: parseFloat(waypoints[i].latitude), lng: parseFloat(waypoints[i].longitude)}
      geocoder.geocode({'location': latlng }, function(results, status) {
        counter = counter - 1;

        if (status === google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            addressWaypoints.push(results[1]);
            if (counter == 0) {

              waypointSender(waypoints, addressWaypoints);
            }

          } else {
            console.log('No results found');
          }
        } else {
          console.log('Geocoder failed due to: ' + status)

        }
      });
    }
    return addressWaypoints;
  }

  function waypointSender(waypoints, addressWaypoints){
    var addresses = []
    for(var x = 0; x < addressWaypoints.length-1; x++) {
      addresses.push(addressWaypoints[x].formatted_address);
    }
    $.ajax({
      url: "/waypoints",
      type: 'POST',
      data: {waypoints: waypoints, addresses: addresses}
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
