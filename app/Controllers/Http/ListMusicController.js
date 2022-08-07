'use strict'
const ListMusicCrawler = use('App/Crawlers/impl/ListMusicCrawler');
class ListMusicController {
    async crawl({params, response, view}) {
        const listMusic = new ListMusicCrawler();
        let retVal = await listMusic.init({});

        response.json({
            status: 'successful'
        });
    }
}

module.exports = ListMusicController;
