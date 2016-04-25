if Rails.env.development?
  begin
    YAML.load(File.read('config/google_map_api.yml')).each do |key, value|
      ENV[key] = value
    end
  rescue
    raise 'No google_map_api file found in config dir!'
  end
end
