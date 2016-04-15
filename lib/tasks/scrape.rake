namespace :scrape do
  desc "Scrape Gas Buddy for Price By State"
  task gas_price: :environment do
    agent = Mechanize.new
    page = agent.get"http://www.gasbuddy.com/USA"
    results = page.search('#searchItems').children
    results.pop
    results.shift
    states = results.reject {|x| x.text == results[1].text }
    data = {}
    states.each do |state|
      s = state.children[1].children[1].children
      good = s.reject {|x| x.text == s[0].text}
      data[good[0].text.strip] = good[1].text.strip
    end

    binding.pry

  end

end
