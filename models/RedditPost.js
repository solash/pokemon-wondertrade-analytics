var RedditPost = function(item) {
    var thumbnail = '',
        title = (item.title).toString().substring(0, 80);
    if(item &&
        item['media:thumbnail'] &&
        item['media:thumbnail'][0] &&
        item['media:thumbnail'][0]['$'] &&
        item['media:thumbnail'][0]['$']['url']) {
        thumbnail = item['media:thumbnail'][0]['$']['url'];
    }
    if(title.length === 80) {
        title += " ...";
    }
    var redditPostModel = {
        title: title,
        link: item.link,
        pubDate: item.pubDate,
        thumbnail: thumbnail
    };
    return redditPostModel;
};

module.exports = RedditPost;