const fs = require('fs');
const globby = require('globby');
const Handlebars = require('handlebars');
const koara = require('koara');
const koaraHtml = require('koara-html');
const matter = require('gray-matter');
const mkdirp = require('mkdirp');
const path = require('path');
var highlight = require('pygments').colorizeSync;
var matterOptions = {parser: require('js-yaml').safeLoad}
var layout = fs.readFileSync('layout.hbs').toString();
var template = Handlebars.compile(layout);
var minify = require('html-minifier').minify;
var urlExists = require('url-exists');

globby.sync('**/*.kd').forEach(function (kd) {
    var fileMatter = matter.read(kd, matterOptions);
    var title = fileMatter.data.title ? fileMatter.data.title + " - codeaddslife" : "codeaddslife";

    var result = new koara.Parser().parse(fileMatter.content)
    var renderer = new koaraHtml.Html5Renderer();
    renderer.headingIds = true;

    renderer.visitLink = function (node) {
        urlExists('https://www.google.com', function(err, exists) {
            console.log("Check " + node.value + "... " + (exists ? "OK!" : "NOK!"));
            if(!exists) {
                process.exit(1);
            }
        });

        this.out += "<a href=\"" + this.escapeUrl(node.value.toString()) + "\">";
        node.childrenAccept(this);
        this.out += "</a>";
    }


    result.accept(renderer);

    var html = template({"title": title, "body": renderer.getOutput()});
    var htmlMin = minify(html, {collapseWhitespace: true, removeComments: true});
    mkdirp.sync(path.dirname(kd));
    fs.writeFileSync(kd.toString().substring(0, kd.toString().length - 3) + ".html", htmlMin);
});