amlabel_product_ids     = [];

Event.observe(document, 'dom:loaded', amlabel_init);

function amlabel_init() {
    $$(amlabel_selector).each(function (element) {
        amlabel_add_label(element);
    });
}

function amlabel_add_label(element){
    var product_ar = [];
    var product_id = 0;
    var element_id = 0;
    var element_with_id = 0;
    var n = 0;
    var max_parent_search_level = 3;

    do {
        // find price block
        element_with_id = element.up(n).down('.price');
        // find block with id
        if (element_with_id) {
            // get element ID
            element_id = element_with_id.readAttribute('id');

            // check if parent is not a table (configurable products fix)
            if (element_with_id.up('#super-product-table')) {
                element_with_id = element_with_id.up('#super-product-table').next('.price');
                element_id = element_with_id.readAttribute('id');
            }

            // if element with ID placed one level upper (e.g. bundle price box styles)
            if (!element_id) {
                element_id = element_with_id.up().readAttribute('id');
            }
        }
        n += 1;
    } while (!element_with_id && n < max_parent_search_level);

    // if element have any ID
    if (element_id) {
        // direct product lists
        product_ar = element_id.split('-');
        product_id = product_ar[product_ar.length - 1];
        // uncommon product lists
        if (!parseInt(product_id)) {
            product_id = product_ar[product_ar.length - 2];
        }
    }

    if (product_id > 0 && amlabel_product_ids[product_id]) {
        // check on zoom elements before insert
        var classes = $w(element.className).join();
        if (classes.indexOf('zoom-') > 0) {
            $(element).down().setStyle({'position': 'relative'}).insert(amlabel_product_ids[product_id].replace(/\\"/g, '"'));
        } else {
            $(element).setStyle({'position': 'relative'}).insert(amlabel_product_ids[product_id].replace(/\\"/g, '"'));
        }
    }
}
