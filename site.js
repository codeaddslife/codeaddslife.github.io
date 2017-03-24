var fs = require('fs');
var glob = require("glob")
var Handlebars = require('handlebars');
var koara = require('koara');
var koaraHtml = require('koara-html');
var matter = require('gray-matter');
var path = require('path');
var template = Handlebars.compile(fs.readFileSync('template.html', "utf8"));

glob("**/*.kd", {}, function (er, files) {
    for(i in files) {
        var file = matter(fs.readFileSync(files[i], "utf8"));
        var result = new koara.Parser().parse(file.content)
        var renderer = new koaraHtml.Html5Renderer();

        renderer.headingIds = true;
        result.accept(renderer);
        file.data.body = renderer.getOutput();

        var html = template(file.data);
        fs.writeFileSync(path.dirname(files[i]) + "/" + path.basename(files[i], '.kd') + ".html", html);
    }
});



