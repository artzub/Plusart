/**
 * User: Artzub
 * Date: 30.10.12
 * Time: 0:45
 */

/**
 * tooltip content generators
 */

function getHeader(actor, posturl, date) {
    return [
        '<a class="photo" href="',
        actor.url,
        '">',
        '<img src=',
        actor.image.url,
        '>',
        '</a>',
        '<div class="head">' +
            '<header>' +
            '<h3>' +
            '<a href="',
        actor.url,
        '">',
        actor.displayName,
        '</a>' +
            '</h3>',
        '<span class="date">' +
            '<a href="',
        posturl,
        '" target="_blank" class="">',
        date ? dateFormat(new Date(date)) + (posturl == actor.url ? " — look profile" : " — look post") : 'original post',
        '</a>' +
            '</span>' +
            '</header>' +
            '</div>'].join("");
}

function getContent(post) {
    if (!post)
        return "";

    var cont = ['<div class="m-l62 content">'];

    if (post.verb == "share") {
        if (post.annotation) {
            cont.push(
                '<div class="post-an">',
                '<div>',
                post.annotation,
                '</div>',
                '</div>'
            );
        }
        cont.push(
            getHeader(post.object.actor, post.object.url),
            '<div class="m-l62">'
        );
    }
    cont.push(
        '<div>',
        post.object.content,
        '</div>',
        post.verb == "share" ? '</div></div>' : '</div>'
    );

    return cont.join("");
}

function getStatistic(post) {
    if (!post || !post.object || !post.object.replies)
        return "";
    return ["<div class='stat'></script><strong>comments</strong>: ", post.object.replies.totalItems, "&emsp;",
            "<strong>+", post.object.plusoners.totalItems, "</strong> ",
            "<strong><span style='font-family: courier; font-size: 14px; font-variant: small-caps'>↷</span>", post.object.resharers.totalItems, "</strong></div>"].join("");
}

function getAttachments(post) {
    if (!post || !post.object.attachments || !post.object.attachments.length)
        return "";
    var albUrl = post.object.attachments.length < 2 ? post.url : false,
        albName = post.object.attachments.length + ' photos',
        album = post.object.attachments[0],
        type = album.objectType;

    switch (type) {
        case "photo-album":
            type = "photo";
        case "video":
        case "article":
        case "album":
            albName = album.displayName;
            albUrl = album.url;
            break;
        case "photo":
            albUrl = albUrl || album.url.replace(/\/\d+$/, "");
            break;
        default:
            return "";
    }

    var i = 0,
        index;

    function parseItem(d) {
        var cont = [],
            isGif;
        switch (d.objectType) {
            case "photo-album":
            case "photo":
            case "article":
                if (!d.image)
                    break;
                cont.push(
                    '<a target="_blank" href="',
                        type == "article" ? d.fullImage.url : d.url,
                    '">',
                    '<img src="',
                        type == "article" ? d.fullImage.url : (isGif = /\.gif$/.test(d.content)) ? d.fullImage.url
                            : d.image.url.indexOf('gadget=') > -1 ? d.image.url.replace(/(gadget=a&).*/,
                        "$1resize_h=200&url=") + encodeURI(d.fullImage.url) : d.image.url,
                    '" height="200px"',
                    '">',
                    '</a>'
                );
                break;
            case "video":
                cont.push('<a target="_blank" href="',
                    d.url,
                    '">',
                    '<img src="',
                    d.image.url.replace(/resize_h=100/, 'resize_h=279&resize_w=497'),
                    '" width="497px" height="279px">',
                    '</a>');
                break;
            /*case "article":
                break;*/
            default :
                switch(type) {
                    case "album":
                        cont.push(
                            '<a target="_blank" href="',
                                d.url,
                            '">',
                            '<img src="',
                                d.image.url,
                            '" height="165px"',
                            '">',
                            '</a>'
                        );
                        break;
                }
                break;
        }
        return cont.join("");
    }

    function getTitle(type) {
        if (!type)
            return "";
        var res = [];
        res.push('<div class="tip-', type, type == "photo" && post.object.attachments.length > 1 ? ' max-h80"' : '"', '><div>',
            '<div><div>',
            type == "article" ? [
                '<img ',
                'src="',
                'https:\/\/s2.googleusercontent.com\/s2\/favicons?domain=',
                album.url.replace(/https?:\/\/(.*?)\/.*/, "$1"),
                '">'].join("") : "",
            '<a target="_blank" ',
            type == "article" ? "" : 'style="color:#ffffff!important;',
            type == 'video' ? 'font-weight: bold;' : "",
            '" href="',
            albUrl,
            '">',
            albName,
            '</a>',
            '</div></div>');
        switch (type) {
            case "photo":
                if (post.object.attachments.length > 1)
                    res.push(
                        '<div class="gl">',
                        post.object.attachments.filter(function (d, i) {
                            return i != index;
                        }).map(function (d) {
                                var cont = [];
                                switch (d.objectType) {
                                    case "photo-album":
                                    case "photo":
                                        if (!d.image)
                                            break;
                                        cont.push(
                                            '<a target="_blank" href="',
                                            d.url,
                                            '">',
                                            '<img src="',
                                            d.image.url,
                                            '" class="data',
                                            '">',
                                            '</a>'
                                        );
                                        break;
                                }
                                return cont.join("");
                            }).join(""),
                        '</div>',
                        '<div><div>',
                        '<a target="_blank" href="',
                        post.url,
                        '">Look post</a>',
                        '</div></div>');
                break;
            case "article":
            case "video":
                res.push('<div><div>',
                    album.content ? album.content.substring(0, 100) + '...' : "",
                    '</div></div>');
                break;
        }
        res.push('</div></div>');
        return res.join("");
    }

    return '<div class="attachments">' +
        (type == 'article' ? '<div class="article"><div class="top-shdwn"></div>' : '<div class="top-shdwn"></div>') +
        (type != 'album'
               ? post.object.attachments.filter(function (d, id) {
                    return (["photo", "video", "article"].indexOf(d.objectType) > -1
                        || (d.objectType == "photo-album" && d.image))
                        && i++ < 1 && ((index = id) || true);
                 }).map(parseItem).join("")
               : album.thumbnails.map(parseItem).join("")) +
        getTitle(type) +
        (type == "article" ? "</div>" : '<div class="bottom-shdwn"></div>') +
        '</div>';
}

/**
 * end tooltip content generators
 */