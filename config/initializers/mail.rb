if Rails.env.development?
  mail = "#{Rails.root}/config/mail.yml"
  if File.exists? mail
    YAML.load_file(mail).each { |key, value| ENV[key] = value.to_s }
  else
    raise "mail.ym file required"
  end
end
