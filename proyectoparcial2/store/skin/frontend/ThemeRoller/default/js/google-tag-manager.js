/*global $, jQuery*/

/**
 * Manage javascript GTM.
 * @param $ jQuery
*/
var gtm = (function ($) {
    // My for private, that for public
    var my = {}, that = {};


    my.detectSearchInputChange = function (input) {

      // prevent double listener init
      input.addClass('gtmInit');

      // define delay function
      var delay = (function(){
        var timer = 0;
        return function(callback, ms){
          clearTimeout (timer);
          timer = setTimeout(callback, ms);
        };
      })();


      // Save current value of element
      input.data('oldVal', input.val());

      // Look for changes in the input field
      input.on("propertychange change click keyup input paste", function(event) {

        // Do action
        my.x = $(this).val();

        // If value has changed...
        if (input.data('oldVal') != my.x) {

          // Updated stored value
          input.data('oldVal', my.x);

          // set delay
          delay( function() {

            if ((my.x !== '')&&(my.x.length > 2)&&(event.which != 13)) {

              dataLayer.push({'event':'GAevent','eventCategory':'search','eventAction':'istant-search','eventLabel':''+my.x+''});

            }

          }, 1000 );

        }





        // if value is send (kepress enter)
        if ((my.x !== '')&&(event.which == 13)) {

          dataLayer.push({'event':'GAevent','eventCategory':'search','eventAction':'search','eventLabel':''+my.x+''});

        }

      });

    };






    that.init = function () {

      //console.log("INIT GTM ThemeRoller"); 

      // >= 768px
      if ($('#search_mini_form #search').length > 0) {
        if (!$('#search_mini_form #search').hasClass('gtmInit')) {
          //detect input change on searchbar and detect enter keypress
          my.detectSearchInputChange($('#search_mini_form #search'));
        }
      }

      // mobile < 768px
      if ($('#search_mini_form_mobile #search_mobile').length > 0) {
        if (!$('#search_mini_form_mobile #search_mobile').hasClass('gtmInit')) {
          my.detectSearchInputChange($('#search_mini_form_mobile #search_mobile'));
        }
      }

    };

    // Return public function
    return that;

}(jQuery));


// start
jQuery(document).ready(function() {
  gtm.init();
});
