async function checkTags(uncheckedTags, guildTags) {
    uncheckedTags = uncheckedTags.map(tag => {
        return typeof(tag) == 'string' ? tag.toLowerCase() : tag
    })
    
    let checkedTagsObject = {
        tagsExist: true,
        checkedTags: []
    };
    
    for (let uncheckedTag of uncheckedTags) {
        if (guildTags.includes(uncheckedTag)) {
            checkedTagsObject.checkedTags.push(uncheckedTag);
        } else if (uncheckedTag !== null) {
            checkedTagsObject.tagsExist = false
        }
    }

    return checkedTagsObject;
}

module.exports = {
    checkTags,
};