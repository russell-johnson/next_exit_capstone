Rails.application.routes.draw do

  get 'about_us/index'

  post '/waypoints', to: 'road_trips#waypoints'

  get 'about_us/todd'

  get 'about_us/jacob'

  get 'about_us/russell'

  get 'about_us/parker'

  devise_for :users, controllers: {omniauth_callbacks: 'users/omniauth_callbacks'}


  root 'road_trips#index'

  resources :about_us

end
