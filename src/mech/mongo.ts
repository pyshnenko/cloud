require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;
const Redis = require("ioredis");

const redis = new Redis({
    port: Number(process.env.REDIS_PORT),
    host: String(process.env.REDIS_HOST),
    password: String(process.env.REDIS_PASS),
    db: 1
})

let mongoClient: any;
let db: any;
let collection: any;
let usersCollection: any;
const url = process.env.MONGO_URL;
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASS;
const authMechanism = "DEFAULT";
const uri =`mongodb://${username}:${password}@${url}/?authMechanism=${authMechanism}`;
const cashTokenList: {[key: string]: {login: string, timer: ReturnType<typeof setTimeout>}} = {}

class mongoFunc {
    constructor() {
        mongoClient = new MongoClient(uri);
        db = mongoClient.db("cloud");
        collection = db.collection("gfUsers");
        usersCollection = db.collection("cloudUsers");
    }

    async find(obj: any, onlyTok: boolean = false) {
        let extBuf:any[] = [];
        let mongoconnect: boolean = false;
        console.log(cashTokenList);
        try {
            console.log(obj);
            if (onlyTok && obj?.token) {
                if (cashTokenList[obj.token]) extBuf.push({login: cashTokenList[obj.token].login});
                else if (obj?.token) {
                    const login = await redis.get(obj.token);
                    if (login !== null) {
                        extBuf.push({login})
                        cashTokenList[obj.token] = {
                            login,
                            timer: setTimeout(()=>delete(cashTokenList[obj.token]), 1000*60*10)
                        }
                    }
                    else mongoconnect = true;
                }                
                else mongoconnect = true;
            }
            if (mongoconnect || !onlyTok) {
                console.log('mongoconnect')
                await mongoClient.connect();
                if (obj) {
                    extBuf = await collection.find(obj).toArray();
                    if (extBuf.length&&extBuf[0]?.login) {
                        redis.set(obj.token, extBuf[0].login, 'EX', 600)
                        cashTokenList[obj.token] = {
                            login: extBuf[0].login,
                            timer: setTimeout(()=>delete(cashTokenList[obj.token]), 1000*60*10)
                        }
                    }
                }
                else {
                    extBuf = await collection.find().toArray();
                }
            }
        }catch(err) {
            extBuf=[];
        } finally {
            if (mongoconnect) {
                try {
                    await mongoClient.close();
                }
                catch(err)
                {
                    console.log(err)
                }
            }
            return extBuf;
        }
    }

    async updateOne(oldObj:any , obj: any) {
        let userLogin;
        try {
            await mongoClient.connect();
            await collection.updateOne(oldObj, {$set: obj});
        }catch(err) {
            console.log(err)
        } finally {
            await mongoClient.close();
            return userLogin
        }
    }

    async incertOne(obj: any) {
        try {
            await mongoClient.connect();
            await collection.insertOne(obj);
        }catch(err) {
            console.log(err)
        } finally {
            await mongoClient.close();
        }
    }

    async id() {
        try {
            await mongoClient.connect();
            const count: number = await collection.countDocuments();
            await mongoClient.close();
            console.log('Записей: ' + count)
            return count
        }
        catch(e) {
            console.log(e);
            await mongoClient.close();
        }
    }
}

module.exports = mongoFunc;
