Rails.application.routes.draw do

  get 'about_us/index'

  post '/waypoints', to: 'road_trips#waypoints'

  get 'about_us/todd'

  get 'about_us/jacob'

  get 'about_us/russell'

  get 'about_us/parker'

  get 'about_us/contact_us'

  get 'road_trips/display'

  get 'road_trips/my_trips', to: 'road_trips#my_trips'

  devise_for :users, controllers: {omniauth_callbacks: 'users/omniauth_callbacks'}


  root 'road_trips#index'

  resources :about_us
  resources :road_trips

  get '/search_results' => 'road_trips#search'

end
