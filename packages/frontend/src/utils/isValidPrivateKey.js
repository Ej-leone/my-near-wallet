export default (privateKey) => {
    if (privateKey.length !== 64) {
        throw new Error('Provided private must be at least 64 char');
    }

    return true;
};
