"use strict";

/*
|--------------------------------------------------------------------------
| Http server
|--------------------------------------------------------------------------
|
| This file bootstrap Adonisjs to start the HTTP server. You are free to
| customize the process of booting the http server.
|
| """ Loading ace commands """
|     At times you may want to load ace commands when starting the HTTP server.
|     Same can be done by chaining `loadCommands()` method after
|
| """ Preloading files """
|     Also you can preload files by calling `preLoad('path/to/file')` method.
|     Make sure to pass relative path from the project root.
*/

const { Ignitor } = require("@adonisjs/ignitor");
const Log = require('./app/Utils/Log');
const Redis = require('./app/Utils/Redis');
global.__basedir = __dirname;

new Ignitor(require("@adonisjs/fold"))
    .appRoot(__dirname)
    .fireHttpServer()
    .catch(Log.error);

const schedule = require('node-schedule');

const ListenerManager = require(__dirname + "/app/Listeners/ListenerManager");

Redis.del('bull*').then(function () {
    ListenerManager.init();
});

process.on('uncaughtException', (error) => {
    console.log(error);
});

const ListMusicCrawler = require(__dirname + '/app/Crawlers/impl/ListMusicCrawler');
const listMusicCrawler = new ListMusicCrawler();

const MusicCrawler = require(__dirname + '/app/Crawlers/impl/MusicCrawler');
const musicCrawler = new MusicCrawler();

const LinkCrawler = require(__dirname + '/app/Crawlers/impl/LinkCrawler');
const linkCrawler = new LinkCrawler();

// schedule.scheduleJob('0 */8 * * *', function(){
//     listMusicCrawler.init({});
// });
//musicCrawler.init({});
listMusicCrawler.init({});
// linkCrawler.init({});
schedule.scheduleJob('0 */1 * * *', function(){
});
