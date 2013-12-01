var _ = require('underscore');

var RedditPost = function(item) {
    var redditPostModel = {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        thumbnail: item['media:thumbnail'][0]['$']['url']
    };
    return redditPostModel;
};

exports.model = RedditPost;