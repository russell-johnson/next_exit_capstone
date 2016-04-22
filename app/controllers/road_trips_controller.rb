class RoadTripsController < ApplicationController
require 'json'
  def index

  end

  def display
    @road_trip = RoadTrip.find(params['road_trip_id'])


  
  end

  def waypoints
    @stops = []
    @waypoints = params['waypoints']
    @address_waypoints = params['addresses']
    iterator = @waypoints.length
    @index = 0
    while @index < iterator do
      point = {:latitude => (@waypoints["#{@index}"]['latitude']).to_f, :longitude => (@waypoints["#{@index}"]['longitude']).to_f}
      @index += 1
      puts "#{point[:latitude]},#{point[:longitude]}"
      @stops = @stops.push(point)
    end
   
    road_trip = RoadTrip.create(waypoints: @stops, address_waypoints: @address_waypoints)
    if road_trip.save
      render json: {road_trip_id: road_trip.id} 
    else
      render json: {error: errors.all}
    end
  end

end
