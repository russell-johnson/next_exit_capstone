class RoadTrips extends React.Component {
  constructor(props) {
    super(props)
    this.state = {origin: "Provo", destination: "Dallas", waypoints: "provo"}
    this.getDirections = this.getDirections.bind(this);
  }

  getDirections(e){
    e.preventDefault()
    let origin = "";
    let destination = "";
    let waypoints = "";

    if (this.refs.origin.value == "") {
      origin = this.state.origin;
    }else{
      origin = this.refs.origin.value;
    }
    if (this.refs.destination.value == "") {
      destination = this.state.destination;
    }else{
      destination = this.refs.destination.value;
    }
    if (this.refs.waypoints.value == "") {
      waypoints = this.state.waypoints;
    }else{
      waypoints = this.refs.waypoints.value;
    }
    this.setState({origin: origin, destination: destination, waypoints: waypoints})
  }

  render() {
    let url = `https://www.google.com/maps/embed/v1/directions?key=${this.props.ek}&origin=${this.state.origin}&destination=${this.state.destination}&mode=driving&waypoints=${this.state.waypoints}`
    return(
      <div className='container'>
        <iframe
          width="700"
          height="500"
          src= {url}>
        </iframe>
        <form onSubmit={this.getDirections}>
          <div className='row'>
            <div className='col m6'>
              <input className='field' type='text' placeholder='origin' ref='origin'></input>
              <input className='field' type='text' placeholder='destination' ref='destination'></input>
              <input className='field' type='text' placeholder='Stops: optional' ref='waypoints'></input>
              <button className='btn-large' type='submit'>NEXT EXIT</button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
