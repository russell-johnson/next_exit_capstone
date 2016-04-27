class RoadTripsController < ApplicationController
require 'json'
require 'open_weather'
  def index

  end

  def show
  end

  def my_trips
    @my_trips = current_user.road_trips
  end

  def display
    options = { units: 'imperial', APPID: ENV['WEATHER_API'] }
    @road_trip = RoadTrip.find(params['road_trip_id'])

    @latlong = @road_trip.waypoints
    @addresses = JSON.parse(@road_trip.address_waypoints)
    @results = []

    @addresses.each do |address|
    @results << {address: address, weather: OpenWeather::Current.city(address, options) }
    end


    respond_to do |format|
      format.html
      format.json { render json: { latlong: @latlong }}
    end
  end

  def waypoints
    @stops = []
    @waypoints = params['waypoints']
    @address_waypoints = params['addresses']
    @origin = params['origin']
    @destination = params['destination']
    iterator = @waypoints.length
    @index = 0
    while @index < iterator do
      point = {:latitude => (@waypoints["#{@index}"]['latitude']).to_f, :longitude => (@waypoints["#{@index}"]['longitude']).to_f}
      @index += 1
      @stops = @stops.push(point)
    end

    uid = current_user.id || nil

    road_trip = RoadTrip.create(waypoints: @stops, address_waypoints: @address_waypoints, origin: @origin, destination: @destination, user_id: uid)
    if road_trip.save
      render json: {road_trip_id: road_trip.id}
    else
      render json: {error: errors.all}
    end
  end

  def search
    @client = Yelp::Client.new({consumer_key: ENV['CONSUMER_KEY'],
                            consumer_secret: ENV['CONSUMER_SECRET'],
                            token: ENV['TOKEN'],
                            token_secret: ENV['TOKEN_SECRET']
                          })

    par = { term: params[:term], limit: 12 }
    @yelp_results = JSON.parse(@client.search(params[:location], par).to_json)
  end

end
