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

const MangaLinkCrawlerManager = require(__dirname + "/app/Crawlers/impl/MangaLinkCrawlerManager");
const ListenerManager = require(__dirname + "/app/Listeners/ListenerManager");

Redis.del('bull*').then(function () {
    ListenerManager.init();
});

process.on('uncaughtException', (error) => {
    console.log(error);
});
const mangaLinkCrawlerManager = new MangaLinkCrawlerManager();
schedule.scheduleJob('30 */6 * * *', function(){
    mangaLinkCrawlerManager.init({});
});

const MangaCrawler = require(__dirname + '/app/Crawlers/impl/MangaCrawler');
const mangaCrawler = new MangaCrawler();

schedule.scheduleJob('0 */1 * * *', function(){
    mangaCrawler.init({});
});

const ImageCrawler = require(__dirname + '/app/Crawlers/impl/ImageCrawler');
const imageCrawler = new ImageCrawler();
const MangaAvatarCrawler = require(__dirname + '/app/Crawlers/impl/MangaAvatarCrawler');
const mangaAvatarCrawler = new MangaAvatarCrawler();
setTimeout(() => {
    imageCrawler.init(); 
    mangaAvatarCrawler.init();
}, 3000);
