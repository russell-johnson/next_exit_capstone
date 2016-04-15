class RoadTripsController < ApplicationController
  def index
    @road_trips = RoadTrip.all
  end 

  def waypoints
    @waypoints = params['waypoints']
    binding.pry   
  end

end

