FactoryGirl.define do 
  factory :user do 
    first_name 'John'
    last_name 'Doe'
    email 'test@testemail.com'
    password 'password'
  end
end