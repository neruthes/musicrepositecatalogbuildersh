#!/bin/node

const util = require('util');
const fs = require('fs');
const exec = require('child_process').execSync;

const mm = require('music-metadata');




const extWhiteList = ['aif', 'aiff', 'wav', 'mp3', 'mp4', 'aac', 'm4a', 'flac', 'ape'];
const filesList = exec('find').toString().split('\n').filter(function (filePath) {
    let validity = false;
    extWhiteList.map(ext => {
        if (filePath.endsWith(ext)) {
            validity = true;
        }
    });
    return validity;
});

console.log(`[INFO] Found ${filesList.length} audio files. Starting workflow.`);

let currentCatalog = {
    "tracks": []
};

const createTrackInfo = async function (musicFilePath, counter) {
    const trackObj = {};
    const theFileStat = fs.statSync(musicFilePath);
    console.log(`Track ${counter} '${musicFilePath}'`);
    const tags = await mm.parseFile(musicFilePath);

    trackObj.path = musicFilePath.slice(2);         // Remove the leading './' prefix
    trackObj.size_KB = Math.floor(theFileStat.size / 1024);
    [
        'title', 'artist', 'album'
    ].map(function (field) {
        trackObj[field] = tags.common[field];
    });
    trackObj.track = tags.common.track.no;
    trackObj.disk = tags.common.disk.no;
    return trackObj;
};

// Main job loop
filesList.forEach(function (musicFilePath, counter) {
    currentCatalog.tracks.push(createTrackInfo(musicFilePath, counter));
});

console.log(`[INFO] Done.`);

fs.writeFileSync('.MusicCatalog.json', JSON.stringify(currentCatalog, '\t', 4));

console.log(currentCatalog);
