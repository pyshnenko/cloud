const dir = process.cwd();
const fs = require('fs');
const path = require('path');

function searchFilesRecurs(pathF, text, recursePath) {
    let arr = [];
    fs.readdirSync(
        path.join(dir, 'data', pathF), 
        { withFileTypes: true })
        .filter((d) => !d.isDirectory())
        .map((d)=> {if ((d.name.toLocaleUpperCase().includes(text.toLocaleUpperCase()))&&(d.name!=='%%%ssystemData.json')) arr.push(path.join(recursePath||'', d.name))})
    const dirs = fs.readdirSync(
        path.join(dir, 'data', pathF), 
        { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d)=>d.name)
    for (let i=0; i<dirs.length; i++)
        arr = arr.concat(searchFilesRecurs(path.join(pathF, dirs[i]), text, path.join(recursePath||'', dirs[i])))
    for (let i = 0; i<arr.length; i++)
        arr = arr.map(item=>item.replaceAll('\\', '/'))
    return arr
}

function searchFolderRecurs(pathF, text, recursePath) {
    let arr = [];
    const dirs = fs.readdirSync(
        path.join(dir, 'data', pathF), 
        { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d)=>{
            if ((d.name.toLocaleUpperCase().includes(text.toLocaleUpperCase()))&&(d.name!=='%%%ssystemData.json')) 
                arr.push(path.join(recursePath||'', d.name))
            return d.name
        })
    for (let i=0; i<dirs.length; i++)
        arr = arr.concat(searchFolderRecurs(path.join(pathF, dirs[i]), text, path.join(recursePath||'', dirs[i])))
    for (let i = 0; i<arr.length; i++)
        arr = arr.map(item=>item.replaceAll('\\', '/'))
    return arr
}

console.log({files: searchFilesRecurs('spamigor', 'УмП'), folders: searchFolderRecurs('spamigor', 'УмП')})