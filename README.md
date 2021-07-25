[![codecov](https://codecov.io/gh/dChancellor/url_shortener/branch/master/graph/badge.svg?token=49KV7U5FO4)](https://codecov.io/gh/dChancellor/url_shortener)

# URL Shortener

## Background

This is simply a first project for backend/routing/API/authentication practice. Additionally, I used p5 for the first time for some zen-like canvas graphics to peacefully watch.

To run, you will need an active mongoDB database and a google client API. To get these, simply follow these instructions.

## Instructions

#### For Mongo

You have one of three options for your mongo DB. You can either run it locally on your system by installing it from [mongodb](https://www.mongodb.com/), spin up a docker container from [docker](https://hub.docker.com/_/mongo/), or have some cloud mongo service such as [atlas](https://www.mongodb.com/cloud/atlas).

Ultimately, you will need a MongoDB URI. 

#### For Google API

This is perhaps a bit more complicated, but if you work through the google documentation [here](https://support.google.com/googleapi/answer/6158849?hl=en&ref_topic=7013279) then you will finish with a google client ID, google client secret. Use `[YOUR DOMAIN HERE]/oauth/google/callback` for your callback url. 

#### Cookie Key

Generate a random cookie key!

#### Final Steps

After these steps have been completed, all you need to do is download this repo. Add your environment variables into the `.env.sample` file and rename it to `.env`. After this file has been altered, simply run `npm run dev` if you want to test locally. 


