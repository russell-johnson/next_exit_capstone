class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
def facebook
    # need to implement from_omniauth in the user.rb model
    @user = User.from_omniauth(request.env["omniauth.auth"])

    if @user.persisted? 
      sign_in_and_redirect @user, event: :authentication
      set_flash_message(:notice, :success, kind: "Facebook")
    else
      session["devise.facebook_data"] = request.env[ "omniauth.auth"]
      redirect_to new_user_registration_url
    end
  end
  
  # You should configure your model like this:
  # devise :omniauthable, omniauth_providers: [:twitter]

  # You should also create an action method in this controller like this:
  # def twitter
  # end

  # More info at:
  # https://github.com/plataformatec/devise#omniauth

  # GET|POST /resource/auth/twitter
  # def passthru
  #   super
  # end

  # GET|POST /users/auth/twitter/callback
  # def failure
  #   super
  # end

  # protected

  # The path used when OmniAuth fails
  # def after_omniauth_failure_path_for(scope)
  #   super(scope)
  # end
end