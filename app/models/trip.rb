class Trip < ActiveRecord::Base

  has_one :price
  belongs_to :user
  
end
