'use strict'

const Config = use('Config');
const got = require('got');
const util = require('../../Utils/util');
const Manga = use('App/Models/Manga');
const Chapter = use('App/Models/Chapter');

class MangaController {
    async index({request, response}) {
        let filter = request.body();
        if (!filter.page_size) {
            filter.page_size = 20;
        }

        if (!filter.page_id) {
            filter.page_id = 0;
        }
        
        const mangas = await Manga.query().innerJoin('chapter', 'manga.id', 'chapter.manga_id')
            .where('chapter.status', 'ACTIVE')
            .limit(filter.page_size)
            .offset(filter.page_size * filter.page_id)
            .select('manga.id', 'manga.name', 'manga.slug', 'manga.image_url')
            .distinct();
        for(let index of mangas) {
            mangas[index].url = '/manga/' + mangas[index].id;
        }
        
        return response.json({
            status: 'successful',
            result: mangas
        });
    }

    async show({request, response}) {
        let id = request.param('id');
        let chapters = await Chapter.query().where('manga_id', id).orderBy('sorder', 'desc').select('id', 'name');

        for(let index of chapters) {
            chapters[index].url = '/chapter/' + chapters[index].id;
        }

        return response.json({
            status: 'successful',
            result: chapters
        });
    }
}

module.exports = MangaController;
