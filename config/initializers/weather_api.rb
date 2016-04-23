if Rails.env.development?
  begin
    settings_config = YAML.load_file('config/weather_api.yml')
    settings_config.each {|key, value| ENV[key] = value}
  rescue
    raise "weather_api.yml not found in config directory"
  end
end
