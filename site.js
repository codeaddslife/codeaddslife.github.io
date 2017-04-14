const fs = require('fs');
const globby = require('globby');
const Handlebars = require('handlebars');
const koara = require('koara');
const koaraHtml = require('koara-html');
const matter = require('gray-matter');
const mkdirp = require('mkdirp');
const path = require('path');

var matterOptions = { parser: require('js-yaml').safeLoad }

var layout = fs.readFileSync('layout.hbs').toString();
var template = Handlebars.compile(layout);

globby.sync('**/*.kd').forEach(function (kd) {
    var fileMatter = matter.read(kd, matterOptions);
    var title = fileMatter.data.title ? fileMatter.data.title + " - codeaddslife" :  "codeaddslife";

    var result = new koara.Parser().parse(fileMatter.content)
    var renderer = new koaraHtml.Html5Renderer();
    renderer.headingIds = true;
    result.accept(renderer);

    var html = template({"title": title, "body": renderer.getOutput()});
    mkdirp.sync(path.dirname(kd));
    fs.writeFileSync(kd.toString().substring(0, kd.toString().length - 3) + ".html", html);
});