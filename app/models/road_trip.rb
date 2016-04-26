class RoadTrip < ActiveRecord::Base
  serialize :waypoints
  belongs_to :user

end
