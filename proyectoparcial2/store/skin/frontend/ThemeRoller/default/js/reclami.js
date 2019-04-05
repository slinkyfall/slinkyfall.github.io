/*jslint unparam: true, white: true */
/*global jQuery, Translator, window, wf_lib, submitForm, console */

/**
 * Gestione javascript reclami.
 * @param $ jQuery
 */
var reclami = (function ($) {
    "use strict";
    // My for private, that for public
    var my = {}, that = {};

    // Syncronous init
    my.init = function () {
        my.disabled = false;
        that.toFocus = undefined;
        my.toRemove = [];
        my.dbg = false;
        $(my.onLoad);
    };


    // Asyncronous init
    my.onLoad = function () {
        that.table = $('#my-orders-table');
        if (my.disabled) {
            return;
        }
        if (that.table.size() && that.order) {
            if (that.order.is_complainable) {
                my.addLink();
            } else if (that.order.has_complained_rows) {
                my.addHasComplainedRowsAlert();
            }
            if (that.is_debug) {
                $('.order-items.order-details > h3').attr('title',
                    that.debug(that.order));
                $.each(that.items, function (index, item) {
                    $('#' + index + " h3").attr('title',
                            that.debug(item));
                });
            }
        }
        if (that.table.size() && that.order) {
            my.addComplainedIcons();
        }
    };


    // Add complain icons
    my.addComplainedIcons = function () {
        that.table.find('tbody tr').each(function () {
            if ($(this).attr('id')) {
                if (that.items[$(this).attr('id')].has_complains) {
                    $(this).find('td:first > h3').prepend(my.createErrorIcon());
                }
            }
        });
    };


    // Add link
    my.addLink = function () {
        $('.order-details').prepend(
            wf_lib.createButton(
                Translator.translate('Complaint'),
                'button-show-complain',
                that.showLink
            )
            .addClass('complain-status')
            .css({float: 'right', margin: '3px', minWidth: '90px'})
        );
    };


    // addHasComplainedRowsAlert
    my.addHasComplainedRowsAlert = function () {
        $('.order-details').prepend(
            $('<strong>').addClass('text-danger')
                .append(Translator.translate('Order already complained'))
                .addClass('complain-status')
                .css({float: 'right', margin: '3px', minWidth: '90px'})
        );
    };


    // Disabilita la funzione
    that.disable = function () {
        my.disabled = true;
    };


    // Riceve i dati dell'ordine dal phtml
    that.setOrderData = function (data) {
        that.order = data.order;
        that.items = data.items;
        that.is_debug = data.is_debug;
    };


    // Show link
    that.showLink = function (callback) {
        if (my.toRemove.size()) {
            if (that.table.is(':hidden')) {
                submitForm.hideSubmitDiv(function () {
                    that.showLink(callback);
                });
                return;
            }
            if (typeof callback === 'function') {
                callback();
            }
            $('#button-show-complain > span > span')
                    .html(Translator.translate('Complaint'));
            $.each(my.toRemove, function (index, item) {
                item.remove();
            });
            my.toRemove = [];
            that.table.find('tfoot').replaceWith(my.savedFooter);
        } else {
            my.toRemove.push($('<br>'));
            $('#button-show-complain > span > span')
                    .html(Translator.translate('Cancel'));
            if (that.order.contains_complainable_rows) {
                my.toRemove.push($('<col>')
                    .attr("width", "1")
                    .appendTo(that.table.find('colgroup')));
                my.toRemove.push($('<th>').addClass("a-center")
                        .append(Translator.translate('Complaint')
                    )
                    .appendTo(that.table.find('thead tr')));
                that.table.find('tbody tr').each(function () {
                    my.toRemove.push($('<td>').addClass("a-center")
                            .append(my.createComplainCheck($(this))
                        )
                        .appendTo($(this)));
                });
            }
            my.savedFooter = that.table.find('tfoot').replaceWith(my.createButtons());
            
            if (that.order.is_mixed_shipping_and_products_from_abroad) {
                $('.button-missing-shipment').hide();
            }

            
            wf_lib.scrollToDiv(that.table, 60);
        }
    };


    // Crea il footer con i pulsanti di submit
    my.createButtons = function () {
        var div = $('<div>').css({minHeight: '56px'});
        if (that.order.can_complain_for_missing_shipment) {
            div.append(
                wf_lib.createButton(Translator.translate('Missing delivery'), 'submit-complain-1', undefined)
                    .css({float: 'right', marginTop: '5px', marginLeft: '5px'})
                    .addClass('button-missing-shipment')
                    .click(function () {
                        // Check: missing shipment, PRIMA SELEZIONA TUTTE LE RIGHE
                        reclami.table.find('tbody input:visible').attr('checked', 'checked');
                        reclami.table.find('tbody input:visible').prop('checked', true);
                        submitForm.show(submitForm.showMissingShipmentForm);
                    }).hide()
            );
        }

        if (that.order.enable_wrong_stickers) {
            div.append(
                wf_lib.createButton(Translator.translate('Wrong stickers'), 'submit-complain-2', undefined)
                    .css({float: 'right', marginTop: '5px', marginLeft: '5px'})
                    .addClass('button-wrong-stickers')
                    .addClass('submit-complaint')
                    .click(function () {
                        submitForm.show(submitForm.showWrongStickersForm);
                    }).hide()
            );
        }
        if (that.order.enable_generic) {
            div.append(
                wf_lib.createButton(Translator.translate('Generic complaint'), 'submit-complain-4', undefined)
                    .css({float: 'right', marginTop: '5px'})
                    .addClass('button-generic-complain')
                    .addClass('submit-complaint')
                    .click(function () {
                        // quarantine.post();
                        submitForm.show(submitForm.showGenericComplaintForm);
                    }).hide()
            );
        }
        return $('<tfoot>')
            .append($('<tr>')
                .append($('<td>').attr('colspan', '5')
                    .append(div)
                )
            );
    };


    // Show form
    that.showForm = function (div, callback) {
        var d = $('<div>').css({clear: 'both',
                height: '40px',
                paddingTop: '20px',
                width: '70%'}).append(
            wf_lib.createButton(
                Translator.translate('Cancel'),
                'cancel-complaint', that.showLink
            ).addClass('cancel-complaint').css({float: 'right', margin: '5px'})
        ).appendTo(div);
        my.hideTable(callback);
        return d;
    };


    // Hide table
    my.hideTable = function (callback) {
        that.table.fadeOut('fast', function () {
            $(this).replaceWith(submitForm.submitDiv.fadeIn('fast', function () {
                wf_lib.scrollToDiv(submitForm.submitDiv, 60);
                my.focusElement();
                if ($.isFunction(callback)) {
                    callback();
                }
            }));
        });
    };


    // Focus element
    my.focusElement = function () {
        if (that.toFocus) {
            that.toFocus.focus();
            that.toFocus = undefined;
        }
    };


    // Debug
    that.debug = function (toShow) {
        var text = "";
        $.each(toShow.causes, function (index, item) {
            text = text + item + "\n";
        });
        return text;
    };


    // Error icon
    my.createErrorIcon = function () {
        return $('<img>')
                .attr('title', Translator.translate('Item already complained'))
                .attr('alt', Translator.translate('Item already complained'))
                .attr('width', '16px').attr('height', '16px')
                .addClass('complaint-error-icon')
                .css({margin: '0 5px'})
                .attr('src', that.order.skin + 'frontend/default/default/images/i_msg-error.gif');
    };


    // Crezione del check
    my.createComplainCheck = function (row) {
        if (row.attr('id')) {
            var d = that.items[row.attr('id')], rv;
            // "data()" carica dati nell'elemento
            row.data('d', d);
            if (d.has_complains) {
                return my.createErrorIcon();
            }
            if (!d.is_complainable) {
                return undefined;
            }
            rv = $('<input>').attr('type', 'checkbox')
                .click(my.selectionChanged)
                .data('d', d)
                .hide().fadeIn('fast');


            return rv;
       }
    };

    // Qui la logica per abilitare o meno i check.
    my.selectionChanged = function () {
        that.table.find('tbody input:hidden').show();
        that.table.find('tbody input').each(my.validateRowCheck);
    };

    // Validate row check
    my.validateRowCheck = function () {
        // Da rivedere, ciclare indipendentemente da $(this)
        var data = $(this).data('d'),
            enableGeneric = true,
            enableMissingShipment = true,
            enableWrongStickers = true,
            counter = 0,
            toEnable = "",
            toDisable = "";

        my.checkShippingSources();

        that.table.find('tbody input:visible:checked').each(function () {
            var ddata = $(this).data('d');
            if (!ddata.is_enabled_generic_complain) {
                enableGeneric = false;
            }
            if (!ddata.is_enabled_missing_shipment) {
                enableMissingShipment = false;
            }
            if (!ddata.is_enabled_wrong_stickers) {
                enableWrongStickers = false;
            }
            counter = counter + 1;
        });
        that.table.find('tbody input:visible:not(:checked)').each(function () {
            var ddata = $(this).data('d');
            var lEnableGeneric = enableGeneric;
            var lEnableMissingShipment = enableMissingShipment;
            var lEnableWrongStickers = enableWrongStickers;
            if (!ddata.is_enabled_generic_complain && enableGeneric) {
                lEnableGeneric = false;
            }
            if (!ddata.is_enabled_missing_shipment && enableMissingShipment) {
                lEnableMissingShipment = false;
            }
            if (!ddata.is_enabled_wrong_stickers && enableWrongStickers) {
                lEnableWrongStickers = false;
            }
            if (!lEnableWrongStickers && !lEnableGeneric && !lEnableMissingShipment) {
                my.deselect($(this));
            }
        });
        
        toEnable = "";
        if (enableGeneric && counter) {
            toEnable = toEnable + ", .button-generic-complain";
        } else {
            toDisable = toDisable + ", .button-generic-complain";
        }
        if (enableMissingShipment && counter) {
            toEnable = toEnable + ", .button-missing-shipment";
        } else {
            toDisable = toDisable + ", .button-missing-shipment";
        }
        if (enableWrongStickers && counter) {
            toEnable = toEnable + ", .button-wrong-stickers";
        } else {
            toDisable = toDisable + ", .button-wrong-stickers";
        }
        // FIXME, come mai non funzionano più disable e enable?
        $(toDisable.replace(/^,\s+/, '')).hide()/*.disable()*/;
        $(toEnable.replace(/^,\s+/, '')).show()/*.enable()*/;
        return true;
    };


    // Validate subimt
    my.validateSubmit = function (bEnable) {
        var nr = that.table.find('tbody input:visible:checked').size();
        if (nr && bEnable) {
            $('.' + bEnable).show().enable();
        } else {
            $('.button-raccolta-completa-scatola-magazine, .button-figurina-mancante, .button-is-mixed-shipping-and-products').disable();
        }
    };


    // Cannot check different shipping sources.
    my.checkShippingSources = function () {
        var checkedItem = that.table.find('tbody input:checked'), data;
        data = checkedItem.data('d');
        if (!data || !data.shipment_source) {
            return;
        }
        // Disable all other shipment sources
        that.table.find('tbody input:visible').each(function () {
            var itemData = $(this).data('d');
            if (itemData.shipment_source !== data.shipment_source) {
                my.deselect($(this));
            }
        });
    };

    // Deselect on attribute
    my.deselectOn = function (attr) {
        that.table.find('tbody input').each(function () {
            if ($(this).data('d')[attr]) {
                my.deselect($(this));
            }
        });
    };

    // Deselect
    my.deselect = function (a) {
        a.removeAttr('checked').hide();
    };

    // Call init
    my.init();

    // Return public function
    return that;

}(jQuery));
















/**
 *  Libreria.
 *  @param $ jQuery
 */
var wf_lib = (function ($) {
    "use strict";

    // My for private, that for public
    var my = {}, that = {};

    my.init = function () {
        my.overDiv = $('<div>')
            .css({background: 'black', position: 'absolute'}).hide()
            .appendTo($('body'));
    };

    // Create button
    that.createButton = function (label, id, callback) {
        return $('<button>')
            .addClass('button-normal')
            .addClass('btn')
            .attr('id', id)
            .append($('<span>')
                .append($('<span>')
                    .append(label)
                )
            )
            .click(callback)
            .addClass('button');
    };

    // Scroll to element
    that.scrollToDiv = function (element, navheight) {
        var offsetTop, totalScroll;
        offsetTop = element.offset().top;
        totalScroll = offsetTop - navheight;

        $('body,html').animate({
            scrollTop: totalScroll
        }, 350);
    };

    // Hide wait icon over a block
    that.hideWaitIcon = function (callback) {
        my.overDiv.fadeOut('fast', callback);
    };

    // Add wait icon over a block
    that.showError = function (block, error, callback) {
        my.showDiv(block);
        my.overDiv.append($('<p>').append(error)
            .css({marginTop: my.overDiv.height() / 2 - 12, color: 'white'})
            );
        my.overDiv.fadeTo('fast', 0.6).delay(4500).fadeOut('slow', callback);
    };

    // Add Message over a block
    that.showMessage = function (block, message, callback) {
        my.showDiv(block);
        my.overDiv.append($('<p>').append($('<strong>').append(message))
            .css({marginTop: my.overDiv.height() / 2 - 12, color: 'white'})
            );
        my.overDiv.fadeTo('fast', 0.6).delay(4500).fadeOut('slow', callback);
    };

    // Show div
    my.showDiv = function (block) {
        var pos = block.offset();
        my.overDiv.find('*').remove();
        my.overDiv.css({top: pos.top - 10, left: pos.left - 10});
        my.overDiv.height(block.outerHeight() + 20);
        my.overDiv.width(block.outerWidth() + 20);
    };

    // Add wait icon over a block
    that.waitIcon = function (block, callback) {
        my.showDiv(block);
        my.overDiv.append($('<img>')
            .attr('width', '24')
            .attr('height', '24')
            .attr('src', '/store/js/lightboxes/prettyPhoto/images/prettyPhoto/dark_rounded/loader.gif')
            .css({marginTop: my.overDiv.height() / 2 - 12})
            );
        my.overDiv.fadeTo('slow', 0.3, callback);
    };

    $(my.init);

    // Return public function
    return that;

}(jQuery));














/**
 * Submit form
 * @param $ jQuery
 */
var submitForm = (function ($) {
    "use strict";

    // My for private, that for public
    var my = {}, that = {};

    // Syncronous init
    my.init = function () {
        $(my.onLoad);
    };

    // Asyncronous init
    my.onLoad = function () {
        $.fn.enable = function() {
            return this.each(function () {
                $(this).filter(':hidden').fadeIn('fast');
            });
        };
        $.fn.disable = function() {
            return this.each(function () {
                $(this).filter(':visible').fadeOut('fast');
            });
        };
    };

    // Call init
    my.init();


    // Show form
    that.show = function (callback) {
        // Reclamo raccolte complete, scatole e magazine?
        var rows = [];
        reclami.table.find('tbody input:visible:checked').each(function () {
            rows[rows.length] = $(this).data('d');
        });
        if (rows.length) {
            callback(rows);
        }
    };


    // L'utente verrà portato ad una pagina che riepiloga i dati dell'ordine
    // ed avrà la facoltà di indicare fino al 25% (percentuale configurabile
    // a livello di website) dei codici di figurine mancanti ordinate per quella riga.
    that.showWrongStickersForm = function (rows) {
        var table = my.createDetailTable(rows, true);
        my.createSubmitDiv();
        my.addSubmitTitles(Translator.translate('Wrong stickers'),
            Translator.translate('Order') + ' ' + reclami.order.order_number);
        table.appendTo(that.submitDiv);
        my.addCommentArea();
        reclami.showForm(that.submitDiv, my.updateButtonEnabled).append(
            wf_lib.createButton(
                Translator.translate('Submit complaint'),
                'submitcomplaint', function () {
                    my.submitFigurineSbagliateForm(rows,
                        that.submitDiv.find('textarea').val());
                }
            ).addClass('submit-complaint').css({float: 'right', margin: '5px'}));
    };

    // Form dove troverà precompilati i dati dell'ordine (utente, numero ordine, righe reclamate)
    // e una textarea in cui inserire dei commenti relativi ai motivi del reclamo.
    that.showGenericComplaintForm = function (rows) {
        var table = my.createDetailTable(rows);
        my.createSubmitDiv();
        my.addSubmitTitles(Translator.translate('Complaint details'),
            Translator.translate('Order') + ' ' + reclami.order.order_number);
        table.appendTo(that.submitDiv);
        reclami.showForm(that.submitDiv, my.updateButtonEnabled).append(
            wf_lib.createButton(
                Translator.translate('Submit complaint'),
                'submitcomplaint', function () {
                    my.submitGenericComplainForm(rows);
                }
            ).addClass('submit-complaint').css({float: 'right', margin: '5px'}));
    };


    that.showMissingShipmentForm = function (rows) {
        var table = my.createDetailTable(rows);
        my.createSubmitDiv();
        my.addSubmitTitles(Translator.translate('Missing delivery'),
            Translator.translate('Order') + ' ' + reclami.order.order_number);
        table.appendTo(that.submitDiv);
        my.addCommentArea();
        reclami.showForm(that.submitDiv, my.updateButtonEnabled).append(
            wf_lib.createButton(
                Translator.translate('Submit complaint'),
                'submitcomplaint', function () {
                    my.submitMissingShipmentForm(rows,
                            that.submitDiv.find('textarea').val());
                }
            ).addClass('submit-complaint').css({float: 'right', margin: '5px'}));
    };


    // Add comment text area
    my.addCommentArea = function () {
        $('<label>')
            .attr('for', 'complain-subject')
            .append(Translator.translate('Comments'))
            .appendTo(that.submitDiv);
        $('<br>').appendTo(that.submitDiv);
        reclami.toFocus = $('<textarea>')
            .attr('rows', '8')
            .attr('cols', '50')
            .css({width: 'auto'})
            .attr('name', 'complain-subject')
            .appendTo(that.submitDiv);
    };


    // Detail table
    my.createDetailTable = function (rows, showOpts) {
        var table = $("<table>").addClass('data-table');

        /*$('<colgroup>')
                .append($('<col>'))
                .append($('<col>').attr('width', '1'))
                .appendTo(table);*/
        $.each(rows, function (index, item) {
            var opt, tr, trOpt;
            tr = $('<tr>').addClass('row')
                .append($('<td>').append($('<h3>').addClass('product-name').append(item.name)))
                .append($('<td>').append(item.qty))
                .appendTo(table).data('d', item);
            if (showOpts) {
                opt = my.getOptions(item);
                if (opt) {
                    opt.data('tr', tr);
                    tr.data('tr', trOpt);
                    trOpt = $('<tr>')
                        .append($('<td>').append(opt).attr('colspan', '2'))
                        .appendTo(table).data('tr', tr);
                    opt.find('input').each(my.setRowProductOptions);
                }
            }
        });
        return table;
    };


    // Set row product options
    my.setRowProductOptions = function () {
        var v = [], maxPerc, currPerc;
        $(this).parent().find('input:checked').each(function () {
            v[v.length] = $(this).data('d');
        });
        $(this).parent().data('tr').data('d').selectedOptions = v;
        if (!reclami.order.max_figurine_sbagliate) {
            reclami.order.max_figurine_sbagliate = 100;
        }
        currPerc = 100 *
                (1 + $(this).parent().find('input:checked').size()) /
                $(this).parent().find('input').size();

        maxPerc = reclami.order.max_figurine_sbagliate;
        if (currPerc > maxPerc) {
            $(this).parent().find('input:not(:checked)').attr('disabled', 'disabled');
        } else {
            $(this).parent().find('input').removeAttr('disabled');
        }
        my.updateButtonEnabled();
    };

    // Ubdate button enabled if found 
    my.updateButtonEnabled = function () {
        var rv = true;
        $('.inputfigurina_container:visible').each(function () {
            if ($(this).find('.inputfigurina:visible').size() > 0
                    && $(this).find('.inputfigurina:visible:checked').size() === 0) {
                rv = false;
            }
        });
        if (rv) {
            $('#submitcomplaint').removeAttr('disabled');
        } else {
            $('#submitcomplaint').attr('disabled', 'disabled');
        }
    };


    // La riga ha delle opzioni?
    my.getOptions = function (item) {
        var rv;
        if (!item.options || !item.options.options) {
            return rv;
        }
        $.each(item.options.options, function (index, i) {
            if (i.label === '###ELENCO_FIGURINE###' || i.label === '###GRIGLIA_FIGURINE###') {
                rv = $('<span>').addClass('inputfigurina_container');
                $.each(i.value.split(/, /), function (i1, opt) {
                    var input = $('<input>').attr('type', 'checkbox')
                        .addClass('inputfigurina')
                        .click(my.setRowProductOptions)
                        .data('d', opt);
                    rv.append(input).append(opt).append('<br/>');
                });
            }
        });
        return rv;
    };


    // Create submit div
    my.createSubmitDiv = function () {
        that.submitDiv = $('<div>').addClass('complaint-submit-div')
                .css({minHeight: '300px', overflow: 'hidden'}).hide();
    };


    // Add titles
    my.addSubmitTitles = function (t1, t2) {
        that.submitDiv.append($('<h3>').append(t1)).append($('<h4>').append(t2));
    };


    // SUBMIT

    // Submit complain
    //   Alla submit, verrà inviata una mail al customer care con i dati inseriti e verrà salvata
    //   nel database in un'apposita tabella la segnalazione di reclamo.
    //   La form di segnalazione reclamo dovrà eseguire una chiamata post
    //   ad una URL apposita con i parametri inseriti dall'utente
    //   La mail del customer care sarà configurabile a livello di store view e potrà essere diversa
    //   per tipo di prodotto reclamato
    my.submitGenericComplainForm = function (rows) {
        // text = ...
        var text = my.composeMessage(rows);
        my.submitDataLater(rows, text, 'genericComplain');
    };

    my.composeMessage = function (rows) {
        var returnValue = '';
        $.each(rows, function (index, item) {
            returnValue = returnValue + parseInt(item.qty) + ' x ' + item.name;
            returnValue = returnValue + '\n';
        });
        return returnValue;
    };

    // Raccolta sbagliata
    my.submitRaccoltaSbagliataForm = function (rows, text) {
        my.submitDataLater(rows, text, 'raccoltaSbagliata');
    };

    // Raccolta sbagliata
    my.submitFigurineSbagliateForm = function (rows, text) {
        my.submitData(rows, text, 'figurineSbagliate');
    };

    // Raccolta sbagliata
    my.submitMissingShipmentForm = function (rows, text) {
        my.submitData(rows, text, 'missingShipment');
    };

    // Generic submit data
    my.submitDataLater = function (rows, text, method) {
        my.submitData(rows, text, method, true);
    };

    // Generic submit data
    my.submitData = function (rows, text, method, later) {
        var doit, intheend, errorCallback, error, d;
        d = {order: reclami.order, rows: rows, comment: text};
        if (later) {
            d.later = 1;
        }
        doit = function () {
            $('#button-show-complain, #cancel-complaint, #submitcomplaint').hide();
            $.ajax({
                url: reclami.order.controller_url + method,
                success: intheend,
                error: errorCallback,
                type: 'POST',
                dataType: 'json',
                data: d}
            );
        };

        errorCallback = function () {
            error("Error during complain submission");
        };
        error = function (message) {
            wf_lib.hideWaitIcon(function () {
                wf_lib.showError(that.submitDiv,
                    Translator.translate(message),
                    my.showLink);
            });
        };

        intheend = function (data) {
            // data = JSON.parse(data);
            // reclami.debug(data);
            if (data.status === 'Ok') {
                if (data.sendPost) {
                    my.sendPostCrmData(data.sendPost);
                    return;
                }
                wf_lib.hideWaitIcon(function () {
                    wf_lib.showMessage(that.submitDiv, data.message, function () {
                        reclami.showLink(function () {
                            window.location.reload();
                        });
                    });
                });
            } else {
                error(data.exception);
            }
        };
        wf_lib.waitIcon(that.submitDiv, doit);
    };

    my.sendPostCrmData = function (data) {
        var url = data.url,
            form = $('<form>')
            .attr('action', data.url)
            .attr('method', "get")
            .attr('target', '_blank');
        var order = data.order;
        data = data.data;
        $('<input>').attr('type', 'submit').val('Submit').appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'website').val(data.website).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'hash').val(data.hash).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'url_magento_site').val(data.callbackUrl).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'confirm').val(reclami.order.controller_url + "confirm").appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'source').val(data.source).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'area').val(data.area).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[firstname]').val(data.user.firstname).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[surname]').val(data.user.surname).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[email]').val(data.user.email).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[country]').val(data.user.country).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[county]').val(data.user.county).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[address]').val(data.user.address).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[city]').val(data.user.city).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[zip]').val(data.user.zip).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[telephone]').val(data.user.telephone).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[issue]').val(data.user.issue).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[message]').val(data.user.message).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[ordernumber]').val(order).appendTo(form);
        $('<input>').attr('type', 'hidden').attr('name', 'user[shipping_source]').val(data.shipping_source).appendTo(form);
        console.log("redirect to " + url + '?' + form.serialize());
        window.location.assign(url + '?' + form.serialize());
    };



    // Hide submit div
    that.hideSubmitDiv = function (callback) {
        that.submitDiv.fadeOut('fast', function () {
            $(this).replaceWith(reclami.table.fadeIn('fast', function () {
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }));
        });
    };

    // Return public function
    return that;
}(jQuery));
