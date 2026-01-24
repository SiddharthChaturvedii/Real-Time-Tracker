function isValidUsername(username) {
    return typeof username === 'string' && username.trim().length > 0 && username.length <= 20;
}

function isValidPartyCode(code) {
    return typeof code === 'string' && code.length === 6;
}

function isValidLocation(lat, lng) {
    return (
        typeof lat === 'number' &&
        typeof lng === 'number' &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180
    );
}

module.exports = {
    isValidUsername,
    isValidPartyCode,
    isValidLocation
};
