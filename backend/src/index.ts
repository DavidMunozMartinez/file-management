import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { PORT, NEW_FOLDER } from './constants';

const app = express();
const upload = multer();
const ROOT_PATH = process.env.ROOT_PATH || './file-storage';
if (!process.env.ROOT_PATH && !fs.readdirSync('./file-storage')) {
    fs.mkdirSync('./file-storage');
}

app.use(upload.single('upload'));
app.use(express.static(__dirname + '/static'));
app.use(express.json());

app.post('/directory', (request, response) => {
    let pathArray = getPathFromBody(request.body);
    let directoryPath = path.join.apply(null, pathArray);
    console.log(pathArray);

    getPathContent(directoryPath).then((files) => {
        response.statusCode = 200;
        response.send(files);
    }).catch((err) => {
        response.statusCode = 400;
        response.send(err)
    });
});

app.post('/new-directory', (request, response) => {
    let count = 0;
    let pathArray = getPathFromBody(request.body);
    console.log(pathArray);
    let folderName = NEW_FOLDER;
    let directoryPath = path.join.apply(null, pathArray.concat([folderName]));
    while (fs.existsSync(directoryPath)) {
        count++;
        folderName = `${NEW_FOLDER}-(${count})`;
        directoryPath = path.join.apply(null, pathArray.concat([folderName]))
    }

    fs.mkdirSync(directoryPath);
    response.statusCode = 200;
    response.send({
        name: folderName
    });
});

app.post('/has-content', (request, response) => {
    let pathArray = getPathFromBody(request.body);
    let directory = path.join.apply(null, pathArray);

    fs.readdir(directory, (err, files) => {
        if (err) {
            response.statusCode = 500;
            response.send(err);
        }
        else {
            response.statusCode = 200;
            response.send(files.length > 0);
        }
    });
});

app.post('/rename-directory', (request, response) => {
    let pathArray = getPathFromBody(request.body);
    let oldDirectory = path.join.apply(null, pathArray.concat(request.body.old));
    let newDirectory = path.join.apply(null, pathArray.concat(request.body.new));

    fs.rename(oldDirectory, newDirectory, (err) => {
        if (!err) {
            response.statusCode = 200;
            response.send(true);
        }
    });
});

app.post('/force-delete-directory', (request, response) => {
    let pathArray = getPathFromBody(request.body);
    let directoryPath = path.join.apply(null, pathArray);
    fs.rmdirSync(directoryPath);
    response.statusCode = 200;
    response.send(true);
});

app.post('/delete-file', (request, response) => {
    let pathArray = getPathFromBody(request.body);
    let directoryPath = path.join.apply(null, pathArray);

    fs.unlinkSync(directoryPath);

    response.statusCode = 200;
    response.send(true);
});

app.post('/upload', (request, response) => {
    response.statusCode = 200;
    if (request.file) {
        let buffer = request.file.buffer;
        let pathArray = [ROOT_PATH].concat(JSON.parse(request.body.path));
        let directory = path.join.apply(null, pathArray);
        console.log(directory);
        console.log(buffer);
        fs.createWriteStream(directory).write(buffer)
    }
    response.send(true);
});

app.get('/download', (request, response) => {
    let pathArray = getPathFromBody(request.query);
    let directory = path.join.apply(null, pathArray);

    response.contentType(path.basename(directory));
    response.download(directory, (err) => {
        if (err) {
            console.log(err);
        }
    });
});

app.listen(PORT, () => {
    console.log('Listening on port: ', PORT);
});

function getPathContent(path: string) {
    let filesData: Array<any> = [];
    return new Promise((resolve, reject) => {
        console.log(path);
        fs.readdir(path, (err, files) => {
            if (err || !files) {
                reject(err);
            }

            files.forEach((file) => {
                try {
                    let filepath = `${path}/${file}`;
                    let pathData = getPathData(file, filepath);
                    filesData.push(pathData);
                } catch (e) {

                }
            });

            resolve(filesData);
        });
    });
}

function getPathData(name: string, path: string) {
    let stats = fs.statSync(path);
    let data = {
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        name: name,
        size: stats.size
    }
    return data;
}

function getPathFromBody(body: any): Array<string> {
    let pathArray = [ROOT_PATH];

    if (body && body.path.length && body.path.length > 0) {
        pathArray = pathArray.concat(body.path);
    }

    return pathArray;
}