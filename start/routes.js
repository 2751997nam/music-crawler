'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('welcome');
Route.group(() => {
    Route.get('/manga', 'CrawlMangaController.crawl');
    Route.get('/chapter', 'CrawlChapterController.crawl');
}).prefix('crawl');
Route.get('/manga', 'MangaController.index');
Route.get('/manga/:id', 'MangaController.show');
Route.get('/chapter/:id', 'ChapterController.show');