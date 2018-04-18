const fs = require('fs');
const globby = require('globby');
const Handlebars = require('handlebars');
const koara = require('koara');
const koaraHtml = require('koara-html');
const matter = require('gray-matter');
const mkdirp = require('mkdirp');
const path = require('path');
const matterOptions = {parser: require('js-yaml').safeLoad}
const layout = fs.readFileSync('templates/layout.hbs').toString();
const template = Handlebars.compile(layout);
const minify = require('html-minifier').minify;
const feedItems = [];

globby.sync('**/*.kd').forEach(function (kd) {
    const fileMatter = matter.read(kd, matterOptions);
    const title = fileMatter.data.title ? fileMatter.data.title + " - codeaddslife" : "codeaddslife";

    const result = new koara.Parser().parse(fileMatter.content)
    const renderer = new koaraHtml.Html5Renderer();
    renderer.headingIds = true;
    result.accept(renderer);

    const html = template({"title": title, "body": renderer.getOutput()});
    const htmlMin = minify(html, {collapseWhitespace: true, removeComments: true});
    mkdirp.sync(path.dirname(kd));

    const fileName = kd.toString().substring(0, kd.toString().length - 3) + ".html";
    fs.writeFileSync(fileName, htmlMin);
    if(path.dirname(kd) === 'articles') {
        feedItems.push({title: fileMatter.data.title, link: 'https://www.codeaddslife.com/' + fileName, description: renderer.getOutput(), pubDate: fileMatter.data.dateUpdated ?  fileMatter.data.dateUpdated : fileMatter.data.datePublished})
    }
});




// create rssFeeds
feedItems.sort((a, b) => { return a.pubDate < b.pubDate});
const feedTemplate =  Handlebars.compile(fs.readFileSync('templates/feed.hbs').toString());
fs.writeFileSync('feed.xml', feedTemplate({feedItems: feedItems}));