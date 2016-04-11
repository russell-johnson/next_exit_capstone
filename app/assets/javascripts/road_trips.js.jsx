class RoadTrips extends React.Component {
  constructor(props) {
    super(props)
    this.state = {origin: '', destination: ''}
  }

  getDirections(){

  }

  render() {
    let url = `https://www.google.com/maps/embed/v1/directions?key=${this.props.ek}&origin=Provo+Utah&destination=Dallas+Texas&mode=driving`
    return(
      <div className='container'>
        <iframe
          width="700"
          height="500"
          src= {url}>
        </iframe>
        <div className='row'>
          <div className='col m6'>
            <input className='field' type='text' placeholder='origin' ref='origin'></input>
            <input className='field' type='text' placeholder='destination' ref='destination'></input>
          </div>
        </div>
      </div>
    );
  }
}
