// CLICK HANDLERS
$(".add-source").on("click", function(){
    $("#addSource").modal();
});

$("body").on("click", ".source-close", function(){
    deleteSource( $(this).attr("oid") );
});

$("#addButton").on("click", function(){
    var header = $("#inputHeader").val();
    var logo = $("#inputLogo").val();
    var color = $("#inputColor").val();
    var api = $("#inputApi").val();
    addSource(api, color, header, logo);
});

$(".login-link").on("click", function(){
    $("#login").modal();
});
$("#loginButton").on("click", function(){
    var email = $("#inputEmail").val();
    var password = $("#inputPassword").val();
    login(email, password);
});

$("#signupButton").on("click", function(){
    var email = $("#inputEmail").val();
    var password = $("#inputPassword").val();
    signup(email, password);
});

$("body").on("click", ".source", function(e){
    $(".source").removeClass("selected");
    $(this).addClass("selected");
});

$("body").on("click", "div.article a", function(e)
{
    e.stopPropagation();
});

$("body").on("click", "div.article", function()
{
    var article = $(this);
    if (article.find(".loading").length!==0)
    {
        return;
    }
    $("div.summary").hide();
    if (article.hasClass("selected"))
    {
        article.removeClass("selected");
        return;
    }
    article.addClass("selected");
    if (article.find(".summary").length!==0)
    {
        article.find(".summary").show();
        return;
    }
    
    var url = article.find("h2 a").attr("href");
    // handle image link
    if (url == "#" || url == undefined)
    {
        article.find(".col-md-10").append('<div class="summary">There\'s no URL to summarize here.</div>');
        return;
    }
    if (url.match(/\.(jpeg|jpg|gif|png)$/) != null)
    {
        article.find(".col-md-10").append('<div class="summary"><img class="summary-image" src="' + url + '"/></div>');
        return;
    }
    // handle imgur, youtube, and other rich data sources w/ embedly or sources that otherwise won't work
    if (url.match(/(imgur.com|youtube.com|instagram.com|twitter.com|amazon.com|flickr.com|twitch.tv|vimeo.com|ustream.tv|vine.co|soundcloud.com|grooveshark.com|last.fm|spotify.com|rdio.com|bop.fm|hypem.com|youtu.be|instagr.am|nytimes.com|nyti.ms|mixcloud.com)/i) != null)
    {
        getSummary(url, function(summary)
        {
            if (summary == false)
            {
                article.find(".col-md-10").append('<div class="summary"><a href="' + url + '">' + url + '</a></div>');
                article.find(".summary").embedly({
                    key: '1feb0ac822504e7db52252655f1c0a79',
                    done: function(results){
                        postSummary(url, article.find(".summary").html());
                    }
                });
            }
            else
            {
                article.find(".col-md-10").append('<div class="summary">' + summary + '</div>');
            }
            if (url.match(/(youtube.com|vimeo.com|youtu.be)/i) != null)
            {
                var embed = article.find(".embedly-embed");
                article.find(".embedly-embed").css("height", embed.width()*9/16+"px");
            }
        });

        return;
    }

    // add loading image
    article.find(".col-md-10").append('<img class="loading" src="imgs/ajax-loader.gif"/>');

    // handle reddit
    if (url.match(/(reddit.com)/i) != null)
    {
        getSummary(url, function(summary)
        {
            if (summary == false)
            {
                var a = document.createElement('a');
                a.href = url;
                var pathlist = a.pathname.split("/");
                pathlist = $.grep(pathlist,function(n){ return(n); });
                var urlparams = "";
                for (var i = 0; i < pathlist.length; i++)
                {
                    var param = pathlist[i];
                    urlparams = urlparams + "&kimpath" + (i+1) + "=" + param;
                }
                var redditapi = "2b470ss0";
                if (pathlist[5] != undefined)
                {
                    redditapi = "7oycj7wk";
                }
                $.ajax({
                    url:"https://www.kimonolabs.com/api/" + redditapi + "?apikey=989877be85a3ca05477428c8b41d4fbe" + urlparams,
                    success: function (response) {
                        
                        var linkcontent = " ";
                        if (response.results.links != undefined)
                        {
                            var links = response.results.links;
                            for (var i = 0; i < links.length; i++)
                            {
                                var link = links[i].link;
                                linkcontent = linkcontent + '<br><a class="reddit-link" href="' + link + '">' + link + '</a>';
                            }
                        }

                        article.find(".loading").remove();

                        if (response.lastrunstatus != false)
                        {
                            article.find(".col-md-10").append('<div class="summary">' + response.results.content[0].text + linkcontent + '</div>');
                            postSummary(url, response.results.content[0].text + linkcontent);
                        }
                        else
                        {
                            article.find(".col-md-10").append('<div class="summary">No summary available for this content.</div>');
                        }
                    },
                    error: function (xhr, status) {
                        console.log("error");
                    }, 
                    dataType: "jsonp"
                });
            }
            else
            {
                article.find(".loading").remove();
                article.find(".col-md-10").append('<div class="summary">' + summary + '</div>');
            }
        });
        
        return;
    }

    getSummary(url, function(summary)
    {
        if (summary == false)
        {
            $.ajax({
                url: "https://sender.blockspring.com/api_v1/blocks/4cb25739ecb0859eded3c310e80c2763?api_key=0cbedf965e96b67e781a3c04d418b31d",
                type: "POST",
                data: { url: url},
                crossDomain: true
            }).done(function(response){
                article.find(".loading").remove();
                if (response.results == "" || response.results.indexOf("IOError") >= 0 )
                {
                    article.find(".col-md-10").append('<div class="summary"><a href="' + url + '">' + url + '</a></div>');
                    article.find(".summary").embedly({
                        key: '1feb0ac822504e7db52252655f1c0a79',
                        done: function(results){
                            postSummary(url, article.find(".summary").html());
                        }
                    });
                    return;
                }
                article.find(".col-md-10").append('<div class="summary">' + response.results + '</div>');
                postSummary(url, response.results);
            });
        }
        else
        {
            article.find(".loading").remove();
            article.find(".col-md-10").append('<div class="summary">' + summary + '</div>');
        }

    });
    
});

// INITIALIZATION

kimonoLoadArticles("HN Digest", "#ff6600", "bsiqi5o0");

// SOURCE LOADING

function kimonoLoadArticles(header, color, apiId)
{
    $("div.articles").html('<img class="loading" src="imgs/ajax-loader.gif"/>');
    $.ajax({
        url:"https://www.kimonolabs.com/api/" + apiId + "?apikey=989877be85a3ca05477428c8b41d4fbe",
        success: function (response) {
            loadArticles(header, color, response.results["collection1"]);
        },
        error: function (xhr, status) {
            console.log("error");
        }, 
        dataType: "jsonp"
    });
}

function loadArticles(header, color, items)
{
    var articles = "";

    for (var i=0; i<items.length; i++)
    {
        var item = items[i];
        if (item.title.text != undefined)
        {
            var title = item.title.text;
        }
        else
        {
            var title = item.title;
        }
        if (item.title.href != undefined)
        {
            var url = item.title.href;
        }
        else
        {
            var url = "#";
        }
        var points = "";
        if (item.points != undefined)
        {
            if (item.points.text != undefined)
            {
                points = item.points.text;
            }
            else{
                points = item.points;
            }  
        }

        var time = "";
        if (item.submitted != undefined)
        {   
            if (item.submitted.text != undefined)
            {
                time = item.submitted.text;
            }
            else
            {
                time = item.submitted;
            }
        }
        
        var author = "";
        if (item.author != undefined)
        {
            if (item.author.text != undefined)
            {
                author = item.author.text;
            }
            else
            {
                author = item.author;
            }
        }
        var comments = "";
        var comment_url = "#";
        if (item.comments != undefined)
        {
            if (item.comments.text != undefined)
            {
                comments = item.comments.text.split("comments")[0].replace("discuss", " ").replace("comment", " ");
                if (item.comments.href != undefined)
                {
                    comment_url = item.comments.href;
                }
            }
            else
            {
                comments = item.comments;
            }
        }
        if (comments!="")
        {
            comments = '<i class="icon icon-material-forum"></i> ' + comments;
        }

        articles += '<div class="row article">' +
           '<div class="col-md-1 col-sm-2 col-xs-2 votes">' +
                points +
            '</div>' +
            '<div class="col-md-10 col-sm-8 col-xs-8 article-title-container">' +
                '<h2><a target="_blank" href="' + url + '"><span class="overflow-span">' + title + '</span></a></h2>' +
                '<span class="details">' + time + ' &middot; ' + author + '</span>' +
            '</div>' +
            '<div class="col-md-1 col-sm-2 col-xs-2">' +
                '<a class="comments" target="_blank" href="' + comment_url + '">' + comments + '</a>' +
            '</div>' +
        '</div>';
    }

    $(".kim-heading").text(header).css("color", color);

    $("div.articles").html(articles);
    
}

