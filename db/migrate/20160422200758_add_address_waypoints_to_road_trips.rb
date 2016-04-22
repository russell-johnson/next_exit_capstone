class AddAddressWaypointsToRoadTrips < ActiveRecord::Migration
  def change
    add_column :road_trips, :address_waypoints, :text
  end
end
