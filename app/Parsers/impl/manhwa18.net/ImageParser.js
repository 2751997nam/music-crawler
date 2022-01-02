"use strict";
const util = use("App/Utils/util");
const BaseParser = use("App/Parsers/BaseParser");
const Chapter = use("App/Models/Chapter");
const Database = use("Database");
const Log = use('App/Utils/Log');
const axios = require('axios');
const fse = require('fs-extra');

class ImageParser extends BaseParser {
    async init(input) {
        this.crawlUrl = input.crawl_url;
        this.input = input;

        let images = JSON.parse(input.images);
        let result = [];
        let promises = [];
        for (let index in images) {
            let image = images[index];
            let path = '/manga/' + input.manga_name.replace(/\s+/g, '-') + '/' + input.name.replace(/\s+/g, '-') + '/' + index + '.jpg';
            let promise = this.downloadImage(image.image_url, './public/' + path)
                .then(res => {
                    if (res) {
                        result.push({
                            image_url: path,
                            original_url: image.image_url,
                            index: parseInt(index)
                        });
                    }
                }).catch(error => {
                    Log.error(error);
                })
            promises.push(promise);
        }
        Promise.all(promises)
            .then(() => {
                this.saveChapter(result);
            })
        Log.info('parsed chapter images: ', chapter.name);
    }

    async downloadImage (url, path) {
        return await axios({
            url,
            responseType: 'stream',
        }).then(response => {
            fse.outputFileSync(path, '');
            response.data.pipe(fse.createWriteStream(path, {
                flags: 'w'
            }));
            return true;
        }).catch(error => {
            console.log(error);
            Log.error('downloadImage ', error);
            return false;
        });
    }

    async saveChapter(images) {
        images.sort(function (a, b) {
            if (a.index < b.index) {
                return -1;
            } else if (a.index > b.index) {
                return 1;
            } else {
                return 0;
            }
        })
        let chapter = await Chapter.query()
            .where((query) => {
                query.where('crawl_url', this.crawlUrl)
                    .orWhere('slug', this.input.slug);
            })
            .where('manga_id', this.input.manga_id).select('*').first();
        if (chapter) {
            chapter.images = JSON.stringify(images);
            chapter.status = 'ACTIVE';
            await chapter.save();
        }
        return chapter;
    }
}

module.exports = ImageParser;
