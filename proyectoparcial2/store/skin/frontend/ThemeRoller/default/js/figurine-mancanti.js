/*global $, jQuery, Validation, setTimeout, productAddToCartForm*/

var funcIncrement = (function ($) {
    'use strict';
    var item = {};
    item.incrementStickers = function () {
        var maxSalable = $('#maxSalableField').text(),
            count = $('input[checkt="check"]:checked:enabled').size();

        if (count <= maxSalable) {
            $('#advice-too-check').hide();
            $('#counterFig').text(count);
        } else {
            $(this).attr('checked', false);
            $('#advice-too-check').show();
        }
    };
    return item;
}(jQuery));


function validateCustom(elmId, failed, code) {
    'use strict';
    var container = $(elmId).up('li');
    if (failed) {
        container.className = 'validation-failed ' + code;
    } else {
        if (container.hasClassName('validation-failed') && container.hasClassName(code)) {
            container.removeClassName('validation-failed');
            container.removeClassName(code);
        }
    }
}

function parentHasValidationFailed(elmId, code) {
    'use strict';
    var container = $(elmId).up('li');
    return container.hasClassName('validation-failed') && container.hasClassName(code);
}

jQuery(function ($) {
    'use strict';
    $('input:checkbox:input[checkt="check"]').change(funcIncrement.incrementStickers);
    $('#advice-too-check').hide();
    $('input:checkbox:input[checkt="check"]').trigger('change');
});


var func = (function ($) {
    'use strict';
    var that = {};
    that.checkDuplicate = function () {
        var otherCodes = [],
            myId = $(this).attr('id');
        $('input:text:input[checkt="check"]').each(
            function () {
                if ($(this).val() !== '' && myId !== $(this).attr('id')) {
                    otherCodes.push($(this).val().toUpperCase());
                }
            }
        );
        validateCustom($(this).attr('id'), (otherCodes.indexOf($(this).val().toUpperCase()) >= 0), 'dup');
    };


    that.checkValid = function () {
        var codesArray = $.trim($('#availableStickersField').text()).toUpperCase().split(','),
            // case insensitive
            objVal = $.trim($(this).val().toUpperCase()),
            // case sensitive (removed the toUpperCase function)
            // objVal = $.trim($(this).val()),
            valid = true;

        // ISSUE #1055: controllo case insensitive
        if (objVal) {
            // Split array
            valid = $.inArray(objVal, codesArray) >= 0;
        }
        validateCustom($(this).attr('id'), !valid, 'inv');

        // Aggiornamento testo validazione con elenco figurine non validate
        Validation.add('validate-invalid-stickers',
            '<p class="alert alert-danger">' + $('#messageToStickersInvalid').text() + that.getInvalidCodes() + '</p>',
            func.checkInvalidWithFocus);
   };

    // Torna tutti gli id delle figurine non validate.
    that.getInvalidCodes = function () {
        var rv = "";
        $('li.validation-failed.inv input').each(function () {
            if (rv) {
                rv = rv + ", ";
            }
            rv = rv + $(this).val();
        });
        return rv;
    };

    that.checkDuplicated = that.checkDuplicate;
    that.checkValidity =  that.checkValid;

    that.checkDuplicatedWithFocus = function () {
        var error = false;
        $('input:text:input[checkt="check"]').each(
            function () {
                if ($(this).val() !== '') {
                    if (parentHasValidationFailed($(this).attr('id'), 'dup')) {
                        setTimeout($(this).focus, 500);
                        error = true;
                        return false;
                    }
                }
            }
        );
        return !error;
    };

    that.checkInvalidWithFocus = function () {
        var error = false;
        $('input:text:input[checkt="check"]').each(
            function () {
                if ($(this).val() !== '') {
                    if (parentHasValidationFailed($(this).attr('id'), 'inv')) {
                        setTimeout($(this).focus, 500);
                        error = true;
                        return false;
                    }
                }
            }
        );
        return !error;
    };

    that.checkAtLeastASticker = function () {
        var error = true;
        $('input:text:input[checkt="check"]').each(
            function () {
                if ($(this).val() !== '') {
                    error = false;
                    return false;
                }
            }
        );
        return !error;
    };
    return that;
}(jQuery));


function addPrefixToAlbumCode() {
    'use strict';
    var optId = jQuery('#codeAblumFixedValue').attr('idOpt'),
        valid = new Validation(optId),
        result = valid.validate(),
        att,
        prefix,
        clazz,
        oldVal,
        newValue;

    if (result && jQuery('#codeAblumFixedValue')) {
        att = jQuery('#codeAblumFixedValue').attr('tp');
        prefix = jQuery('#codeAblumFixedValue').text().trim();
        clazz = jQuery('#' + optId).attr('class');

        if (clazz.indexOf('validation-failed') === -1) {
            oldVal = '';
            if (jQuery('#' + optId)) {
                oldVal = jQuery('#' + optId).val();
            }
            newValue = '';
            if (prefix !== null && prefix !== '') {
                if (att === 'pre') {
                    newValue = prefix + '_' + oldVal;
                } else if (att === 'post') {
                    newValue = oldVal + '_' + prefix;
                }
            }
            if (jQuery('#' + optId)) {
                jQuery('#' + optId).val(newValue);
                jQuery('#codeAblumFixedValue').hide();
            }
            return true;
        }
    }
    return result;
}

jQuery(function () {
    'use strict';
    /*
    //COMMENTATO: fatto controllo e compilazione lato server!
    if (jQuery('#codeAblumFixedValue')) {
        var clickEvent = jQuery('.btn-cart').attr('onclick');
        jQuery('.btn-cart').attr('onclick',
            'javascript:if (doSubmitWithCheck()) { ' + clickEvent + '}');
    }
    */
    jQuery('input:text:input[checkt="check"]').keyup(function(e){
        jQuery(this).val(jQuery(this).val().replace(' ', ''));
    });

    if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
        jQuery('input:text:input[checkt="check"]').each(function(){
            jQuery(this).keyup(func.checkDuplicated);
        });
        jQuery('input:text:input[checkt="check"]').each(function(){
            jQuery(this).keyup(func.checkValidity);
        });
    }else{
        jQuery('input:text:input[checkt="check"]').change(func.checkDuplicated);
        jQuery('input:text:input[checkt="check"]').change(func.checkValidity);
    }

    Validation.add(
        'validate-duplicate-stickers',
        '<p class="alert alert-danger">' + jQuery('#messageToStickersDuplicated').text() + '</p>',
        func.checkDuplicatedWithFocus
    );
    Validation.add(
        'validate-invalid-stickers',
        '<p class="alert alert-danger">' + jQuery('#messageToStickersInvalid').text() + '</p>',
        func.checkInvalidWithFocus
    );
    Validation.add(
        'atleast-a-stickers',
        '<p class="alert alert-danger">' + jQuery('#messageToStickersMissed').text() + '</p>',
        func.checkAtLeastASticker
    );
    /*
    Validation.add(
        'validate-album',
        jQuery('#codeAblumFixedValue').text(),
        addPrefixToAlbumCode
    );
    */
});

function doSubmitWithCheck() {
    'use strict';
    if (productAddToCartForm.validator.validate()) {
        return addPrefixToAlbumCode();
    }
    return false;
}

