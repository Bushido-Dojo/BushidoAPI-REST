const bcrypt = require("bcrypt");

const encryptPWD = (password) => {
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);

    return hash;
}

const comparePWD = (password, hash) => {
    try {
        return bcrypt.compareSync(password, hash);
    } catch {}

    return false;
}



module.exports = {
    encryptPWD,
    comparePWD
};