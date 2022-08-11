'use strict'
const ListSingerCrawler = use('App/Crawlers/impl/ListSingerCrawler');

class ListSingerController {
    async crawl({params, response, view}) {
        const listMusic = new ListSingerCrawler();
        let retVal = await listMusic.init({});

        response.json({
            status: 'successful'
        });
    }
}

module.exports = ListSingerController;
