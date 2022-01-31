'use strict'
const { exec } = require('child_process');
const BaseListener = require('../BaseListener');
const util = use("App/Utils/util");
const Manga = use("App/Models/Manga");
const Database = use("Database");
const Log = use('App/Utils/Log');
const axios = require('axios');
const fse = require('fs-extra');

class MangaAvatarListener extends BaseListener {
    getParser() {
        return;
    }

    async init(input) {
        this.crawlUrl = input.crawl_url;
        this.input = input;
        let result = [];
        let path = '/images/avatars/' + input.slug + '.jpg';
        this.downloadImage(input.crawl_url, './public/' + path)
            .then(res => {
                if (res) {
                    this.saveManga(path);
                }
            }).catch(error => {
                Log.info('downloadImage ', error.getMessage());
            })
    }

    async downloadImage (url, path) {
        return await axios({
            url,
            responseType: 'stream',
        }).then(async response => {
            fse.outputFileSync(path, '');
            return new Promise((resolve, reject) => {
                response.data.pipe(fse.createWriteStream(path, {
                    flags: 'w'
                }))
                .on('error',(error)=>{
                    console.log(error)
                    reject(false);
                })
                .on('finish', function (err) {
                    resolve(true);
                });
            })
        }).catch(error => {
            console.log(error);
            Log.info('downloadImage ', error);
            return false;
        });
    }

    async saveManga(path) {
        let manga = await Manga.query().where('id', this.input.id).select('*').first();
        if (manga) {
            manga.image = path;
            await manga.save();
        }
        return manga;
    }
}

module.exports = MangaAvatarListener;