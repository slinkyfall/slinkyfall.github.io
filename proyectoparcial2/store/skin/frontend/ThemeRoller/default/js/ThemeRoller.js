jQuery.noConflict();

jQuery(document).ready(function(){

    jQuery(function() {
	jQuery.ajax({
          url: "/store/user-info/",
        }).done(function(data) {
            jQuery('#mini-cart-qty').text(data.cart_items);
        });	
    });

    // start of js for country-switcher
    jQuery('#country-switcher').click(function (e) {
        e.preventDefault();
        jQuery('.country-selector-wrapper').toggleClass('hidden');
    });

    jQuery('.country-selector-wrapper .close-btn').click(function (e) {
        e.preventDefault();
        jQuery('.country-selector-wrapper').toggleClass('hidden');
    });

    jQuery('.continents-list a').click(function (e) {
        e.preventDefault();
        var continent;
        jQuery('.continents-list li').removeClass('active');
        jQuery(this).parent().addClass('active');
        continent = jQuery(this).attr('rel');
        jQuery('.country-list').addClass('hidden');
        jQuery('#' + continent).removeClass('hidden');
    });

    jQuery('.country-list a').each(function () {
        var itemLink = jQuery(this).attr('href');
        if (itemLink == 'http://' + location.host + '/') {
            jQuery(this).parent().addClass('active');
        }
    });
    // end of js for country-switcher

    jQuery('#checkoutSteps input[type=\'text\']').blur(function () {
        CheckAsciiValues(this);
    });

    jQuery('.form-list input[type=\'text\']').blur(function () {
        CheckAsciiValues(this);
    });

    jQuery('.form-address input[type=\'text\']').blur(function () {
        CheckAsciiValues(this);
    });

    /*
    // ENABLE INPUT VALIDATION ON CHAR TYPE

    jQuery('.tx-t3registration-pi1 input[type=\'text\']').blur(function () {
        CheckAsciiValues(this);
    });

    jQuery('.tx-t3registration-pi1 #address').blur(function () {
        if (!jQuery(this).val().match(/[\s|,]{1}[\d]{1,}/g)) {
            var errorMsg = jQuery('#address-message').val();
            alert(errorMsg);
        }
    });

    jQuery('.tx-t3registration-pi1 #zipcode').blur(function () {
        var pattern = new RegExp(jQuery('#zipcode-regex').val());
        if (!pattern.test(jQuery(this).val())) {
            var errorMsg = jQuery('#zipcode-message').val();
            alert(errorMsg);
        }
    });

    jQuery('.tx-t3registration-pi1 input#mobilephone').blur(function () {
        var value = jQuery.trim(jQuery(this).val());
        jQuery(this).val(value);
    });


    // Hover effect on main menu items
    jQuery('#main-navigation ul li.has-submenu').hover(function () {
            jQuery(this).addClass('hover');
        },
        function () {
            jQuery(this).removeClass('hover');
        });

    // Advanced header image position
    jQuery('.adv-header').each(function () {
        var advImage = jQuery(this).children('img');
        var advImageWidth = jQuery(advImage).width();
        var advImageHeight = jQuery(advImage).height();
        var advTitle = jQuery(this).children('h2')
        var headercontent = jQuery(advTitle).html();

        jQuery(advTitle).html('<span>' + headercontent + '</span>');
        var marginLeft = jQuery(advTitle).children('span').position().left;

        var imgMargin = marginLeft - advImageWidth;
        var imgTop = (advImageHeight - 58) / 2;

        jQuery(advImage).css("left", imgMargin + "px");
        jQuery(advImage).css("top", "-" + imgTop + "px");
        jQuery(advImage).show();
    });

    jQuery('.adv-header').click(function () {
        var link = jQuery(this).parent().parent().attr("id");
        link = '#' + link
        target = jQuery(link);
        jQuery('html, body').animate({
            scrollTop: target.offset().top
        }, 400, 'swing');
        return false;
    });

    jQuery('.adv-footer .destra a').click(function () {
        jQuery('html, body').animate({
            scrollTop: 0
        }, 500, 'swing');
        return false;
    });
    */

    // footer to-top
    jQuery('.panel-footer .toTop').click(function (e) {
        e.preventDefault();
        jQuery('html, body').animate({
            scrollTop: 0
        }, 500, 'swing');
    });


    // Slidebox effect
    jQuery('.slidebox').each(function () {
        var link = jQuery(this).find("a").attr('href');
        jQuery(this).find(".cover").wrapAll('<a href="" target="_blank"/>');
        jQuery(this).find(".cover").parent().attr('href', link);
    });

    jQuery('.slidebox').hover(function () {
        jQuery(".cover", this).stop().animate({top: '0px'}, {queue: false, duration: 300});
    }, function () {
        jQuery(".cover", this).stop().animate({top: '101px'}, {queue: false, duration: 300});
    });

    /*
     // Pages without breadcrumbs
    var contentFirstChild = jQuery('#main-content div').first();
    if (!contentFirstChild.hasClass('breadcrumbs')) {
        contentFirstChild.css('margin-top', '20px');
        jQuery('.sidebar').css('margin-top', '20px');
    }
    */

    // Section items animation
    jQuery('.section-list ul li').hover(function () {
        jQuery(this).css('width', '72px');
        jQuery(this).animate({
            width: 226
        })
    }, function () {
        jQuery(this).animate({
            width: 72
        })
    });

    jQuery('#product_addtocart_form').find('.product-image a').attr('rel', 'fancybox');
    jQuery('#checkout-step-login').find('button').click(function () {
        jQuery(this).parent().find('#billing-please-wait').css('display', 'block');
    });

});
