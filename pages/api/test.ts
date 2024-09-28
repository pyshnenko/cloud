export default async function handler(req: any, res: any) {

    console.log(req);
    res.status(200).json({res: 'ok'});
}