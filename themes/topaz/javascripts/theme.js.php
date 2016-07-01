<?php
    define('JAVASCRIPT', true);
    require_once dirname(dirname(dirname(dirname(__FILE__)))).DIRECTORY_SEPARATOR."includes".DIRECTORY_SEPARATOR."common.php";
?>
// Mobile navigation menu.
$(document).ready(function() {
    $('<li>', {
            "id": "mobile_toggle",
            "role": "presentation"
        }).append($("<a>", {
            "id": "mobile_toggle_link",
            "href": "#",
            "role": "menuitem",
            "aria-label": "<?php echo __("Menu", "theme"); ?>"
        }).on("click", function(e) {
            e.preventDefault();
            if ( $(".mobile_nav").hasClass("on") ) {
                $(".mobile_nav").removeClass("on");
            } else {
                $(".mobile_nav").addClass("on");
            }
        }).text("<?php echo __("Menu", "theme"); ?>")).appendTo("ul.tail_nav").parent().addClass("mobile_nav");
        $("body").addClass("mobile_nav");

        // Make the menu items keyboard accessible.
        $("ul.tail_nav.mobile_nav").on("focus", "a:not(#mobile_toggle_link)", function() {
            $(".mobile_nav").addClass("on");
        });
});
