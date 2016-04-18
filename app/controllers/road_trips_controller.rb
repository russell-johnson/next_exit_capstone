class RoadTripsController < ApplicationController
  def index
    @road_trips = RoadTrip.all
  end 

  def waypoints
    @waypoints = params['waypoints']
    binding.pry

    @waypoints.each do |i|
      latitude =  (@waypoints['i']['latitude']).to_f
      longitude = (@waypoints['i']['longitude']).to_f

    end
    binding.pry  
  end

end

