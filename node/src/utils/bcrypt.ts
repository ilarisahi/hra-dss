import * as bcrypt from "bcryptjs";

const main = async () => {
    const password = process.argv[2];
    return bcrypt.hash(password, 10);
};

main().then(password => {
    console.log(password);
});
