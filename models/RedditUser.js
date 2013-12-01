var _ = require('underscore');

var RedditUser = function(params) {
    var redditUserModel = {
        userId: params.userId,
        redditUserName: params.redditUserName
    };
    return redditUserModel;
};

exports.model = RedditUser;