export default function download_file(fileURL: string, fileName: string = 'spamigor-archive.zip') {
    var save = document.createElement('a');
    save.href = fileURL;
    save.target = '_blank';
    var filename = fileURL.substring(fileURL.lastIndexOf('/')+1);
    save.download = fileName || filename;
    if ( navigator.userAgent.toLowerCase().match(/(ipad|iphone|safari)/) && navigator.userAgent.search("Chrome") < 0) {
        document.location = save.href; 
// window event not working here
    }else{
        var evt = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': false
        });
        save.dispatchEvent(evt);
        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    }	
}