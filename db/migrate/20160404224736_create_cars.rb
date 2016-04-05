class CreateCars < ActiveRecord::Migration
  def change
    create_table :cars do |t|
      t.string :gas_m
      t.string :integer
      t.string :make
      t.string :model
      t.string :year
      t.string :integer
      t.string :belongs_to
      t.string :user

      t.timestamps null: false
    end
  end
end
