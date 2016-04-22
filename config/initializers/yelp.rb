if Rails.env.development?
  begin
    settings_config = YAML.load_file('config/yelp.yml')
    settings_config.each {|key, value| ENV[key] = value} 
  rescue
    raise "yelp.yml not found in config directory"
  end
end

