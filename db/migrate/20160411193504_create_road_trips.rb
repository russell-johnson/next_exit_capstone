class CreateRoadTrips < ActiveRecord::Migration
  def change
    create_table :road_trips do |t|
      t.string :origin
      t.string :destination

      t.timestamps null: false
    end
  end
end
