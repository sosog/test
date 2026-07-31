function getCrc(zipData,flags)
{
    let r = new Object();

    if (zipData != undefined && flags != undefined && flags.isInnerZip == true){
        let crcCode = 0;
        let rZip2 = new JSZip(zipData, {base64:flags.base64?flags.base64:false});
        const files = Object.keys(rZip2.files).sort();
        for (let x = 0; x < files.length; x++){
            if (rZip2.file(files[x]) != null && !rZip2.file(files[x]).dir){
                crcCode = Math.round((rZip2.file(files[x])._data.crc32 + crcCode));
            }
        }
        crcCode = Math.round(crcCode / files.length);
        r.crc32 = crcCode;
        return r;
    }

    if (zipData != undefined && flags != undefined && flags.isInnerType == true){
        zipData = vkbeautify.xml(zipData);
    }
    r.crc32 = normalZip.crc32(zipData,32);
    return r;
}
function getCrcWithData(zipData,flags)
{
    let r = new Object();
    if (zipData != undefined && flags != undefined && flags.isInnerZip == true){
        let crcCode = 0;
        let rZip2 = new JSZip(zipData, {base64:false});
        const files = Object.keys(rZip2.files).sort();
        for (let x = 0; x < files.length; x++){
            if (rZip2.file(files[x]) != null && !rZip2.file(files[x]).dir) {
                crcCode = Math.round((rZip2.file(files[x])._data.crc32 + crcCode));
            }
        }
        crcCode = Math.round(crcCode / files.length);
        r.crc32 = crcCode;
        r.data = zipData;
        return r;
    }
    if (zipData != undefined && flags != undefined && flags.isInnerType == true){
        zipData = vkbeautify.xml(zipData);
    }
    r.crc32 = normalZip.crc32(zipData,32);
    if (flags != undefined && flags.compress == true){
        r.data = pako.deflate(zipData, { to: 'string' });
    }else{
        r.data = zipData;
    }
    return r;
}

// analyse and return bundle's crc32 sum (see the specs for detail)
function composeBundleCrc(mapCrc32){
    ////console.log('componentStack '+JSON.stringify(mapCrc32));
    let crcCode = 0;
    // map name => crc32
    const keys = Object.keys(mapCrc32).sort();
    if (keys.length > 0) crcCode = mapCrc32[keys[0]];
    if (keys.length < 26) {
        for (let i = 1; i < keys.length; i++) {
            crcCode = Math.round((mapCrc32[keys[i]] + crcCode) / 2);
        }
    } else {
        for (let i = 1; i < keys.length; i++) {
            crcCode = Math.round((mapCrc32[keys[i]] + crcCode));
        }
        crcCode = Math.round(crcCode / keys.length);
    }
    return crcCode;
}

function isInnerZipContains(rZip, fileName){
    const fileNameResource = fileName?fileName:'';
    let files = Object.keys(rZip.files).filter((name) => name.endsWith(fileNameResource+'.resource-meta.xml'));

    if (files.length==1) {// process content if and only if it contains  meta.xml file
        const meta = rZip.file(files[0]).asBinary();
        const x2js = new X2JS({useDoubleQuotes: true, stripWhitespaces: false, escapeMode: true});
        const metaObj = x2js.xml_str2json(meta);
        const innerZip = metaObj.StaticResource.contentType == 'application/zip' || metaObj.StaticResource.contentType == 'application/x-zip-compressed';
        return innerZip;
    } else {
        return false;
    }
}