import bcrypt from 'bcrypt'


//to generate a hashed password
export const hashPassword = (password) => {
    //to hash the password!
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (err, salt) => {
            if (err) {
                reject(err)
            }
            //if no issues then continue with hashing the password 
            bcrypt.hash(password, salt, (err, hash) => {
                if(err) {
                    reject(err);
                }
                resolve(hash); 
            })
        })
    })
} 


//to compare the password safely
export const comparePassword = (password, hashed) => {
    return bcrypt.compare(password, hashed); 
}