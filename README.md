# Wonder Trade Analytics

This is the start of the pokemon wondertrade analytics page.
The current build can be found at: http://www.wondertradeanalytics.com/

## About this App

This is an express app that allows users to post wonder trades that they receive, and displays the wonder trade data
graphed out. I'm using redis as the dataStore for this app. At its current implementation, I fetch all wonder trade
data from redis, and store a parsed version in memory. 

This in-memory solution will go away one day... I never thought this app would have still been in use today,
and never would have imagined the number of entries that have been posted, otherwise I would have probably chosen an
actual database over redis... but, it works for now™ :D

## Getting started

### Pull in dependencies

```
sudo apt-get install npm  
sudo apt-get install node  
sudo apt-get install redis-server  
```

### Pull in npm dependencies

```
sudo npm install  
sudo npm install -g nodemon
```

### Start Redis

```
cd /directory/with/dump.rdb
redis-server
```

### Start the server

```
npm start
```