jQuery(document).ready(function(){
    cookie.init()
});

var cookie = {
    handle : null,
    closeButton : null,
    cookieName : 'pnn-cookie-check',
    init : function()
    {
        // handle to the main div
        this.handle = jQuery('#pnn-cookie');

        if(jQuery('html').hasClass('no-rgba')){
            jQuery('body').prepend(this.handle);
        }

        // first check existing cookies
        var cookie = this.getCookie(this.cookieName);

        if(cookie == false){

            // show to message
            this.handle.removeClass('hidden');

            var scope = this;

            // close button event
            jQuery('#pnn-cookie .pnn-cookie-close, #pnn-cookie .pnn-cookie-ok').click(function(e){
                e.preventDefault();
                scope.hide();
                scope.setCookie();
            });
        }else{
            // hide the message
            this.hide();
        }
    },
    getCookie : function(name)
    {
        var cookies = document.cookie.split(';');
        for(var index in cookies){
            var cookiePairs = jQuery.trim(cookies[index]).split('=');
            if(cookiePairs[0] == name)
                return cookiePairs[1];
        }
        return false;
    },
    setCookie : function()
    {
        var d = new Date();
        d.setTime(d.getTime() + (365*86400000));
        document.cookie = this.cookieName + "=1; expires="+d.toGMTString()+"; path=/";
    },
    hide : function()
    {
        this.handle.addClass('hidden');
        this.handle.remove();
    }
}