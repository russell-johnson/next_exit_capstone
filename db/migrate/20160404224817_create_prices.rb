class CreatePrices < ActiveRecord::Migration
  def change
    create_table :prices do |t|
      t.string :gas
      t.string :float
      t.string :food
      t.string :float
      t.string :hotel
      t.string :float
      t.string :belongs_to
      t.string :trip

      t.timestamps null: false
    end
  end
end
