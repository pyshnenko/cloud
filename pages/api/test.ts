export default async function handler(req: any, res: any) {

    console.log(req.query);
    res.status(200).json({res: new Date().toLocaleString()});
}