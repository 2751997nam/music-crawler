'use strict'

const Config = use('Config');
const got = require('got');
const util = require('../../Utils/util');
const Chapter = use('App/Models/Chapter');

class ChapterController {
    async show({params, response, view}) {
        let id = params.id;
        let chapter = await Chapter.query().where('id', id).first();
        chapter.images = JSON.parse(chapter.images);
        let chapters = await Chapter.query().where('status', 'ACTIVE').select('id', 'name', 'slug');

        const html = await view.render('chapter', {
            chapter: chapter,
            chapters: chapters
        })
          
        return html;
    }
}

module.exports = ChapterController;
