$(function() {
    var pageok = [];

    function getPage(url) {
        var pars = url.split('?')[1];
        var par = _.find(pars.split('&'), function(e) {
            return e.indexOf('pg=') >= 0;
        });
        return par.split('=')[1];
    }

    function writeFile(page, blob) {
        if (pageok.indexOf(page) < 0) {
            saveAs(blob, page + ".png", "image/png");
            pageok.push(page);
        }
        console.log(pageok);
    }

    function downloadOne(url) {
        if ($.isEmptyObject(url)) {
            return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
            if (this.status === 200) {
                var filename = "";
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                }
                var type = xhr.getResponseHeader('Content-Type');

                var blob = new Blob([this.response], {
                    type: type
                });
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                    window.navigator.msSaveBlob(blob, filename);
                } else {
                    writeFile(getPage(url), blob);
                }
            }
        };
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send();
    }

    function download() {
        $(this).find('.pageImageDisplay div:nth-child(3) img').each(function(i, e) {
            downloadOne($(e).attr('src'));
        });
    }
    $('div.overflow-scrolling').scrollTop(1);
    $('div.overflow-scrolling').on('scroll', download);
});
