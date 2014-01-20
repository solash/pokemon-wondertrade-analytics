var RedditUser = function(params) {
    var redditUserModel = {
        userId: params.userId,
        redditUserName: params.redditUserName
    };
    return redditUserModel;
};

module.exports = RedditUser;