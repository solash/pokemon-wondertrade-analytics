var _ = require('underscore');

var RedditPost = function(item) {
    var thumbnail = '';
    if(item &&
        item['media:thumbnail'] &&
        item['media:thumbnail'][0] &&
        item['media:thumbnail'][0]['$'] &&
        item['media:thumbnail'][0]['$']['url']) {
        thumbnail = item['media:thumbnail'][0]['$']['url'];
    }
    var redditPostModel = {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        thumbnail: thumbnail
    };
    return redditPostModel;
};

exports.model = RedditPost;