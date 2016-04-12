// class RoadTrips extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = {origin: "Provo", destination: "Dallas"}
    //this.getDirections = this.getDirections.bind(this);
  // }

  // initMap() {
  //   var chicago = {lat: 41.85, lng: -87.65};
  //   var indianapolis = {lat: 39.79, lng: -86.14};

  //   var map = new google.maps.Map(document.getElementById('map'), {
  //     center: chicago,
  //     scrollwheel: false,
  //     zoom: 7
  //   });

  //   var directionsDisplay = new google.maps.DirectionsRenderer({
  //     map: map
  //   });

  //   // Set destination, origin and travel mode.
  //   var request = {
  //     destination: indianapolis,
  //     origin: chicago,
  //     travelMode: google.maps.TravelMode.DRIVING
  //   };

  //   // Pass the directions request to the directions service.
  //   var directionsService = new google.maps.DirectionsService();
  //   directionsService.route(request, function(response, status) {
  //     if (status == google.maps.DirectionsStatus.OK) {
  //       // Display the route on the map.
  //       directionsDisplay.setDirections(response);
  //     }
  //   });
  // }

  // componentDidMount() {
  //   this.initMap();
  // }


// 
//   render() {
//     let url = `https://www.google.com/maps/embed/v1/directions?key=${this.props.ek}&origin=${this.state.origin}&destination=${this.state.destination}&mode=driving`
//     return(
//       <div className='container'>
//         <iframe
//           width="700"
//           height="500"
//           src= {url}>
//         </iframe>
//         <form onSubmit={this.getDirections}>
//           <div className='row'>
//             <div className='col m6'>
//               <input className='field' type='text' placeholder='origin' ref='origin'></input>
//               <input className='field' type='text' placeholder='destination' ref='destination'></input>
//               <button className='btn-large' type='submit'>NEXT EXIT</button>
//             </div>
//           </div>
//         </form>
//       </div>
//     );
//   }
// }

  // getDirections(e){
  //   e.preventDefault()
  //   let origin = "";
  //   let destination = "";

  //   if (this.refs.origin.value == "") {
  //     origin = this.state.origin;
  //   }else{
  //     origin = this.refs.origin.value;
  //   }
  //   if (this.refs.destination.value == "") {
  //     destination = this.state.destination;
  //   }else{
  //     destination = this.refs.destination.value;
  //   }
  //   this.setState({origin: origin, destination: destination})
  // }
