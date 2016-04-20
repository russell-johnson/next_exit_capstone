class RoadTripsController < ApplicationController
  def index
    @road_trips = RoadTrip.all
  end

  def show
    
  end 

  def waypoints
    @stops = []
    @waypoints = params['waypoints']
    iterator = @waypoints.length
    @index = 0
    while @index < iterator do
      point = {:latitude => (@waypoints["#{@index}"]['latitude']).to_f, :longitude => (@waypoints["#{@index}"]['longitude']).to_f}
      @index += 1
      puts "#{point[:latitude]},#{point[:longitude]}"
      @stops = @stops.push(point)
    end
    render json: @stops
  end

end