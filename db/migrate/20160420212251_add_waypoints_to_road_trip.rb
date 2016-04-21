class AddWaypointsToRoadTrip < ActiveRecord::Migration
  def change
    add_column :road_trips, :waypoints, :text
  end
end
