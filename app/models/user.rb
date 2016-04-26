class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  has_many :trips, dependent: :destroy
  has_many :cars, dependent: :destroy
  has_many :road_trips, dependent: :destroy

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable,
         :omniauthable, omniauth_providers: [:facebook]

  def self.from_omniauth(facebook_info)
    where(provider: facebook_info.provider, uid: facebook_info.uid).first_or_create do |user|
      user.email = facebook_info.info.email
      user.password = Devise.friendly_token
    end
  end
end
