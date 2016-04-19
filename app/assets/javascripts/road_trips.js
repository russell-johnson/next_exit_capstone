$(document).ready(function() {
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
      origin: document.getElementById("from").value,
      destination: document.getElementById("to").value,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    }

    // Make the directions request
    directionService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        // Box around the overview path of the first route
        var path = result.routes[0].overview_path;
        var boxes = routeBoxer.box(path, distance);
        drawBoxes(boxes);
        // getBoxes(boxes);
        let waypoints = [];
        let centerCord = [];
        let userStops = 300;
        centerCord = getBoxes(boxes)
        waypoints = findDistance(centerCord, userStops);
        waypointSender(waypoints);
      } else {
        alert("Directions query failed: " + status);
      }
    });
  }

  // Draw the array of boxes as polylines on the map
  function drawBoxes(boxes) {
    boxpolys = new Array(boxes.length);
    for (var i = 0; i < boxes.length; i++) {
      boxpolys[i] = new google.maps.Rectangle({
        bounds: boxes[i],
        fillOpacity: 0,
        strokeOpacity: 0,
        strokeColor: '#000000',
        strokeWeight: 1,
        map: map
      });

    }

  }

  function getBoxes(boxes) {
    let centerCord = []
      for (var i = 0; i < boxes.length; i++) {

        var northeast = boxes[i].getNorthEast();
        var southwest = boxes[i].getSouthWest();
        centerCord.push({
          latitude: ((northeast.lat()+southwest.lat())/2),
          longitude: ((northeast.lng()+ southwest.lng())/2) 
        });        
      }
      return centerCord;
  }

  var Rm = 3961; // mean radius of the earth (miles) at 39 degrees from the equator
  var Rk = 6373; // mean radius of the earth (km) at 39 degrees from the equator      
  /* main function */
  function findDistance(centerCord, userStops) {
    var waypoints = [];
    var x = 0;
    let distanceCounter = 0;
    for (var i = 0; i < centerCord.length; i++) {
      
      x = (i + 1); // this is to catch the next iteration    
      distanceCounter += mathMatics(centerCord, i, x);
      console.log(distanceCounter);
      
      if (i == centerCord.length-2){// catching the last box of the array and adding it as the destination waypoint
        waypoints.push(centerCord[i + 1]);
        distanceCounter = 0;
        debugger;
        break
      }
      else if (i == 0) { // catching the origin of a route
        waypoints.push(centerCord[i]);
        distanceCounter = 0;
        debugger;
      }

      else if ((distanceCounter == userStops) || ((distanceCounter < userStops) && 
        ((distanceCounter + mathMatics(centerCord, x , (x + 1))) > userStops))){ // price is right style waypoint adding
        
        waypoints.push(centerCord[i]);
        console.log(distanceCounter);
        distanceCounter = 0;
        console.log(waypoints);
        debugger;
      }

      else if ((distanceCounter > userStops)) {
        waypoints.push(centerCord[i]);
        console.log(distanceCounter);
        distanceCounter = 0;
        console.log(waypoints);
        debugger;
      }
    }
    return waypoints;
    debugger;
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

  function waypointSender(waypoints){
    $.ajax({
      url: "/waypoints",
      type: 'POST',
      data: {waypoints: waypoints}
    }).success( function(data){
      console.log(data);
    }).error( function(data){
      console.log(data);
      debugger;
    });

  }

  initialize();

  $('#go_to_route').click(function() {
    route();
  });
});