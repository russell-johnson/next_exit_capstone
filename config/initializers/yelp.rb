require 'yelp'

YAML.load(File.read('config/yelp.yml')).each do |key, value|
  ENV[key] = value
  consumer_key = ENV['consumer_key']
  consumer_secret = ENV['consumer_secret']
  token = ENV['token']
  token_secret = ENV['token_secret']
end

