 // PARSE INIT
$(document).on("ready", function(){
    var token = getCookie("sessionToken");
    $.parse.init({
        app_id : "X5BI6AKRaHjDARCRv6MbSfPaDDea8dh4nsVt9Swa", // <-- enter your Application Id here 
        rest_key : "8GMw0nRaw8ZyjTSm0ZkMCpr62skq4xt8S2CpqMmQ", // <--enter your REST API Key here  
        session_token : token  
    });
    if (token != "" && token != undefined)
    {
        $(".login-link").hide();
        $(".add-source").show();
        loadSources();
    }
});

// USER AUTH

function signup(email, password)
{
    $.parse.signup({ 
        username : email, 
        password : password, 
        email : email 
    }, function(json){
        setCookie("sessionToken", json.sessionToken);
        $.parse.init({
            app_id : "X5BI6AKRaHjDARCRv6MbSfPaDDea8dh4nsVt9Swa", // <-- enter your Application Id here 
            rest_key : "8GMw0nRaw8ZyjTSm0ZkMCpr62skq4xt8S2CpqMmQ", // <--enter your REST API Key here  
            session_token: json.sessionToken  
        });
        $(".login-link").hide();
        $(".add-source").show();
    });
}

function login(email, password)
{
    $.parse.login(email, password, function(json){
        setCookie("sessionToken", json.sessionToken);
        $.parse.init({
            app_id : "X5BI6AKRaHjDARCRv6MbSfPaDDea8dh4nsVt9Swa", // <-- enter your Application Id here 
            rest_key : "8GMw0nRaw8ZyjTSm0ZkMCpr62skq4xt8S2CpqMmQ", // <--enter your REST API Key here  
            session_token: json.sessionToken  
        });
        $(".login-link").hide();
        $(".add-source").show();
        loadSources();
    }, function(json){
        console.log(json);
    });
}

function resetPassword(email)
{
    $.parse.requestPasswordReset(email, function(json){
        console.log(json);
    }, function(json){
        console.log(json);
    });
}

// Store Summaries

function postSummary(url, summary)
{
    $.parse.post('content',{ url : url, summary: summary, ACL: {"*":  { "read": true } } }, function(json){
        return;
    });
}

// Get Summaries

function getSummary(url, callback)
{
    $.parse.get('content', { where: { url : url }}, function(json){
        if (json.results[0] != undefined){
            callback(json.results[0].summary);
        }
        else
        {
            return callback(false);
        }
    });
}

// Add Source

function addSource(api, color, header, logo)
{
    $.parse.get("users/me", {}, function(json){
        var user = {
            __type: "Pointer",
            className: "_User",
            objectId: json.objectId
        };
        var acl = {};
        acl[json.objectId] =  { "read": true, "write": true};
        $.parse.post("sources", {
            api : api,
            color : color,
            header : header,
            logo : logo,
            user : user,
            ACL : acl
        }, function(source){
            $(".source").removeClass("selected");
            kimonoLoadArticles(header, color, api);
            $(".news-sources-scroll").append("<span class=\"source selected\" onclick=\"kimonoLoadArticles('" + header +"', '" + color + "', '" + api + "')\"><img class=\"sources-img\" src=\"" + logo + "\" /> <a class=\"source-link\" >" + header + "</a><a oid=\"" + source.objectId + "\" class=\"source-close\"></a></span>");
        });
    });
}

// Load Sources
function loadSources()
{
    $.parse.get("users/me", {}, function(json){
        var user = {
            __type: "Pointer",
            className: "_User",
            objectId: json.objectId
        };
        $.parse.get("sources", {"where": {"user": user}}, function(json){
            var results = json.results;
            for (var i = 0; i < results.length; i++)
            {
                var source = results[i];
                $(".news-sources-scroll").append("<span class=\"source\" onclick=\"kimonoLoadArticles('" + source.header +"', '" + source.color + "', '" + source.api + "')\"><img class=\"sources-img\" src=\"" + source.logo + "\" /> <a class=\"source-link\" >" + source.header + "</a><a oid=\"" + source.objectId + "\" class=\"source-close\"></a></span>");
            }
        });
    });
}

// Delete Source by Object ID
function deleteSource(oid)
{
    $.parse.delete('sources/' + oid, function(json){
        $("[oid='" + oid + "']").parent(".source").remove();
    });
}

// Cookie Management functions

function setCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (730*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
    }
    return "";
}