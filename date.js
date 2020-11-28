
exports.getDate = function() {
    
    const date = new Date();

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    const today = date.toLocaleDateString("en-US", options);
    return today;

}