class RoadTripsController < ApplicationController
require 'json'
  def index

  end

  def display
    @waypoints = JSON.parse(params[:data])['stops']
  end

  def waypoints
    @stops = []
    @waypoints = params['waypoints']
    iterator = @waypoints.length
    @index = 0
    while @index < iterator do
      point = {:latitude => (@waypoints["#{@index}"]['latitude']).to_f, :longitude => (@waypoints["#{@index}"]['longitude']).to_f}
      @index += 1
      puts "#{point[:latitude]},#{point[:longitude]}"
      @stops = @stops.push(point)
    end
    render json: {stops: @stops }
  end

  def search
    @client = Yelp::Client.new({ consumer_key: ENV['consumer_key'],
                            consumer_secret: ENV['consumer_secret'],
                            token: ENV['token'],
                            token_secret: ENV['token_secret']
                          })

    parameters = { term: params[:term], limit: 12}
    @yelp_results = JSON.parse(@client.search(params[:location], parameters).to_json)
  end

end
