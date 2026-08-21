import {z,string} from "zod"

export const userTokenSchema=z.object({
    id:z.string()
})