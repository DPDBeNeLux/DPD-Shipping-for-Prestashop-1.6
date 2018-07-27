jQuery(document).ready(function () {
    jQuery('.standard-value').on('input', function () {
        if (jQuery(this).prop('checked') == true){
            jQuery('.step-3-form').hide();
        }else {
            jQuery('.step-3-form').show();
        }
    });
});