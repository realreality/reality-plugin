# Real Reality

In the end Real Reality could be a page where you can see
mashup of real estate offers and interesting data like
public transport availability, noise, air pollution, parking zones, kids friendliness...you name it.

You do (or should do) this kind of research by yourself before you
buy or rent a house/flat. But it is very very time consuming. Until now! Now you've got our Chrome extension which do research for you.

Right now we created a Chrome Extension (it's not in the Chrome Web Store yet) to quickly create a proof of concept of this idea.


## What to do next? ##

1. web page which aggregates or have real estate offers and enrich them with data we've got (thanks to http://www.iprpraha.cz/)
1. thirdparty widget (like google analytics) which can any webmaster add to it's page with real estate offers.
1. add more enrichments
1. better UI/UX
1. .... your idea ....

## Hacking ##

1. git clone git@github.com:krtek/reality.git
1. install npm
1. npm install  (download all dependencies)
1. npm install -g bower (install bower)
1. bower install
1. gulp watch (or https://gist.github.com/michalbcz/8b0bafbfe17c03d30ebd8cec09acecb4)
1. git commit -m "my new great addition!"
1. git push

Main script is in **/app/scripts.babel/contentscript.js** (this is transpiled from ES6 -> ES5 by babel to placed in /app/scripts directory).
This is quick'n'dirty solution so don't cry please :)
