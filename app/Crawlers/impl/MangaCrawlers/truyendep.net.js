const BaseMangaCrawler = require("../../BaseMangaCrawler");
const axios = require('axios')

class MangaCrawler extends BaseMangaCrawler {
    init() {
        this.getCrawlUrls();
    }

    getCrawlUrls = async () => {
        let crawlUrls = [];
        let url = 'https://truyendep.net/wp-content/themes/manga/list-manga-front.js';

        axios.get(url)
            .then(res => {
                let data = res.data;
                for (let item of data) {
                    this.addJob('MangaListener', {crawl_url: item.link, domain: this.getDomain(item.link)}, {priority: 20});
                    return;
                }
            })
        

        return crawlUrls;
    }
}

module.exports = MangaCrawler;