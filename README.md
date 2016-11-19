# Real Reality (winner of [Prague Hacks 2016 Hackathon](http://www.praguehacks.cz/)) 

When you want to buy or rent an apartment (house) you do (or should do) research about things that matter to you. Air pollution, parking, public transport availability (commutation time!), noisiness, places for kids...you name it. But it is unfortunately very time consuming. Until now! Now you've got our beautiful Chrome extension which do all the research for you. Well right now just part of it, but more will come!

Original idea was that Real Reality will be webpage where you can see mashup of real estate offers and interesting data (see above). But it's more work and we want to just show proof of concept before next steps, so we choose to create Chrome extension first (extension deployed to [Chrome Web Store](https://chrome.google.com/webstore/detail/real-reality/obkcimklomeknmfjmglfggenjijioenj?utm_source=gmail)).

## What to do next?

1. web page which aggregates or have real estate offers and enrich them with data we've got (thanks to http://www.iprpraha.cz/)
1. thirdparty widget (like google analytics) which can any webmaster add to it's page with real estate offers.
1. add more enrichments
1. better UI/UX
1. .... your idea ....

## Hacking

1. get code `git clone git@github.com:realreality/reality-plugin.git`
1. inside run `yarn` / `npm install` to install dependencies
1. `yarn start` / `npm start` starts a dev servers and creates a `./build` directory in `<project-root>` which can be loaded as unpacked extension
1. `<your-code-here>`
1. to get the production version run `yarn build` / `npm run build`
1. check the code style with `yarn lint` / `npm run lint`
1. `git commit -m "my new great addition!"`
1. `git push`

Final extension structure
```bash
build
├── _locales
├── background.bundle.js
├── contentscript.bundle.js
├── css
├── fonts
├── images
└── manifest.json
```
Main script is in **./src/js/contentscript.js**

IPR API is backed by [IPR Data Rest API Server](https://github.com/realreality/reality-backend).

## Thanks to

[Institut plánování a rozvoje hlavního města Prahy](http://www.iprpraha.cz/) for [releasing used data sets (like air pollution)](http://www.geoportalpraha.cz/cs/clanek/271/prazska-otevrena-data) for free.

[Open Society Fund Praha / Fond Otakara Motejla](http://www.otevrenadata.cz/) for their [open data](https://en.wikipedia.org/wiki/Open_data) activities (like organizing Prague Hacks hackathon and other similar events, propagation the open data idea in goverment institutions..etc.). 

 Samuel Simões - this extension is built on top of the scaffold [chrome-extension-webpack-boilerplate](https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate)




