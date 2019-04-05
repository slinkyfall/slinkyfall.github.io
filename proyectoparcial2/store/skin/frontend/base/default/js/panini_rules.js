function showAlbumAdvice(elmId, failed, general) {
    'use strict';
    general = general || (general = false);
    var containerOk = jQuery(elmId).parent().parent().siblings('div.album-code.ok');
    var containerKo = jQuery(elmId).parent().parent().siblings('div.album-code.ko');
    var containerKoGeneral = jQuery(elmId).parent().parent().siblings('div.album-code.ko-general');
    containerKoGeneral.html("");
    if (failed) {
        containerOk.hide();
        if(!general){
           containerKo.show();
           containerKoGeneral.hide();
        }else{
           containerKo.hide();
           containerKoGeneral.html(general);   
           containerKoGeneral.show(); 
        }
    } else {
        containerKo.hide();    
        containerKoGeneral.hide();
        containerOk.show();
    }
}

var albumChecker = (function ($) {
    'use strict';
    var that = {};

    that.el = null;

    that.checkAlbumFallback = function(){

        var url = _checkingUrl;
        if(!url){
            url = "./pnn_rules/validate/ajax";
        }

        
        jQuery('.list-group-item .input-box .loadingBlock').toggleClass('hidden');
        
        // ajax call
        that.el = jQuery('input.product-custom-option.validate-album');
        jQuery.ajax(url,{
            data: {
                code:    jQuery(".validate-album").val(),
                product: jQuery("input[name='product']").val()
            },
            success: function(data){
                jQuery('.list-group-item .input-box .loadingBlock').toggleClass('hidden');
                if(data.validation){
                    showAlbumAdvice($(that.el), false);
                }else{
                    if(data.generalError){
                        showAlbumAdvice($(that.el), true, data.message);
                    }else{
                        showAlbumAdvice($(that.el), true);
                    }
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                jQuery('.list-group-item .input-box .loadingBlock').toggleClass('hidden');
                showAlbumAdvice($(that.el), true);
            }
        })


    }



    that.checkAlbum = function () {
        that.el = jQuery('input.product-custom-option.validate-album');
        var albumValue = $(that.el).val() ? $(that.el).val(): '';
        if(!albumValue){return false;}
        if(typeof(_albumCodes) != 'undefined' &&  _albumCodes.length > 0 && albumValue.length > 0) {
            var allAlbums = _albumCodes.split(",");
            var isOk = false;
            $.each(allAlbums, function (index, value) {
                if (value.toLowerCase() == albumValue.toLowerCase()) {
                    isOk = true;
                    return;
                }
            });
            if (isOk) {
                showAlbumAdvice($(that.el), false);
            } else {
                that.checkAlbumFallback();
            }
        }else{
            that.checkAlbumFallback();
            //$(that.el).parent().parent().siblings('div.album-code').hide();
        }
    };
    return that;
}(jQuery));


jQuery(function () {
    'use strict';
    
    if(typeof _doCheckAlbumCodes != 'undefined' && _doCheckAlbumCodes != 1){
        return;
    }

    var obj = jQuery('input.product-custom-option.validate-album');
    if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
        obj.each(function(){
            jQuery(this).keyup(albumChecker.checkAlbum);
        });
    }else{
        obj.change(albumChecker.checkAlbum);
    }

    obj.trigger('change');
});
