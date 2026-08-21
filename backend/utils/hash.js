import { randomBytes, createHmac } from "node:crypto"

export function hashPasswordWithSalt(password,saltuser=undefined){
    
    const salt = saltuser ?? randomBytes(256).toString("hex");
    const hashpassword = createHmac("sha256", salt).update(password).digest('hex');

    return {salt,password:hashpassword};

}