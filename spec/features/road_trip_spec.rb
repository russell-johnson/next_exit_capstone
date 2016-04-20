require 'rails_helper'

feature 'Sign up', js: true do 
  before(:each) do 
    visit root_path
  end

  scenario 'clicks sign up and signs up' do 
    click_link('Sign Up')
    fill_in('User name', with: 'test')
    fill_in('Email', with: 'test@testemail.com')
    fill_in('Password', with: 'password')
    fill_in('Password confirmation', with: 'password')
    click_button('Sign up')
  end

  # feature 'Log in', js: true do 
  #   before(:each) do 
  #     visit root_path
  #   end
  # end

  scenario 'Clicks log in and logs in' do 
    click_link('Login')
    fill_in('Email', with: 'test@testemail.com')
    fill_in('Password', with: 'password')
    find('label', :text => 'Remember me').click
    click_button('Log in')
  end
end
