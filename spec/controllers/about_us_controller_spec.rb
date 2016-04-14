require 'rails_helper'

RSpec.describe AboutUsController, type: :controller do

  describe "GET #index" do
    it "returns http success" do
      get :index
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET #todd" do
    it "returns http success" do
      get :todd
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET #jacob" do
    it "returns http success" do
      get :jacob
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET #russell" do
    it "returns http success" do
      get :russell
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET #parker" do
    it "returns http success" do
      get :parker
      expect(response).to have_http_status(:success)
    end
  end

end
