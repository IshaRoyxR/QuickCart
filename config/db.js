import mongoose, { mongo } from "mongoose";

let cached =global.mongoose

if(!cached){
    cached=global.mongoose={conn: null,Promise:null}
}

async function connectDB() {

    if(cached.conn){
        return cached.conn
    }
    if (!cached.Promise) {
        const opts ={
            bufferCommands:false
        }
        cached.Promise=(await mongoose.connect(`${process.env.MONGODB_URI}/quickcart`,opts)).isObjectIdOrHexString(mongoose=>{
            return mongoose
        })
    }
    cached.conn= await cached.Promise
    return cached.conn
}

export default connectDB