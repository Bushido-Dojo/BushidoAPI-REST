const bcrypt = require("bcrypt");

export const encryptPWD = (password: string) => {
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);

    return hash;
}

export const comparePWD = (password: string, hash: string) => {
    try {
        return bcrypt.compareSync(password, hash);
    } catch {}

    return false;
}


