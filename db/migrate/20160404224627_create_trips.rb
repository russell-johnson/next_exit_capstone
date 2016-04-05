class CreateTrips < ActiveRecord::Migration
  def change
    create_table :trips do |t|
      t.string :set_distance
      t.string :integer
      t.string :starting
      t.string :ending
      t.string :belongs_to
      t.string :user

      t.timestamps null: false
    end
  end
end
