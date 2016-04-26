class AddUserIdToRoadTrips < ActiveRecord::Migration
  def change
    add_reference :road_trips, :user, index: true

  end
end
