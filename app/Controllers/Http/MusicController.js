'use strict'
const MusicCrawler = use('App/Crawlers/impl/MusicCrawler');
class MusicController {
    async crawl({params, response, view}) {
        const musicCrawler = new MusicCrawler();
        let retVal = await musicCrawler.init({});

        response.json({
            status: 'successful'
        });
    }
}

module.exports = MusicController;
