require('dotenv').config();
const MongoClient = require("mongodb").MongoClient;

let mongoClient: any;
let db: any;
let collection: any;
let usersCollection: any;
const url = process.env.MONGO_URL;
const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASS;
const authMechanism = "DEFAULT";
const uri =`mongodb://${username}:${password}@${url}/?authMechanism=${authMechanism}`;

class mongoFunc {
    constructor() {
        mongoClient = new MongoClient(uri);
        db = mongoClient.db("gf");
        collection = db.collection("gfUsers");
        usersCollection = db.collection("cloudUsers");
    }

    async find(obj: any) {
        let extBuf:any[] = [];
        try {
            await mongoClient.connect();
            if (obj) {
                extBuf = await collection.find(obj).toArray();
            }
            else {
                extBuf = await collection.find().toArray();
            }
        }catch(err) {
            extBuf=[];
        } finally {
            try {
                await mongoClient.close();
            }
            catch(err)
            {
                console.log(err)
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