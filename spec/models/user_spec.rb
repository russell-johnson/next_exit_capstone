require 'rails_helper'

RSpec.describe User, type: :model do 
  describe "validations" do 
    it { should validate_presence_of :first_name }

    it { should validate_presence_of :last_name }
  end

  describe 'associations' do 
    it { should have_many :trips }

    it { should have_many :cars }
  end

  describe '#full_name' do 
    FactoryGirl.create(:user)
    it 'concatonates first name and last name' do 
      user = FactoryGirl.create(:user)
      expect(user.full_name).to eq("#{user.first_name} #{user.last_name}")
    end
  end
end