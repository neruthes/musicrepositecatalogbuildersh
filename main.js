#!/bin/node

const fs = require('fs');
const NodeID3 = require('node-id3');
const exec = require('child_process').execSync;


// Dirty hacks
const { promisify } = require('util');
const NodeID3ReadAsync = promifify(NodeID3.read);



const extWhiteList = ['aif', 'aiff', 'wav', 'mp3', 'mp4', 'aac', 'm4a', 'flac', 'ape'];
const filesList = exec('find').toString().split('\n').filter(function (filePath) {
    let validity = false;
    extWhiteList.map(ext => {
        if (filePath.endsWith(ext)) {
            validity = true;
        };
    })
    return validity;
});

// console.log(filesList);
console.log(`[INFO] Found ${filesList.length} audio files. Starting workflow.`);

// if (fs.existsSync('.MusicCatalog.json')) {
//     console.log(`[INFO] Found existing catalog file. Working in amendment mode. If you want to start anew, just delete the '.MusicCatalog.json' file.`);
//     currentCatalog = JSON.parse(fs.readFileSync('.MusicCatalog.json').toString().trim());
// };

let currentCatalog = {
    "tracks": []
};

const createTrackInfo = function (musicFilePath, counter) {
    const trackObj = {};
    const theFileStat = fs.statSync(musicFilePath);
    console.log(`Track ${counter} '${musicFilePath}'`);
    const tags = await NodeID3ReadAsync.read(musicFilePath);
    trackObj.path = musicFilePath.slice(2); // In order to remove the leading './' prefix
    trackObj.size_KB = Math.floor(theFileStat.size / 1024);
    [
        'title', 'artist', 'album', 'length', 'length', 'trackNumber', 'partOfSet'
    ].map(function (field) {
        trackObj[field] = tags[field];
    });
    return trackObj;
};

// Main job loop
filesList.forEach(function (musicFilePath, counter) {
    currentCatalog.tracks.push(createTrackInfo(musicFilePath, counter));
});

console.log(`[INFO] Done.`);

fs.writeFileSync('.MusicCatalog.json', JSON.stringify(currentCatalog, '\t', 4));
