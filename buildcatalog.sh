#!/bin/bash

TMPLISTFN=".tmpcataloglist"
printf "" > $TMPLISTFN
printf "[BeginArrayMark114514" > .MusicCatalog.json

function _get() {
    # $1=fieldName
    if [[ "$(which kid3-cli)" != '' ]]; then
        kid3-cli "$AUDIO_PATH" -c "get $1 2"         2>/dev/null
    fi
}

### Build a list of files
EXT_LIST="flac m4a mp4 mp3 aiff"
for EXT_NAME in $EXT_LIST; do
    find -name "*.$EXT_NAME" >> $TMPLISTFN
done
sort $TMPLISTFN > $TMPLISTFN.new
mv $TMPLISTFN.new $TMPLISTFN

### Build the '.MusicCatalog.json' file
COUNTER=0
IFS=$'\n'
for AUDIO_PATH in $(cat $TMPLISTFN); do
    IFS=" "
    echo "[INFO] Track $COUNTER '$AUDIO_PATH'"
    PREJSON=",{
    %%path%%: %%${AUDIO_PATH:2}%%,
    %%size_KB%%: %%$(du "$AUDIO_PATH" | cut -f1)%%,
    %%album%%: %%$(_get album)%%,
    %%title%%: %%$(_get title)%%,
    %%artist%%: %%$(_get artist)%%,
    %%disc%%: %%$(_get disc)%%,
    %%track%%: %%$(_get track)%%
}"
    sed 's/%%/"/g' <<< "$PREJSON" >> .MusicCatalog.json
    # sed -i 's|\[BeginArrayMark114514,|\[|' .MusicCatalog.json
    COUNTER="$((COUNTER+1))"
done
IFS=" "
printf "]" >> .MusicCatalog.json
sed -i 's|\[BeginArrayMark114514,|\[|' .MusicCatalog.json

rm $TMPLISTFN
