class RoadTripsController < ApplicationController
  def index
    @road_trips = RoadTrip.all 
  end
end
