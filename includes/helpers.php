<?php
    /**
     * File: helpers
     * Various functions used throughout the codebase.
     */

    #---------------------------------------------
    # Sessions
    #---------------------------------------------

    /**
     * Function: session
     * Begins Chyrp's custom session storage whatnots.
     *
     * Parameters:
     *     $secure - Send the cookie only over HTTPS?
     */
    function session($secure = null): void {
        if (session_status() == PHP_SESSION_ACTIVE) {
            trigger_error(
                __("Session cannot be started more than once."),
                E_USER_NOTICE
            );
            return;
        }

        $handler = new Session();
        session_set_save_handler($handler, true);

        $parsed = parse_url(Config::current()->url);
        fallback($parsed["scheme"], "http");
        fallback($parsed["host"], $_SERVER['SERVER_NAME']);

        if (!is_bool($secure))
            $secure = ($parsed["scheme"] == "https");

        $options = array(
            "lifetime" => COOKIE_LIFETIME,
            "expires"  => time() + COOKIE_LIFETIME,
            "path"     => "/",
            "domain"   => $parsed["host"],
            "secure"   => $secure,
            "httponly" => true,
            "samesite" => "Lax"
        );

        $options_params = $options;
        $options_cookie = $options;

        unset($options_params["expires"]);
        unset($options_cookie["lifetime"]);

        session_set_cookie_params($options_params);
        session_name("ChyrpSession");
        session_start();

        if (isset($_COOKIE['ChyrpSession']))
            setcookie(session_name(), session_id(), $options_cookie);
    }

    /**
     * Function: logged_in
     * Mask for Visitor::logged_in().
     */
    function logged_in(): bool {
        if (!class_exists("Visitor"))
            return false;

        if (func_num_args())
            return false;

        return Visitor::logged_in();
    }

    /**
     * Function: authenticate
     * Mask for Session::hash_token().
     */
    function authenticate(): bool|string {
        if (!class_exists("Session"))
            return false;

        if (func_num_args())
            return false;

        return Session::hash_token();
    }

    #---------------------------------------------
    # Routing
    #---------------------------------------------

    /**
     * Function: redirect
     * Redirects to the supplied URL and exits immediately.
     *
     * Parameters:
     *     $url - The absolute or relative URL to redirect to.
     *     $code - Numeric HTTP status code to set (optional).
     */
    function redirect($url, $code = null)/*: never*/{
        if (!substr_count($url, "://"))
            $url = url($url);

        switch ($code) {
            case 301:
                header($_SERVER['SERVER_PROTOCOL']." 301 Moved Permanently");
                break;
            case 303:
                header($_SERVER['SERVER_PROTOCOL']." 303 See Other");
                break;
            case 307:
                header($_SERVER['SERVER_PROTOCOL']." 307 Temporary Redirect");
                break;
            case 308:
                header($_SERVER['SERVER_PROTOCOL']." 308 Permanent Redirect");
                break;
            default:
                header($_SERVER['SERVER_PROTOCOL']." 302 Found");
        }

        header("Location: ".unfix($url, true));
        exit;
    }

    /**
     * Function: show_403
     * Shows an error message with a 403 HTTP header.
     *
     * Parameters:
     *     $title - The title for the error dialog (optional).
     *     $body - The message for the error dialog (optional).
     */
    function show_403($title = "", $body = "")/*: never*/{
        $title = oneof($title, __("Forbidden"));
        $body = oneof($body, __("You do not have permission to access this resource."));

        $theme = Theme::current();
        $main = MainController::current();

        if (!MAIN or !$theme->file_exists("pages".DIR."403"))
            error($title, $body, code:403);

        header($_SERVER['SERVER_PROTOCOL']." 403 Forbidden");
        $main->feed = false; # Tell the controller not to serve feeds.
        $main->display("pages".DIR."403", array("reason" => $body), $title);
        exit;
    }

    /**
     * Function: show_404
     * Shows an error message with a 404 HTTP header.
     *
     * Parameters:
     *     $title - The title for the error dialog (optional).
     *     $body - The message for the error dialog (optional).
     */
     function show_404($title = "", $body = "")/*: never*/{
        $title = oneof($title, __("Not Found"));
        $body = oneof($body, __("The requested resource was not found."));

        $theme = Theme::current();
        $main = MainController::current();

        if (!MAIN or !$theme->file_exists("pages".DIR."404"))
            error($title, $body, code:404);

        header($_SERVER['SERVER_PROTOCOL']." 404 Not Found");
        $main->feed = false; # Tell the controller not to serve feeds.
        $main->display("pages".DIR."404", array("reason" => $body), $title);
        exit;
    }

    /**
     * Function: url
     * Mask for Route::url().
     */
    function url($url, $controller = null): string {
        if (!class_exists("Route"))
            return $url;

        return Route::url($url, $controller);
    }

    /**
     * Function: self_url
     * Returns an absolute URL for the current request.
     */
    function self_url(): string {
        $parsed = parse_url(Config::current()->url);
        $origin = fallback($parsed["scheme"], "http")."://".
                  fallback($parsed["host"], $_SERVER['SERVER_NAME']);

        if (isset($parsed["port"]))
            $origin.= ":".$parsed["port"];

        return fix($origin.$_SERVER['REQUEST_URI'], true);
    }

    /**
     * Function: htaccess_conf
     * Creates the .htaccess file for Chyrp Lite or overwrites an existing file.
     *
     * Parameters:
     *     $url_path - The URL path to MAIN_DIR for the RewriteBase directive.
     *
     * Returns:
     *     True if no action was needed, bytes written on success, false on failure.
     */
    function htaccess_conf($url_path = null): int|bool {
        $url_path = oneof(
            $url_path,
            parse_url(Config::current()->chyrp_url, PHP_URL_PATH),
            "/"
        );

        $filepath = MAIN_DIR.DIR.".htaccess";
        $template = INCLUDES_DIR.DIR."htaccess.conf";

        if (!is_file($template) or !is_readable($template))
            return false;

        $htaccess = preg_replace(
            '~%\\{CHYRP_PATH\\}/?~',
            ltrim($url_path."/", "/"),
            file_get_contents($template)
        );

        if (!file_exists($filepath))
            return @file_put_contents($filepath, $htaccess);

        if (!is_file($filepath) or !is_readable($filepath))
            return false;

        if (
            !preg_match(
                "~".preg_quote($htaccess, "~")."~",
                file_get_contents($filepath)
            )
        )
            return @file_put_contents($filepath, $htaccess);

        return true;
    }

    /**
     * Function: caddyfile_conf
     * Creates the caddyfile for Chyrp Lite or overwrites an existing file.
     *
     * Parameters:
     *     $url_path - The URL path to MAIN_DIR for the rewrite directive.
     *
     * Returns:
     *     True if no action was needed, bytes written on success, false on failure.
     */
    function caddyfile_conf($url_path = null): int|bool {
        $url_path = oneof(
            $url_path,
            parse_url(Config::current()->chyrp_url, PHP_URL_PATH),
            "/"
        );

        $filepath = MAIN_DIR.DIR."caddyfile";
        $template = INCLUDES_DIR.DIR."caddyfile.conf";

        if (!is_file($template) or !is_readable($template))
            return false;

        $caddyfile = preg_replace(
            '~\\{chyrp_path\\}/?~',
            ltrim($url_path."/", "/"),
            file_get_contents($template)
        );

        if (!file_exists($filepath))
            return @file_put_contents($filepath, $caddyfile);

        if (!is_file($filepath) or !is_readable($filepath))
            return false;

        if (
            !preg_match(
                "~".preg_quote($caddyfile, "~")."~",
                file_get_contents($filepath)
            )
        )
            return @file_put_contents($filepath, $caddyfile);

        return true;
    }

    /**
     * Function: nginx_conf
     * Creates the nginx configuration for Chyrp Lite or overwrites an existing file.
     *
     * Parameters:
     *     $url_path - The URL path to MAIN_DIR for the location directive.
     *
     * Returns:
     *     True if no action was needed, bytes written on success, false on failure.
     */
    function nginx_conf($url_path = null): int|bool {
        $url_path = oneof(
            $url_path,
            parse_url(Config::current()->chyrp_url, PHP_URL_PATH),
            "/"
        );

        $filepath = MAIN_DIR.DIR."include.conf";
        $template = INCLUDES_DIR.DIR."nginx.conf";

        if (!is_file($template) or !is_readable($template))
            return false;

        $caddyfile = preg_replace(
            '~\\$chyrp_path/?~',
            ltrim($url_path."/", "/"),
            file_get_contents($template)
        );

        if (!file_exists($filepath))
            return @file_put_contents($filepath, $caddyfile);

        if (!is_file($filepath) or !is_readable($filepath))
            return false;

        if (
            !preg_match(
                "~".preg_quote($caddyfile, "~")."~",
                file_get_contents($filepath)
            )
        )
            return @file_put_contents($filepath, $caddyfile);

        return true;
    }

    #---------------------------------------------
    # Localization
    #---------------------------------------------

    /**
     * Function: locales
     * Returns an array of locale choices for the "chyrp" domain.
     */
    function locales(): array {
        # Ensure the default locale is always present in the list.
        $locales = array(
            array(
                "code" => "en_US",
                "name" => lang_code("en_US")
            )
        );

        $dir = new DirectoryIterator(INCLUDES_DIR.DIR."locale");

        foreach ($dir as $item) {
            if (!$item->isDot() and $item->isDir()) {
                $dirname = $item->getFilename();

                if ($dirname == "en_US")
                    continue;

                if (class_exists("Locale")) {
                    if (Locale::getDisplayName($dirname) !== false)
                        $locales[] = array(
                            "code" => $dirname,
                            "name" => lang_code($dirname)
                        );
                } else {
                    if (preg_match("/^[a-z]{2,3}((_|-)[a-z]{2,3})*$/i", $dirname))
                        $locales[] = array(
                            "code" => $dirname,
                            "name" => lang_code($dirname)
                        );
                }
            }
        }

        return $locales;
    }

    /**
     * Function: set_locale
     * Sets the locale with fallbacks for platform-specific quirks.
     *
     * Parameters:
     *     $locale - The locale name, e.g. @en_US@, @uk_UA@, @fr_FR@
     */
    function set_locale($locale = "en_US"): void {
        $list = array(
            $locale.".UTF-8",
            $locale.".utf-8",
            $locale.".UTF8",
            $locale.".utf8"
        );

        if (class_exists("Locale")) {
            # Generate a locale string for Windows.
            $list[] = Locale::getDisplayLanguage($locale, "en_US").
                      "_".
                      Locale::getDisplayRegion($locale, "en_US").
                      ".utf8";

            # Set the ICU locale.
            Locale::setDefault($locale);
        }

        # Set the PHP locale.
        @putenv("LC_ALL=".$locale);
        setlocale(LC_ALL, $list);

        if (DEBUG)
            error_log("LOCALE ".setlocale(LC_CTYPE, 0));
    }

    /**
     * Function: get_locale
     * Gets the current locale setting.
     *
     * Notes:
     *     Does not use setlocale() because the return value is non-normative.
     */
    function get_locale(): string {
        if (
            INSTALLING or
            !file_exists(INCLUDES_DIR.DIR."config.json.php")
        ) {
            return isset($_REQUEST['locale']) ?
                $_REQUEST['locale'] :
                "en_US" ;
        }

        return Config::current()->locale;
    }

    /**
     * Function: load_translator
     * Sets the path for a gettext translation domain.
     *
     * Parameters:
     *     $domain - The name of this translation domain.
     *     $locale - The path to the locale directory.
     */
    function load_translator($domain, $locale): void {
        if (USE_GETTEXT_SHIM and class_exists("Translation")) {
            Translation::current()->load($domain, $locale);
            return;
        }

        if (function_exists("bindtextdomain"))
            bindtextdomain($domain, $locale);

        if (function_exists("bind_textdomain_codeset"))
            bind_textdomain_codeset($domain, "UTF-8");
    }

    /**
     * Function: lang_code
     * Converts a language code to a localised display name.
     *
     * Parameters:
     *     $code - The language code to convert.
     *
     * Returns:
     *     A localised display name, e.g. "English (United States)".
     */
    function lang_code($code): string {
        return class_exists("Locale") ?
            Locale::getDisplayName($code, $code) :
            $code ;
    }

    /**
     * Function: lang_base
     * Extracts the primary language subtag for the supplied code.
     *
     * Parameters:
     *     $code - The language code to extract from.
     *
     * Returns:
     *     The primary subtag for this code, e.g. "en" from "en_US".
     */
    function lang_base($code): string {
        $code = str_replace("_", "-", $code);
        $tags = explode("-", $code);
        return ($tags === false) ? "en" : $tags[0] ;
    }

    /**
     * Function: text_direction
     * Returns the correct text direction for the supplied language code.
     *
     * Parameters:
     *     $code - The language code.
     *
     * Returns:
     *     Either the string "ltr" or "rtl".
     */
    function text_direction($code): string {
        $base = lang_base($code);

        switch ($base) {
            case 'ar':
            case 'he':
                $dir = "rtl";
                break;
            default:
                $dir = "ltr";
        }

        return $dir;
    }

    /**
     * Function: __
     * Translates a string using gettext.
     *
     * Parameters:
     *     $text - The string to translate.
     *     $domain - The translation domain to read from.
     *
     * Returns:
     *     The translated string or the original.
     */
    function __($text, $domain = "chyrp"): string {
        if (USE_GETTEXT_SHIM)
            return Translation::current()->text(
                $domain,
                $text
            );

        if (function_exists("dgettext"))
            return dgettext(
                $domain,
                $text
            );

        return $text;
    }

    /**
     * Function: _p
     * Translates a plural (or not) form of a string.
     *
     * Parameters:
     *     $single - Singular string.
     *     $plural - Pluralized string.
     *     $number - The number to judge by.
     *     $domain - The translation domain to read from.
     *
     * Returns:
     *     The translated string or the original.
     */
    function _p($single, $plural, $number, $domain = "chyrp"): string {
        $int = (int) $number;

        if (USE_GETTEXT_SHIM)
            return Translation::current()->text(
                $domain,
                $single,
                $plural,
                $int
            );

        if (function_exists("dngettext"))
            return dngettext(
                $domain,
                $single,
                $plural,
                $int
            );

        return ($int != 1) ?
            $plural :
            $single ;
    }

    /**
     * Function: _f
     * Translates a string with sprintf() formatting.
     *
     * Parameters:
     *     $string - String to translate and format.
     *     $args - One arg or an array of arguments to format with.
     *     $domain - The translation domain to read from.
     *
     * Returns:
     *     The translated string or the original.
     */
    function _f($string, $args = array(), $domain = "chyrp"): string {
        $args = (array) $args;
        array_unshift($args, __($string, $domain));
        return call_user_func_array("sprintf", $args);
    }

    /**
     * Function: _w
     * Formats and internationalizes a string that isn't a regular time() value.
     *
     * Parameters:
     *     $formatting - The date()-compatible formatting.
     *     $when - A time() value or string to be strtotime() converted.
     *
     * Returns:
     *     An internationalized time/date string with the supplied formatting.
     */
    function _w($formatting, $when): string|false {
        static $locale;

        $time = is_numeric($when) ?
            $when :
            strtotime($when) ;

        if (!class_exists("IntlDateFormatter"))
            return date($formatting, $time);

        if (!isset($locale))
            $locale = get_locale();

        $formatter = new IntlDateFormatter(
            $locale,
            IntlDateFormatter::FULL,
            IntlDateFormatter::FULL,
            get_timezone(),
            IntlDateFormatter::GREGORIAN,
            convert_datetime($formatting)
        );

        return $formatter->format($time);
    }

    #---------------------------------------------
    # Time/Date
    #---------------------------------------------

    /**
     * Function: when
     * Formats a string that isn't a regular time() value.
     *
     * Parameters:
     *     $formatting - The formatting for date().
     *     $when - A time() value or string to be strtotime() converted.
     *
     * Returns:
     *     A time/date string with the supplied formatting.
     */
    function when($formatting, $when): string|false {
        $time = is_numeric($when) ?
            $when :
            strtotime($when) ;

        return date($formatting, $time);
    }

    /**
     * Function: datetime
     * Formats datetime for SQL queries.
     *
     * Parameters:
     *     $when - A timestamp (optional).
     *
     * Returns:
     *     A standard datetime string.
     */
    function datetime($when = null): string|false {
        fallback($when, time());

        $time = is_numeric($when) ?
            $when :
            strtotime($when) ;

        return date("Y-m-d H:i:s", $time);
    }

    /**
     * Function: now
     * Alias to strtotime, for prettiness like now("+1 day").
     */
    function now($when): string|false {
        return strtotime($when);
    }

    /**
     * Function: convert_datetime
     * Converts datetime formatting from PHP to ICU format.
     *
     * Parameters:
     *     $formatting - The datetime formatting.
     *
     * See Also:
     *     https://unicode-org.github.io/icu/userguide/format_parse/datetime/
     *     https://www.php.net/manual/en/datetime.format.php
     */
    function convert_datetime($formatting): string {
        return strtr($formatting, array(
            "A" => "'A'",  "a" => "a",
            "B" => "'B'",  "b" => "'b'",
            "C" => "'C'",  "c" => "'c'",
            "D" => "EEE",  "d" => "dd",
            "E" => "'E'",  "e" => "VV",
            "F" => "MMMM", "f" => "'f'",
            "G" => "H",    "g" => "h",
            "H" => "HH",   "h" => "hh",
            "I" => "'I'",  "i" => "mm",
            "J" => "'J'",  "j" => "d",
            "K" => "'K'",  "k" => "'k'",
            "L" => "'L'",  "l" => "EEEE",
            "M" => "MMM",  "m" => "MM",
            "N" => "'N'",  "n" => "M",
            "O" => "xx",   "o" => "'o'",
            "P" => "xxx",  "p" => "XXX",
            "Q" => "'Q'",  "q" => "'q'",
            "R" => "'R'",  "r" => "'r'",
            "S" => "'S'",  "s" => "ss",
            "T" => "zzz",  "t" => "'t'",
            "U" => "'U'",  "u" => "SSSSSS",
            "V" => "'V'",  "v" => "SSS",
            "W" => "'W'",  "w" => "'w'",
            "X" => "'X'",  "x" => "'x'",
            "Y" => "yyyy", "y" => "yy",
            "Z" => "'Z'",  "z" => "D"
        ));
    }

    /**
     * Function: timezones
     * Returns an array of timezone identifiers.
     */
    function timezones(): array {
        $timezones = array();
        $zone_list = timezone_identifiers_list(DateTimeZone::ALL);

        foreach ($zone_list as $zone) {
            $name = str_replace(
                array("_", "St "),
                array(" ", "St. "),
                $zone
            );

            $timezones[] = array(
                "code" => $zone,
                "name" => $name
            );
        }

        return $timezones;
    }

    /**
     * Function: set_timezone
     * Sets the timezone for all date/time functions.
     *
     * Parameters:
     *     $timezone - The timezone to set.
     */
    function set_timezone($timezone = "Atlantic/Reykjavik"): bool {
        $result = date_default_timezone_set($timezone);

        if (DEBUG)
            error_log("TIMEZONE ".get_timezone());

        return $result;
    }

    /**
     * Function: get_timezone
     * Gets the timezone for all date/time functions.
     */
    function get_timezone(): string {
        return date_default_timezone_get();
    }

    #---------------------------------------------
    # Variable Manipulation
    #---------------------------------------------

    /**
     * Function: fallback
     * Sets the supplied variable if it is not already set.
     *
     * Parameters:
     *     &$variable - The variable to set and return.
     *
     * Returns:
     *     The value that was assigned to the variable.
     *
     * Notes:
     *     Additional arguments supplied to this function will be considered as
     *     candidate values. The variable will be set to the value of the first
     *     non-empty argument, or the last, or null if no arguments are supplied.
     */
    function fallback(&$variable): mixed {
        if (is_bool($variable))
            return $variable;

        $unset = (
            !isset($variable) or
            $variable === array() or
            (is_string($variable) and trim($variable) === "")
        );

        if (!$unset)
            return $variable;

        $fallback = null;
        $args = func_get_args();
        array_shift($args);

        foreach ($args as $arg) {
            $fallback = $arg;

            $nonempty = (
                isset($arg) and $arg !== array() and
                (
                    !is_string($arg) or
                    (is_string($arg) and trim($arg) !== "")
                )
            );

            if ($nonempty)
                break;
        }

        return $variable = $fallback;
    }

    /**
     * Function: oneof
     * Inspects the supplied arguments and returns the first substantial value.
     *
     * Returns:
     *     The first substantial value in the set, or the last, or null.
     *
     * Notes:
     *     Some type combinations will halt inspection of the full set:
     *     - All types are comparable with null.
     *     - All scalar types are comparable.
     *     - Arrays, objects, and resources are incomparable with other types.
     */
    function oneof(): mixed {
        $last = null;
        $args = func_get_args();

        foreach ($args as $index => $arg) {
            $unset = (
                !isset($arg) or
                $arg === array() or
                (is_string($arg) and trim($arg) === "") or
                (is_object($arg) and empty($arg)) or
                is_datetime_zero($arg)
            );

            if (!$unset)
                return $arg;

            $last = $arg;

            if ($index + 1 == count($args))
                break;

            $next = $args[$index + 1];

            # Using simple type comparison wouldn't work too well here, e.g:
            # oneof("", 1) should return 1 regardless of the type difference.
            $incomparable = (
                (is_array($arg) and !is_array($next)) or
                (!is_array($arg) and is_array($next)) or
                (is_object($arg) and !is_object($next)) or
                (!is_object($arg) and is_object($next)) or
                (is_resource($arg) and !is_resource($next)) or
                (!is_resource($arg) and is_resource($next))
            );

            # A null value invalidates the incomparability test.
            if (isset($arg) and isset($next) and $incomparable)
                return $arg;
        }

        return $last;
    }

    /**
     * Function: derezz
     * Strips tags and junk from the supplied string and tests it for emptiness.
     *
     * Parameters:
     *     &$string - The string, supplied by reference.
     *
     * Returns:
     *     Whether or not the stripped string is empty.
     *
     * Notes:
     *     Useful for data that will be stripped later on by its model
     *     but which needs to be tested for uniqueness/emptiness first.
     * 
     * See Also:
     *     <Group::add> <User::add>
     */
    function derezz(&$string): bool {
        $string = str_replace("\x00..\x1f", "", strip_tags($string));
        return ($string == "");
    }

    /**
     * Function: token
     * Salt and hash a unique token using the supplied data.
     *
     * Parameters:
     *     $items - An array of items to hash.
     *
     * Returns:
     *     A unique token salted with the site's secure hashkey.
     */
    function token($items): string {
        return sha1(
            implode((array) $items).
            Config::current()->secure_hashkey
        );
    }

    /**
     * Function: crc24
     * Performs a 24-bit cyclic redundancy check.
     *
     * Parameters:
     *     $str - The data to check.
     *     $polynomial - The polynomial to use.
     *     $ini - The initial remainder value.
     *     $xor - The value for the final XOR.
     *
     * Returns:
     *     The integer value of the check result.
     */
    function crc24($str, $polynomial = 0x864cfb, $ini = 0xb704ce, $xor = 0): int {
        $crc = $ini;

        for ($i = 0; $i < strlen($str); $i++) {
            $c = ord($str[$i]);
            $crc ^= $c << 16;

            for ($j = 0; $j < 8; $j++) {
                $crc = (($crc << 1) & 0xffffffff);

                if ($crc & 0x1000000)
                    $crc ^= $polynomial;
            }
        }

        return ($crc ^ $xor) & 0xffffff;
    }

    /**
     * Function: slug
     * Generates a random slug value for posts and pages.
     *
     * Parameters:
     *     $length - The number of characters to generate.
     *
     * Returns:
     *     A string of the requested length.
     */
    function slug($length): string {
        return strtolower(random($length));
    }

    /**
     * Function: random
     * Generates a string of alphanumeric random characters.
     *
     * Parameters:
     *     $length - The number of characters to generate.
     *
     * Returns:
     *     A string of the requested length.
     *
     * Notes:
     *     Uses a cryptographically secure pseudo-random method.
     */
    function random($length): string {
        $input = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        $range = strlen($input) - 1;
        $chars = "";

        for ($i = 0; $i < $length; $i++)
            $chars.= $input[random_int(0, $range)];

        return $chars;
    }

    /**
     * Function: shorthand_bytes
     * Decode shorthand bytes notation from php.ini.
     *
     * Parameters:
     *     $value - The value returned by ini_get().
     *
     * Returns:
     *     A byte value or the input if decoding failed.
     */
    function shorthand_bytes($value): mixed {
        switch (substr($value, -1)) {
            case "K": case "k":
                return (int) $value * 1024;
            case "M": case "m":
                return (int) $value * 1048576;
            case "G": case "g":
                return (int) $value * 1073741824;
            default:
                return $value;
        }
    }

    /**
     * Function: set_max_time
     * Sets the PHP time limit to MAX_TIME_LIMIT.
     */
    function set_max_time(): void {
        $const = MAX_TIME_LIMIT;
        $limit = ini_get("max_execution_time");

        if ($limit === 0)
            return;

        if ($limit < $const)
            set_time_limit(MAX_TIME_LIMIT);
    }

    /**
     * Function: set_max_memory
     * Sets the PHP memory limit to MAX_MEMORY_LIMIT.
     */
    function set_max_memory(): void {
        $const = shorthand_bytes(MAX_MEMORY_LIMIT);
        $limit = shorthand_bytes(ini_get("memory_limit"));

        if ($limit < $const)
            ini_set("memory_limit", MAX_MEMORY_LIMIT);
    }

    /**
     * Function: timer_start
     * Starts the internal timer and returns the microtime.
     */
    function timer_start(): float {
        static $timer;

        if (!isset($timer))
            $timer = microtime(true);

        return $timer;
    }

    /**
     * Function: timer_stop
     * Returns the elapsed time since the timer started.
     *
     * Parameters:
     *     $precision - Round to n decimal places.
     *
     * Returns:
     *     A formatted number with the requested $precision.
     */
    function timer_stop($precision = 3): string {
        $elapsed = microtime(true) - timer_start();
        return number_format($elapsed, $precision, ".", "");
    }

    /**
     * Function: match_any
     * Try to match a string against an array of regular expressions.
     *
     * Parameters:
     *     $try - An array of regular expressions, or a single regular expression.
     *     $haystack - The string to test.
     *
     * Returns:
     *     Whether or not the match succeeded.
     */
    function match_any($try, $haystack): bool {
        foreach ((array) $try as $needle) {
            if (preg_match($needle, $haystack))
                return true;
        }

        return false;
    }

    /**
     * Function: autoload
     * Autoload PSR-0 classes on demand by scanning lib directories.
     *
     * Parameters:
     *     $class - The name of the class to load.
     */
    function autoload($class): void {
        $filepath = str_replace(
            array("_", "\\", "\0"),
            array(DIR, DIR, ""),
            ltrim($class, "\\")
        ).".php";

        $libpath = INCLUDES_DIR.
                   DIR."lib".
                   DIR.$filepath;

        if (is_file($libpath)) {
            require $libpath;
            return;
        }

        if (INSTALLING or UPGRADING)
            return;

        $config = Config::current();

        foreach ($config->enabled_modules as $module) {
            $modpath = MODULES_DIR.
                       DIR.$module.
                       DIR."lib".
                       DIR.$filepath;

            if (is_file($modpath)) {
                require $modpath;
                return;
            }
        }
    }

    /**
     * Function: keywords
     * Parse keyword searches for values in specific database columns.
     *
     * Parameters:
     *     $query - The query to parse.
     *     $plain - WHERE syntax to search for non-keyword queries.
     *     $table - Check this table to ensure the keywords are valid.
     *
     * Returns:
     *     An array containing an array of "WHERE" conditions, an array
     *     of "WHERE" parameters, and "ORDER BY" clause for the results.
     *     Non-keyword text will be parameterized as array[1][":query"].
     */
    function keywords($query, $plain, $table = null): array {
        $trimmed = trim($query);

        if (empty($trimmed))
            return array(array(), array(), null);

        $sql = SQL::current();
        $trigger = Trigger::current();

        # Add ESCAPE clause to LIKE operators without one.
        $plain = preg_replace(
            "/( LIKE :query(?! ESCAPE))($| )/",
            "$1 ESCAPE '|'$2",
            $plain
        );

        # PostgreSQL: use ILIKE operator for case-insensitivity.
        if ($sql->adapter == "pgsql")
            $plain = str_replace(" LIKE ", " ILIKE ", $plain);

        $strings  = array(); # Non-keyword values found in the query.
        $keywords = array(); # Keywords (attr:val;) found in the query.
        $where    = array(); # Parameters validated and added to WHERE.
        $filters  = array(); # Table column filters to be validated.
        $params   = array(); # Parameters for the non-keyword filter.
        $ordering = array(); # Requested ordering for the query results.

        $columns  = !empty($table) ?
            $sql->select($table)->fetch() :
            array() ;

        foreach (
            preg_split("/\s(?=\w+:)|;/",
                $query,
                -1,
                PREG_SPLIT_NO_EMPTY
            )
        as $fragment) {
            if (!substr_count($fragment, ":"))
                $strings[] = trim($fragment);
            else
                $keywords[] = trim($fragment);
        }

        $dates = array(
            "year",
            "month",
            "day",
            "hour",
            "minute",
            "second"
        );

        $created_at = array(
            "year"   => "____",
            "month"  => "__",
            "day"    => "__",
            "hour"   => "__",
            "minute" => "__",
            "second" => "__"
        );

        $joined_at = array(
            "year"   => "____",
            "month"  => "__",
            "day"    => "__",
            "hour"   => "__",
            "minute" => "__",
            "second" => "__"
        );

        # Contextual conversions of some keywords.
        foreach ($keywords as $keyword) {
            list($attr, $val) = explode(":", $keyword);

            if ($attr == "password") {
                # Prevent searches for hashed passwords.
                $strings[] = $attr;
            } elseif (
                $attr == "author" and
                isset($columns["user_id"])
            ) {
                # Filter by "author" (login).
                $user = new User(array("login" => $val));

                $where["user_id"] = ($user->no_results) ?
                    0 :
                    $user->id ;
            } elseif (
                $attr == "group" and
                isset($columns["group_id"])
            ) {
                # Filter by group name.
                $group = new Group(array("name" => $val));

                $where["group_id"] = ($group->no_results) ?
                    0 :
                    $group->id ;
            } elseif (
                in_array($attr, $dates) and
                isset($columns["created_at"])
            ) {
                # Filter by date/time of creation.
                $created_at[$attr] = $val;
                $where["created_at LIKE"] = (
                    $created_at["year"]."-".
                    $created_at["month"]."-".
                    $created_at["day"]." ".
                    $created_at["hour"].":".
                    $created_at["minute"].":".
                    $created_at["second"]."%"
                );
            } elseif (
                in_array($attr, $dates) and
                isset($columns["joined_at"])
            ) {
                # Filter by date/time of joining.
                $joined_at[$attr] = $val;
                $where["joined_at LIKE"] = (
                    $joined_at["year"]."-".
                    $joined_at["month"]."-".
                    $joined_at["day"]." ".
                    $joined_at["hour"].":".
                    $joined_at["minute"].":".
                    $joined_at["second"]."%"
                );
            } elseif (
                $attr == "ASC" and
                !is_numeric($val) and
                isset($columns[$val])
            ) {
                # Ascending order.
                $ordering[] = $val." ASC";
            } elseif (
                $attr == "DESC" and
                !is_numeric($val) and
                isset($columns[$val])
            ) {
                # Descending order.
                $ordering[] = $val." DESC";
            } else {
                # Key => Val expression.
                $filters[$attr] = $val;
            }
        }

        # Check the keywords are valid columns of the table.
        foreach ($filters as $attr => $val) {
            if (isset($columns[$attr])) {
                # Column exists: add Key => Val expression.
                $where[$attr] = $val;
            } else {
                # No such column: add to non-keyword values.
                $strings[] = $attr.":".$val;
            }
        }

        if (!empty($strings)) {
            $where[] = $plain;
            $params[":query"] = "%".implode(" ", $strings)."%";
        }

        $order = empty($ordering) ?
            null :
            implode(", ", $ordering) ;

        $search = array($where, $params, $order);
        $trigger->filter($search, "keyword_search", $query, $plain);
        return $search;
    }

    #---------------------------------------------
    # String Manipulation
    #---------------------------------------------

    /**
     * Function: pluralize
     * Pluralizes a word.
     *
     * Parameters:
     *     $string - The lowercase string to pluralize.
     *     $number - A number to determine pluralization.
     *
     * Returns:
     *     The supplied word with a trailing "s" added,
     *     or the correct non-normative pluralization.
     */
    function pluralize($string, $number = null): string {
        $uncountable = array(
            "audio", "equipment", "fish", "information", "money",
            "moose", "news", "rice", "series", "sheep", "species"
        );

        if ($number == 1)
            return $string;

        if (in_array($string, $uncountable))
            return $string;

        $replacements = array(
            "/person/i"                    => "people",
            "/^(wom|m)an$/i"               => "\\1en",
            "/child/i"                     => "children",
            "/cow/i"                       => "kine",
            "/goose/i"                     => "geese",
            "/datum$/i"                    => "data",
            "/(penis)$/i"                  => "\\1es",
            "/(ax|test)is$/i"              => "\\1es",
            "/(octop|vir)us$/i"            => "\\1ii",
            "/(cact)us$/i"                 => "\\1i",
            "/(alias|status)$/i"           => "\\1es",
            "/(bu)s$/i"                    => "\\1ses",
            "/(buffal|tomat)o$/i"          => "\\1oes",
            "/([ti])um$/i"                 => "\\1a",
            "/sis$/i"                      => "ses",
            "/(hive)$/i"                   => "\\1s",
            "/([^aeiouy]|qu)y$/i"          => "\\1ies",
            "/^(ox)$/i"                    => "\\1en",
            "/(matr|vert|ind)(?:ix|ex)$/i" => "\\1ices",
            "/(x|ch|ss|sh)$/i"             => "\\1es",
            "/([m|l])ouse$/i"              => "\\1ice",
            "/(quiz)$/i"                   => "\\1zes"
        );

        $replaced = preg_replace(
            array_keys($replacements),
            array_values($replacements),
            $string,
            1
        );

        if ($replaced == $string)
            $replaced = $string."s";

        return $replaced;
    }

    /**
     * Function: depluralize
     * Singularizes a word.
     *
     * Parameters:
     *     $string - The lowercase string to depluralize.
     *     $number - A number to determine depluralization.
     *
     * Returns:
     *     The supplied word with trailing "s" removed,
     *     or the correct non-normative singularization.
     */
    function depluralize($string, $number = null): string {
        $uncountable = array("news", "series", "species");

        if (isset($number) and $number != 1)
            return $string;

        if (in_array($string, $uncountable))
            return $string;

        $replacements = array(
            "/people/i"               => "person",
            "/^(wom|m)en$/i"          => "\\1an",
            "/children/i"             => "child",
            "/kine/i"                 => "cow",
            "/geese/i"                => "goose",
            "/data$/i"                => "datum",
            "/(penis)es$/i"           => "\\1",
            "/(ax|test)es$/i"         => "\\1is",
            "/(octopi|viri|cact)i$/i" => "\\1us",
            "/(alias|status)es$/i"    => "\\1",
            "/(bu)ses$/i"             => "\\1s",
            "/(buffal|tomat)oes$/i"   => "\\1o",
            "/([ti])a$/i"             => "\\1um",
            "/ses$/i"                 => "sis",
            "/(hive)s$/i"             => "\\1",
            "/([^aeiouy]|qu)ies$/i"   => "\\1y",
            "/^(ox)en$/i"             => "\\1",
            "/(vert|ind)ices$/i"      => "\\1ex",
            "/(matr)ices$/i"          => "\\1ix",
            "/(x|ch|ss|sh)es$/i"      => "\\1",
            "/([ml])ice$/i"           => "\\1ouse",
            "/(quiz)zes$/i"           => "\\1"
        );

        $replaced = preg_replace(
            array_keys($replacements),
            array_values($replacements),
            $string,
            1
        );

        if ($replaced == $string and substr($string, -1) == "s")
            $replaced = substr($string, 0, -1);

        return $replaced;
    }

    /**
     * Function: normalize
     * Attempts to normalize newlines and whitespace into single spaces.
     *
     * Returns:
     *     The normalized string.
     */
    function normalize($string): string {
        return trim(preg_replace("/[\s\n\r\t]+/", " ", $string));
    }

    /**
     * Function: camelize
     * Converts a string to camel-case.
     *
     * Parameters:
     *     $string - The string to camelize.
     *     $keep_spaces - Convert underscores to spaces?
     *
     * Returns:
     *     A CamelCased string.
     *
     * See Also:
     *     <decamelize>
     */
    function camelize($string, $keep_spaces = false): string {
        $lowercase = strtolower($string);
        $deunderscore = str_replace("_", " ", $lowercase);
        $dehyphen = str_replace("-", " ", $deunderscore);
        $camelized = ucwords($dehyphen);

        if (!$keep_spaces)
            $camelized = str_replace(" ", "", $camelized);

        return $camelized;
    }

    /**
     * Function: decamelize
     * Undoes camel-case conversion.
     *
     * Parameters:
     *     $string - The string to decamelize.
     *
     * Returns:
     *     A de_camel_cased string.
     *
     * See Also:
     *     <camelize>
     */
    function decamelize($string): string {
        return strtolower(
            preg_replace("/([a-z])([A-Z])/", "\\1_\\2", $string)
        );
    }

    /**
     * Function: truncate
     * Truncates a string to the requested number of characters or less.
     *
     * Parameters:
     *     $text - The string to be truncated.
     *     $length - Truncate the string to this number of characters.
     *     $ellipsis - A string to place at the truncation point.
     *     $exact - Split words to return the exact length requested?
     *     $encoding - The character encoding of the string and ellipsis.
     *
     * Returns:
     *     A truncated string with ellipsis appended.
     */
    function truncate(
        $text,
        $length = 100,
        $ellipsis = null,
        $exact = false,
        $encoding = "UTF-8"
    ): string {
        if (mb_strlen($text, $encoding) <= $length)
            return $text;

        if (!isset($ellipsis))
            $ellipsis = mb_chr(0x2026, $encoding);

        $breakpoint = $length - mb_strlen($ellipsis, $encoding);
        $truncation = mb_substr($text, 0, $breakpoint, $encoding);
        $remainder  = mb_substr($text, $breakpoint, null, $encoding);

        if (!$exact and !preg_match("/^\s/", $remainder))
            $truncation = preg_replace(
                "/(.+)\s.*/s",
                "$1",
                $truncation
            );

        return $truncation.$ellipsis;
    }

    /**
     * Function: markdown
     * Implements the Markdown content parsing filter.
     *
     * Parameters:
     *     $text - The body of the post/page to parse.
     *     $context - Model instance for context (optional).
     *
     * Returns:
     *     The text with Markdown formatting applied.
     *
     * See Also:
     *     https://github.com/commonmark/CommonMark
     *     https://github.github.com/gfm/
     *     https://chyrplite.net/wiki/Chyrp-Flavoured-Markdown.html
     */
    function markdown($text, $context = null): string {
        static $parser;

        if (!isset($parser)) {
            $parser = new \xenocrat\markdown\ChyrpMarkdown();
            $parser->convertTabsToSpaces = false;
            $parser->html5 = true;
            $parser->keepListStartNumber = true;
            $parser->keepReversedList = true;
            $parser->headlineAnchors = true;
            $parser->enableNewlines = false;
            $parser->renderCheckboxInputs = false;
            $parser->disallowedRawHTML = false;
        }

        if ($context instanceof Model) {
            $name = strtolower(get_class($context));
            $parser->setContextId($name."-".$context->id);
        } else {
            $parser->setContextId("");
        }

        return $parser->parse($text);
    }

    /**
     * Function: emote
     * Converts emoticons to Unicode emoji HTML entities.
     *
     * Parameters:
     *     $text - The body of the post/page to parse.
     *
     * Returns:
     *     The text with emoticons replaced by emoji.
     *
     * See Also:
     *     http://www.unicode.org/charts/PDF/U1F600.pdf
     */
    function emote($text): string {
        $emoji = array(
            "o:-)"    => "&#x1f607;",
            "&gt;:-)" => "&#x1f608;",
            ">:-)"    => "&#x1f608;",
            ":-)"     => "&#x1f600;",
            "^_^"     => "&#x1f601;",
            ":-D"     => "&#x1f603;",
            ";-)"     => "&#x1f609;",
            "&lt;3"   => "&#x1f60d;",
            "<3"      => "&#x1f60d;",
            "B-)"     => "&#x1f60e;",
            ":-&gt;"  => "&#x1f60f;",
            ":->"     => "&#x1f60f;",
            ":-||"    => "&#x1f62c;",
            ":-|"     => "&#x1f611;",
            "-_-"     => "&#x1f612;",
            ":-/"     => "&#x1f615;",
            ":-s"     => "&#x1f616;",
            ":-*"     => "&#x1f618;",
            ":-P"     => "&#x1f61b;",
            ":-(("    => "&#x1f629;",
            ":-("     => "&#x1f61f;",
            ";_;"     => "&#x1f622;",
            ":-o"     => "&#x1f62e;",
            "O_O"     => "&#x1f632;",
            ":-$"     => "&#x1f633;",
            "x_x"     => "&#x1f635;",
            ":-x"     => "&#x1f636;"
        );

        foreach ($emoji as $key => $value)
            $text = str_replace(
                $key,
                '<span class="emoji">'.$value.'</span>',
                $text
            );

        return $text;
    }

    /**
     * Function: fix
     * Neutralizes HTML and quotes in strings for display.
     *
     * Parameters:
     *     $string - String to fix.
     *     $quotes - Encode quotes?
     *     $double - Encode encoded?
     *
     * Returns:
     *     A sanitized version of the string.
     */
    function fix($string, $quotes = false, $double = false): string {
        $quotes = ($quotes) ?
            ENT_QUOTES :
            ENT_NOQUOTES ;

        return htmlspecialchars(
            (string) $string,
            $quotes | ENT_HTML5,
            "UTF-8",
            $double
        );
    }

    /**
     * Function: unfix
     * Undoes neutralization of HTML and quotes in strings.
     *
     * Parameters:
     *     $string - String to unfix.
     *     $all - Decode all entities?
     *
     * Returns:
     *     An unsanitary version of the string.
     */
    function unfix($string, $all = false): string {
        return ($all) ?
            html_entity_decode(
                (string) $string,
                ENT_QUOTES | ENT_HTML5,
                "UTF-8"
            )
            :
            htmlspecialchars_decode(
                (string) $string,
                ENT_QUOTES | ENT_HTML5
            )
            ;
    }

    /**
     * Function: sanitize
     * Sanitizes a string of troublesome characters, typically for use in URLs.
     *
     * Parameters:
     *     $string - The string to sanitize - must be ASCII or UTF-8!
     *     $lowercase - Force the string to lowercase?
     *     $strict - Remove all characters except "-" and alphanumerics?
     *     $truncate - Number of characters to truncate to (0 to disable).
     *
     * Returns:
     *     A sanitized version of the string.
     */
    function sanitize(
        $string,
        $lowercase = true,
        $strict = false,
        $truncate = 100
    ): string {
        $strip = array(
            "&amp;", "&#8216;", "&#8217;", "&#8220;", "&#8221;", "&#8211;", "&#8212;", "&",
            "~", "`", "!", "@", "#", "$", "%", "^", "*", "(", ")", "_", "=", "+", "[", "{",
            "]", "}", "\\", "|", ";", ":", "\"", "'", "—", "–", ",", "<", ".", ">", "/", "?"
        );

        $utf8mb = array(
            # Latin-1 Supplement.
            chr(194).chr(170) => "a",  chr(194).chr(186) => "o",  chr(195).chr(128) => "A",
            chr(195).chr(129) => "A",  chr(195).chr(130) => "A",  chr(195).chr(131) => "A",
            chr(195).chr(132) => "A",  chr(195).chr(133) => "A",  chr(195).chr(134) => "AE",
            chr(195).chr(135) => "C",  chr(195).chr(136) => "E",  chr(195).chr(137) => "E",
            chr(195).chr(138) => "E",  chr(195).chr(139) => "E",  chr(195).chr(140) => "I",
            chr(195).chr(141) => "I",  chr(195).chr(142) => "I",  chr(195).chr(143) => "I",
            chr(195).chr(144) => "D",  chr(195).chr(145) => "N",  chr(195).chr(146) => "O",
            chr(195).chr(147) => "O",  chr(195).chr(148) => "O",  chr(195).chr(149) => "O",
            chr(195).chr(150) => "O",  chr(195).chr(153) => "U",  chr(195).chr(154) => "U",
            chr(195).chr(155) => "U",  chr(195).chr(156) => "U",  chr(195).chr(157) => "Y",
            chr(195).chr(158) => "TH", chr(195).chr(159) => "s",  chr(195).chr(160) => "a",
            chr(195).chr(161) => "a",  chr(195).chr(162) => "a",  chr(195).chr(163) => "a",
            chr(195).chr(164) => "a",  chr(195).chr(165) => "a",  chr(195).chr(166) => "ae",
            chr(195).chr(167) => "c",  chr(195).chr(168) => "e",  chr(195).chr(169) => "e",
            chr(195).chr(170) => "e",  chr(195).chr(171) => "e",  chr(195).chr(172) => "i",
            chr(195).chr(173) => "i",  chr(195).chr(174) => "i",  chr(195).chr(175) => "i",
            chr(195).chr(176) => "d",  chr(195).chr(177) => "n",  chr(195).chr(178) => "o",
            chr(195).chr(179) => "o",  chr(195).chr(180) => "o",  chr(195).chr(181) => "o",
            chr(195).chr(182) => "o",  chr(195).chr(184) => "o",  chr(195).chr(185) => "u",
            chr(195).chr(186) => "u",  chr(195).chr(187) => "u",  chr(195).chr(188) => "u",
            chr(195).chr(189) => "y",  chr(195).chr(190) => "th", chr(195).chr(191) => "y",
            chr(195).chr(152) => "O",
            # Latin Extended-A.
            chr(196).chr(128) => "A",  chr(196).chr(129) => "a",  chr(196).chr(130) => "A",
            chr(196).chr(131) => "a",  chr(196).chr(132) => "A",  chr(196).chr(133) => "a",
            chr(196).chr(134) => "C",  chr(196).chr(135) => "c",  chr(196).chr(136) => "C",
            chr(196).chr(137) => "c",  chr(196).chr(138) => "C",  chr(196).chr(139) => "c",
            chr(196).chr(140) => "C",  chr(196).chr(141) => "c",  chr(196).chr(142) => "D",
            chr(196).chr(143) => "d",  chr(196).chr(144) => "D",  chr(196).chr(145) => "d",
            chr(196).chr(146) => "E",  chr(196).chr(147) => "e",  chr(196).chr(148) => "E",
            chr(196).chr(149) => "e",  chr(196).chr(150) => "E",  chr(196).chr(151) => "e",
            chr(196).chr(152) => "E",  chr(196).chr(153) => "e",  chr(196).chr(154) => "E",
            chr(196).chr(155) => "e",  chr(196).chr(156) => "G",  chr(196).chr(157) => "g",
            chr(196).chr(158) => "G",  chr(196).chr(159) => "g",  chr(196).chr(160) => "G",
            chr(196).chr(161) => "g",  chr(196).chr(162) => "G",  chr(196).chr(163) => "g",
            chr(196).chr(164) => "H",  chr(196).chr(165) => "h",  chr(196).chr(166) => "H",
            chr(196).chr(167) => "h",  chr(196).chr(168) => "I",  chr(196).chr(169) => "i",
            chr(196).chr(170) => "I",  chr(196).chr(171) => "i",  chr(196).chr(172) => "I",
            chr(196).chr(173) => "i",  chr(196).chr(174) => "I",  chr(196).chr(175) => "i",
            chr(196).chr(176) => "I",  chr(196).chr(177) => "i",  chr(196).chr(178) => "IJ",
            chr(196).chr(179) => "ij", chr(196).chr(180) => "J",  chr(196).chr(181) => "j",
            chr(196).chr(182) => "K",  chr(196).chr(183) => "k",  chr(196).chr(184) => "k",
            chr(196).chr(185) => "L",  chr(196).chr(186) => "l",  chr(196).chr(187) => "L",
            chr(196).chr(188) => "l",  chr(196).chr(189) => "L",  chr(196).chr(190) => "l",
            chr(196).chr(191) => "L",  chr(197).chr(128) => "l",  chr(197).chr(129) => "L",
            chr(197).chr(130) => "l",  chr(197).chr(131) => "N",  chr(197).chr(132) => "n",
            chr(197).chr(133) => "N",  chr(197).chr(134) => "n",  chr(197).chr(135) => "N",
            chr(197).chr(136) => "n",  chr(197).chr(137) => "N",  chr(197).chr(138) => "n",
            chr(197).chr(139) => "N",  chr(197).chr(140) => "O",  chr(197).chr(141) => "o",
            chr(197).chr(142) => "O",  chr(197).chr(143) => "o",  chr(197).chr(144) => "O",
            chr(197).chr(145) => "o",  chr(197).chr(146) => "OE", chr(197).chr(147) => "oe",
            chr(197).chr(148) => "R",  chr(197).chr(149) => "r",  chr(197).chr(150) => "R",
            chr(197).chr(151) => "r",  chr(197).chr(152) => "R",  chr(197).chr(153) => "r",
            chr(197).chr(154) => "S",  chr(197).chr(155) => "s",  chr(197).chr(156) => "S",
            chr(197).chr(157) => "s",  chr(197).chr(158) => "S",  chr(197).chr(159) => "s",
            chr(197).chr(160) => "S",  chr(197).chr(161) => "s",  chr(197).chr(162) => "T",
            chr(197).chr(163) => "t",  chr(197).chr(164) => "T",  chr(197).chr(165) => "t",
            chr(197).chr(166) => "T",  chr(197).chr(167) => "t",  chr(197).chr(168) => "U",
            chr(197).chr(169) => "u",  chr(197).chr(170) => "U",  chr(197).chr(171) => "u",
            chr(197).chr(172) => "U",  chr(197).chr(173) => "u",  chr(197).chr(174) => "U",
            chr(197).chr(175) => "u",  chr(197).chr(176) => "U",  chr(197).chr(177) => "u",
            chr(197).chr(178) => "U",  chr(197).chr(179) => "u",  chr(197).chr(180) => "W",
            chr(197).chr(181) => "w",  chr(197).chr(182) => "Y",  chr(197).chr(183) => "y",
            chr(197).chr(184) => "Y",  chr(197).chr(185) => "Z",  chr(197).chr(186) => "z",
            chr(197).chr(187) => "Z",  chr(197).chr(188) => "z",  chr(197).chr(189) => "Z",
            chr(197).chr(190) => "z",  chr(197).chr(191) => "s"
            # Generate additional substitution keys:
            # E.g. echo implode(",", unpack("C*", "€"));
        );

        # Strip tags, remove punctuation and HTML entities.
        $clean = str_replace(
            $strip,
            "",
            strip_tags($string)
        );

        # Trim.
        $clean = trim($clean);

        # Replace spaces with hyphen-minus.
        $clean = preg_replace("/\s+/", "-", $clean);

        if ($strict) {
            # Substitute UTF-8 multi-byte encodings.
            if (preg_match("/[\x80-\xff]/", $clean))
                $clean = strtr($clean, $utf8mb);

            # Remove non-ASCII characters that remain.
            $clean = preg_replace("/[^a-zA-Z0-9\\-]/", "", $clean);
        }

        if ($lowercase)
            $clean = mb_strtolower($clean, "UTF-8");

        if ($truncate)
            $clean = mb_substr($clean, 0, $truncate, "UTF-8");

        return $clean;
    }

    /**
     * Function: sanitize_html
     * Sanitizes HTML to disable scripts and obnoxious attributes.
     *
     * Parameters:
     *     $string - String containing HTML to sanitize.
     *
     * Returns:
     *     A version of the string containing only valid tags
     *     and whitelisted attributes essential to tag function.
     */
    function sanitize_html($text): string {
        # Strip invalid tags.
        $text = preg_replace(
            "/<([^a-z\/!]|\/(?![a-z])|!(?!--))[^>]*>/i",
            " ",
            $text
        );

        # Strip style tags.
        $text = preg_replace(
            "/<\/?style[^>]*>/i",
            " ",
            $text
        );

        # Strip script tags.
        $text = preg_replace(
            "/<\/?script[^>]*>/i",
            " ",
            $text
        );

        # Strip attributes from each tag, unless essential to its function.
        return preg_replace_callback(
            "/<([a-z][a-z0-9]*)[^>]*?( ?\/)?>/i",
            function ($element) {
                fallback($element[2], "");

                $name = strtolower($element[1]);
                $whitelist = "";

                preg_match_all(
                    "/ ([a-z]+)=(\"[^\"]+\"|\'[^\']+\')/i",
                    $element[0],
                    $attributes,
                    PREG_SET_ORDER
                );

                foreach ($attributes as $attribute) {
                    $label = strtolower($attribute[1]);
                    $content = trim($attribute[2], "\"'");

                    switch ($label) {
                        case "src":
                            $array = array(
                                "audio",
                                "iframe",
                                "img",
                                "source",
                                "track",
                                "video"
                            );

                            if (in_array($name, $array) and is_url($content))
                                $whitelist.= $attribute[0];

                            break;

                        case "href":
                            $array = array(
                                "a",
                                "area"
                            );

                            if (in_array($name, $array) and is_url($content))
                                $whitelist.= $attribute[0];

                            break;

                        case "alt":
                            $array = array(
                                "area",
                                "img"
                            );

                            if (in_array($name, $array))
                                $whitelist.= $attribute[0];

                            break;

                        case "dir":
                        case "lang":
                            $whitelist.= $attribute[0];
                            break;
                    }
                }

                return "<".$element[1].$whitelist.$element[2].">";
            },
            $text
        );
    }

    #---------------------------------------------
    # Remote Fetches
    #---------------------------------------------

    /**
     * Function: get_remote
     * Retrieve the contents of a URL.
     *
     * Parameters:
     *     $url - The URL of the resource to be retrieved.
     *     $redirects - The maximum number of redirects to follow.
     *     $timeout - The maximum number of seconds to wait.
     *     $headers - Include response headers with the content?
     *     $post - Set the request type to POST instead of GET?
     *     $data - An array or urlencoded string of POST data.
     *
     * Returns:
     *     The response content, or false on failure.
     */
    function get_remote(
        $url,
        $redirects = 0,
        $timeout = 10,
        $headers = false,
        $post = false,
        $data = null
    ): string|false {
        $config = Config::current();
        $url = add_scheme($url);
        $host = parse_url($url, PHP_URL_HOST);

        if ($host === false)
            return false;

        if (is_unsafe_ip($host) and !GET_REMOTE_UNSAFE)
            return false;

        if (!function_exists("curl_version"))
            return false;

        $cver = curl_version();
        $curl = @curl_init($url);

        if ($curl === false)
            return false;

        $opts = array(
            CURLOPT_CAINFO => INCLUDES_DIR.DIR."cacert.pem",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_VERBOSE => false,
            CURLOPT_FAILONERROR => false,
            CURLOPT_HEADER => (bool) $headers,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => (int) $redirects,
            CURLOPT_TIMEOUT => (int) $timeout,
            CURLOPT_USERAGENT => CHYRP_IDENTITY,
            CURLOPT_HTTPHEADER => array(
                "From: ".$config->email,
                "Referer: ".$config->url
            )
        );

        if (
            defined('CURLSSLOPT_NATIVE_CA') and
            version_compare($cver["version"], "7.71", ">=")
        ) {
            $opts[CURLOPT_SSL_OPTIONS] = CURLSSLOPT_NATIVE_CA;
        }

        if ($post) {
            $opts[CURLOPT_POST] = true;
            $opts[CURLOPT_POSTFIELDS] = $data;
        }

        if (!@curl_setopt_array($curl, $opts))
            return false;

        $response = @curl_exec($curl);
        $errornum = curl_errno($curl);
        $errormsg = curl_error($curl);
        $type = $post ? "POST" : "GET" ;
        $result = oneof($errormsg, "OK");
        curl_close($curl);

        if (DEBUG)
            error_log($type." ".$url." (".$result.")");

        return $errornum ? false : $response ;
    }

    /**
     * Function: webmention_send
     * Sends Webmentions to the URLs discovered in a string.
     *
     * Parameters:
     *     $string - The string to crawl for Webmention URLs.
     *     $post - The post this string belongs to.
     *     $limit - Execution time limit in seconds (optional).
     */
    function webmention_send($string, $post, $limit = 30): void {
        foreach (grab_urls($string) as $url) {
            # Have we exceeded the time limit?
            if (timer_stop() > $limit)
                break;

            $endpoint = webmention_discover(unfix($url, true));

            if ($endpoint === false)
                continue;

            if (DEBUG)
                error_log("WEBMENTION @ ".$endpoint." (".$url.")");

            $wm_array = array(
                "source" => unfix($post->url()),
                "target" => $url
            );

            $wm_query = http_build_query($wm_array);

            get_remote(
                url:$endpoint,
                timeout:3,
                post:true,
                data:$wm_query
            );
        }
    }

    /**
     * Function: webmention_receive
     * Receives and validates Webmentions.
     *
     * Parameters:
     *     $source - The sender's URL.
     *     $target - The URL of our post.
     */
    function webmention_receive($source, $target): void {
        $trigger = Trigger::current();

        # No need to continue without a responder for the Webmention trigger.
        if (!$trigger->exists("webmention"))
            error(
                __("Error"),
                __("Webmention support is disabled for this site."),
                code:503
            );

        if (!is_url($source))
            error(
                __("Error"),
                __("The URL for your page is not valid."),
                code:400
            );

        if (!is_url($target))
            error(
                __("Error"),
                __("The URL for our page is not valid."),
                code:400
            );

        if (DEBUG)
            error_log(
                "WEBMENTION received; source:".$source." target:".$target
            );

        $source_url = add_scheme(unfix($source, true));
        $target_url = add_scheme(unfix($target, true));

        if ($target == $source)
            error(
                __("Error"),
                __("The source and target URLs cannot be the same."),
                code:400
            );

        $post = Post::from_url($target_url);

        if ($post->no_results)
            error(
                __("Error"),
                __("We have not published at that URL."),
                code:404
            );

        # Retrieve the page that linked here.
        $content = get_remote(
            url:$source_url,
            redirects:0,
            timeout:10
        );

        if (empty($content))
            error(
                __("Error"),
                __("You have not published at that URL."),
                code:404
            );

        if (strpos($content, $target) === false)
            error(
                __("Error"),
                __("Your page does not link to our page."),
                code:400
            );

        $trigger->call("webmention", $post, $source, $target);
    }

    /**
     * Function: webmention_discover
     * Determines if a URL is capable of receiving Webmentions.
     *
     * Parameters:
     *     $url - The URL to check.
     *     $redirects - The maximum number of redirects to follow.
     *
     * Returns:
     *     The Webmention endpoint URL, or false on failure.
     */
    function webmention_discover($url, $redirects = 3): string|false {
        $response = get_remote(
            url:$url,
            redirects:$redirects,
            timeout:3,
            headers:true
        );

        if ($response === false)
            return false;

        $parts = explode("\r\n\r\n", $response, 2);

        if (count($parts) < 2)
            return false;

        $headers = $parts[0];
        $content = $parts[1];

        if (preg_match("/^Link: *<(.+)> *; *rel=\"webmention\"/im", $headers, $match)) {
            $endpoint = trim($match[1]);

            # Absolute URL?
            if (is_url($endpoint))
                return $endpoint;

            # Relative URL?
            return merge_urls($url, $endpoint);
        }

        # Check if the content is UTF-8 encoded text/html before continuing.
        if (!preg_match("/^Content-Type: *text\/html *; *charset=UTF-8/im", $headers))
            return false;

        # Check for <link> element containing the endpoint.
        if (preg_match_all("/<link [^>]+>/i", $content, $links, PREG_PATTERN_ORDER)) {
            foreach ($links[0] as $link) {
                if (!preg_match("/ rel=(\"webmention\"|\'webmention\')/i", $link))
                    continue;

                if (preg_match("/ href=(\"[^\"]+\"|\'[^\']+\')/i", $link, $href)) {
                    $endpoint = unfix(trim($href[1], "\"'"));

                    # Absolute URL?
                    if (is_url($endpoint))
                        return $endpoint;

                    # Relative URL?
                    return merge_urls($url, $endpoint);
                }  
            }
        }

        # Check for <a> element containing the endpoint.
        if (preg_match_all("/<a [^>]+>/i", $content, $anchors, PREG_PATTERN_ORDER)) {
            foreach ($anchors[0] as $anchor) {
                if (!preg_match("/ rel=(\"webmention\"|\'webmention\')/i", $anchor))
                    continue;

                if (preg_match("/ href=(\"[^\"]+\"|\'[^\']+\')/i", $anchor, $href)) {
                    $endpoint = unfix(trim($href[1], "\"'"));

                    # Absolute URL?
                    if (is_url($endpoint))
                        return $endpoint;

                    # Relative URL?
                    return merge_urls($url, $endpoint);
                }  
            }
        }

        return false;
    }

    /**
     * Function: grab_urls
     * Crawls a string and grabs hyperlinks from it.
     *
     * Parameters:
     *     $string - The string to crawl.
     *
     * Returns:
     *     An array of all URLs found in the string.
     */
    function grab_urls($string): array {
        $urls = array();
        $regx = "/<a(?= )[^>]* href=(\"[^\"]+\"|\'[^\']+\')[^>]*>.+?<\/a>/i";

        if (preg_match_all($regx, $string, $matches, PREG_PATTERN_ORDER))
            $urls = $matches[1];

        foreach ($urls as &$url)
            $url = trim($url, " \"'");

        return array_filter(array_unique($urls), "is_url");
    }

    /**
     * Function: merge_urls
     * Combines a base URL and relative path into a target URL.
     *
     * Parameters:
     *     $base - The base URL.
     *     $rel - The relative path.
     *
     * Returns:
     *     A merged target URL, or false on failure.
     * 
     * Notes:
     *     Does not attempt to resolve dot segments in the path.
     */
    function merge_urls($base, $rel) {
        extract(parse_url(add_scheme($base)), EXTR_SKIP);
        fallback($path, "/");
        fallback($scheme, "http");

        if (!isset($host))
            return false;

        if ($rel == "")
            return add_scheme($base);

        $end = strrpos($path, "/");
        $len = strlen($path);

        # Reduce the base path by one segment if the path doesn't end with "/".
        if ($end !== ($len - 1))
            $path = substr($path, 0, $end + 1);

        # Append the relative path, or replace the path if rel begins with "/".
        if (str_starts_with($rel, "/"))
            $path = $rel;
        else
            $path.= $rel;

        return $scheme."://".$host.
               (isset($port) ? ":".$port : "").
               $path;
    }

    #---------------------------------------------
    # Extensions
    #---------------------------------------------

    /**
     * Function: load_info
     * Loads an extension's info.php file and returns an array of attributes.
     */
    function load_info($filepath): array {
        if (is_file($filepath) and is_readable($filepath))
            $info = include $filepath;

        if (!isset($info) or gettype($info) != "array")
            $info = array();

        fallback($info["name"],          fix(basename(dirname($filepath))));
        fallback($info["version"],       "");
        fallback($info["url"],           "");
        fallback($info["description"],   "");
        fallback($info["author"],        array("name" => "", "url" => ""));
        fallback($info["confirm"]);
        fallback($info["uploader"],      false);
        fallback($info["conflicts"],     array());
        fallback($info["dependencies"],  array());
        fallback($info["notifications"], array());

        $info["conflicts"]             = (array) $info["conflicts"];
        $info["dependencies"]          = (array) $info["dependencies"];
        $info["notifications"]         = (array) $info["notifications"];

        $uploads_path = MAIN_DIR.Config::current()->uploads_path;

        if ($info["uploader"]) {
            if (!is_dir($uploads_path))
                $info["notifications"][] = __("Please create the uploads directory.");
            elseif (!is_writable($uploads_path))
                $info["notifications"][] = __("Please make the uploads directory writable.");
        }

        return $info;
    }

    /**
     * Function: init_extensions
     * Initialize all Modules and Feathers.
     */
    function init_extensions(): void {
        $config = Config::current();

        # Instantiate all Modules.
        foreach ($config->enabled_modules as $module) {
            $class_name = camelize($module);
            $filepath = MODULES_DIR.DIR.$module.DIR.$module.".php";

            if (!is_file($filepath) or !is_readable($filepath)) {
                cancel_module(
                    $module,
                    _f("%s module is missing.", $class_name)
                );

                continue;
            }

            load_translator($module, MODULES_DIR.DIR.$module.DIR."locale");

            require $filepath;

            if (!is_subclass_of($class_name, "Modules")) {
                cancel_module(
                    $module,
                    _f("%s module is damaged.", $class_name)
                );

                continue;
            }

            Modules::$instances[$module] = new $class_name;
            Modules::$instances[$module]->safename = $module;
        }

        # Instantiate all Feathers.
        foreach ($config->enabled_feathers as $feather) {
            $class_name = camelize($feather);
            $filepath = FEATHERS_DIR.DIR.$feather.DIR.$feather.".php";

            if (!is_file($filepath) or !is_readable($filepath)) {
                cancel_feather(
                    $feather,
                    _f("%s feather is missing.", $class_name)
                );

                continue;
            }

            load_translator($feather, FEATHERS_DIR.DIR.$feather.DIR."locale");

            require $filepath;

            if (!is_subclass_of($class_name, "Feathers")) {
                cancel_feather(
                    $feather,
                    _f("%s feather is damaged.", $class_name)
                );

                continue;
            }

            Feathers::$instances[$feather] = new $class_name;
            Feathers::$instances[$feather]->safename = $feather;
        }

        # Initialize all Modules.
        foreach (Modules::$instances as $module) {
            if (method_exists($module, "__init"))
                $module->__init();
        }

        # Initialize all Feathers.
        foreach (Feathers::$instances as $feather) {
            if (method_exists($feather, "__init"))
                $feather->__init();
        }
    }

    /**
     * Function: module_enabled
     * Determines if a module is currently enabled and not cancelled.
     *
     * Parameters:
     *     $name - The non-camelized name of the module.
     *
     * Returns:
     *     Whether or not the supplied module is enabled.
     */
    function module_enabled($name): bool {
        return (
            !empty(Modules::$instances[$name]) and
            empty(Modules::$instances[$name]->cancelled)
        );
    }

    /**
     * Function: feather_enabled
     * Determines if a feather is currently enabled and not cancelled.
     *
     * Parameters:
     *     $name - The non-camelized name of the feather.
     *
     * Returns:
     *     Whether or not the supplied feather is enabled.
     */
    function feather_enabled($name): bool {
        return (
            !empty(Feathers::$instances[$name]) and
            empty(Feathers::$instances[$name]->cancelled)
        );
    }

    /**
     * Function: cancel_module
     * Temporarily declares a module cancelled (disabled).
     *
     * Parameters:
     *     $target - The non-camelized name of the module.
     *     $reason - Why was execution cancelled?
     *
     * Notes:
     *     A module can cancel itself in its __init() method.
     */
     function cancel_module($target, $reason = ""): void {
        $message = empty($reason) ?
            _f("Execution of %s has been cancelled.", camelize($target)) :
            $reason ;

        if (isset(Modules::$instances[$target]))
            Modules::$instances[$target]->cancelled = true;

        if (DEBUG)
            error_log($message);
    }

    /**
     * Function: cancel_feather
     * Temporarily declares a feather cancelled (disabled).
     *
     * Parameters:
     *     $target - The non-camelized name of the feather.
     *     $reason - Why was execution cancelled?
     *
     * Notes:
     *     A feather can cancel itself in its __init() method.
     */
     function cancel_feather($target, $reason = ""): void {
        $message = empty($reason) ?
            _f("Execution of %s has been cancelled.", camelize($target)) :
            $reason ;

        if (isset(Feathers::$instances[$target]))
            Feathers::$instances[$target]->cancelled = true;

        if (DEBUG)
            error_log($message);
    }

    #---------------------------------------------
    # Upload Management
    #---------------------------------------------

    /**
     * Function: upload
     * Validates and moves an uploaded file to the uploads directory.
     *
     * Parameters:
     *     $file - The POST method upload array, e.g. $_FILES['userfile'].
     *     $filter - An array of valid extensions (case-insensitive).
     *
     * Returns:
     *     The filename of the upload relative to the uploads directory.
     */
    function upload($file, $filter = null): string {
        $uploads_path = MAIN_DIR.Config::current()->uploads_path;
        $filename = upload_filename($file['name'], $filter);

        if ($filename === false)
            error(
                __("Error"),
                __("Uploaded file is of an unsupported type."),
                code:415
            );

        if (!is_uploaded_file($file['tmp_name']))
            show_403(
                __("Access Denied"),
                __("Only uploaded files are accepted.")
            );

        if (!is_dir($uploads_path))
            error(
                __("Error"),
                __("Upload path does not exist.")
            );

        if (!is_writable($uploads_path))
            error(
                __("Error"),
                __("Upload path is not writable.")
            );

        if (!move_uploaded_file($file['tmp_name'], $uploads_path.$filename))
            error(
                __("Error"),
                __("Failed to write file to disk.")
            );

        return $filename;
    }

    /**
     * Function: upload_from_url
     * Copies a file from a remote URL to the uploads directory.
     *
     * Parameters:
     *     $url - The URL of the resource to be copied.
     *     $redirects - The maximum number of redirects to follow.
     *     $timeout - The maximum number of seconds to wait.
     *
     * Returns:
     *     The filename of the copied file, or false on failure.
     */
    function upload_from_url($url, $redirects = 3, $timeout = 10): string|false {
        if (!preg_match("~[^ /\?]+(?=($|\?))~", $url, $match))
            return false;

        $filename = upload_filename($match[0]);

        if ($filename === false)
            return false;

        $contents = get_remote($url, $redirects, $timeout);

        if ($contents === false)
            return false;

        $uploads_path = MAIN_DIR.Config::current()->uploads_path;

        if (!is_dir($uploads_path))
            error(
                __("Error"),
                __("Upload path does not exist.")
            );

        if (!is_writable($uploads_path))
            error(
                __("Error"),
                __("Upload path is not writable.")
            );

        if (!@file_put_contents($uploads_path.$filename, $contents))
            error(
                __("Error"),
                __("Failed to write file to disk.")
            );

        return $filename;
    }

    /**
     * Function: uploaded
     * Generates an absolute URL or filesystem path to an uploaded file.
     *
     * Parameters:
     *     $filename - Filename relative to the uploads directory.
     *     $url - Whether to return a URL or a filesystem path.
     *
     * Returns:
     *     The supplied filename prepended with URL or filesystem path.
     */
    function uploaded($filename, $url = true): string {
        $config = Config::current();

        return ($url) ?
            fix(
                $config->chyrp_url.
                str_replace(DIR, "/", $config->uploads_path).
                urlencode($filename),
                true
            )
            :
            MAIN_DIR.$config->uploads_path.$filename
            ;
    }

    /**
     * Function: uploaded_search
     * Returns an array of files discovered in the uploads directory.
     *
     * Parameters:
     *     $search - A search term.
     *     $filter - An array of valid extensions (case insensitive).
     *     $sort - One of "name", "type", "size", or "modified".
     */
    function uploaded_search(
        $search = "",
        $filter = array(),
        $sort = "name"
    ): array {
        $config = Config::current();
        $results = array();

        if (!empty($filter)) {
            foreach ($filter as &$entry)
                $entry = preg_quote($entry, "/");
        }

        $patterns = !empty($filter) ? implode("|", $filter) : ".+" ;
        $dir = new DirectoryIterator(MAIN_DIR.$config->uploads_path);

        foreach ($dir as $item) {
            if ($item->isFile()) {
                $filename = $item->getFilename();

                if (!preg_match("/.+\.($patterns)$/i", $filename))
                    continue;

                if (stripos($filename, $search) === false)
                    continue;

                $results[] = array(
                    "name" => $filename,
                    "type" => $item->getExtension(),
                    "size" => $item->getSize(),
                    "modified" => $item->getMTime()
                );
            }
        }

        function build_sorter($sort) {
            switch ($sort) {
                case "size":
                case "modified":
                    return function ($a, $b) use ($sort) {
                        if ($a[$sort] == $b[$sort])
                            return 0;

                        return ($a[$sort] < $b[$sort]) ? -1 : 1 ;
                    };
                    break;
                case "name":
                case "type":        
                    return function ($a, $b) use ($sort) {
                        return strnatcmp($a[$sort], $b[$sort]);
                    };
                    break;
                default:
                    return function ($a, $b) {
                        return strnatcmp($a["name"], $b["name"]);
                    };
            }
        }

        usort($results, build_sorter($sort));
        return $results;
    }

    /**
     * Function: upload_tester
     * Tests uploaded file information to determine if the upload was successful.
     *
     * Parameters:
     *     $file - The POST method upload array, e.g. $_FILES['userfile'].
     *
     * Returns:
     *     True for a successful upload or false if no file was uploaded.
     *
     * Notes:
     *     $_POST and $_FILES are empty if post_max_size directive is exceeded.
     */
    function upload_tester($file): bool {
        $success = false;
        $results = array();
        $maximum = Config::current()->uploads_limit;

        # Recurse to test multiple uploads file by file using a one-dimensional array.
        if (is_array($file['name'])) {
            for ($i = 0; $i < count($file['name']); $i++)
                $results[] = upload_tester(
                    array(
                        'name' => $file['name'][$i],
                        'type' => $file['type'][$i],
                        'tmp_name' => $file['tmp_name'][$i],
                        'error' => $file['error'][$i],
                        'size' => $file['size'][$i]
                    )
                );

            return (!in_array(false, $results));
        }

        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                $success = true;
                break;
            case UPLOAD_ERR_NO_FILE:
                $success = false;
                break;
            case UPLOAD_ERR_INI_SIZE:
                error(
                    __("Error"),
                    __("The uploaded file exceeds the <code>upload_max_filesize</code> directive in php.ini."),
                    code:413
                );
            case UPLOAD_ERR_FORM_SIZE:
                error(
                    __("Error"),
                    __("The uploaded file exceeds the <code>MAX_FILE_SIZE</code> directive in the HTML form."),
                    code:413
                );
            case UPLOAD_ERR_PARTIAL:
                error(
                    __("Error"),
                    __("The uploaded file was only partially uploaded."),
                    code:400
                );
            case UPLOAD_ERR_NO_TMP_DIR:
                error(
                    __("Error"),
                    __("Missing a temporary folder.")
                );
            case UPLOAD_ERR_CANT_WRITE:
                error(
                    __("Error"),
                    __("Failed to write file to disk.")
                );
            case UPLOAD_ERR_EXTENSION:
                error(
                    __("Error"),
                    __("File upload was stopped by a PHP extension.")
                );
            default:
                error(
                    __("Error"),
                    _f("File upload failed with error %d.", $file['error'])
                );
        }

        if ($file['size'] > ($maximum * 1000000))
            error(
                __("Error"),
                _f("The uploaded file exceeds the maximum size of %d Megabytes allowed by this site.", $maximum),
                code:413
            );

        return $success;
    }

    /**
     * Function: upload_filename
     * Generates a sanitized unique name for an uploaded file.
     *
     * Parameters:
     *     $filename - The filename to make unique.
     *     $filter - An array of valid extensions (case insensitive).
     *
     * Returns:
     *     A sanitized unique filename, or false on failure.
     */
    function upload_filename($filename, $filter = array()): string|false {
        if (empty($filter))
            $filter = upload_filter_whitelist();

        foreach ($filter as &$entry)
            $entry = preg_quote($entry, "/");

        $patterns = implode("|", $filter);

        # Return false if a valid basename and extension is not extracted.
        if (!preg_match("/(.+)(\.($patterns))$/i", $filename, $matches))
            return false;

        $sanitized = oneof(
            sanitize($matches[1], true, true, 80),
            md5($filename)
        );

        $count = 1;
        $extension = $matches[3];
        $unique = $sanitized.".".$extension;

        while (file_exists(uploaded($unique, false))) {
            $count++;
            $unique = $sanitized."-".$count.".".$extension;
        }

        return $unique;
    }

    /**
     * Function: upload_filter_whitelist
     * Returns an array containing a default list of allowed file extensions.
     */
    function upload_filter_whitelist(): array {
        return array(
            # Binary and text formats:
            "bin",  "exe",  "txt",  "rtf",  "vtt",
            "md",   "pdf",  "epub", "mobi", "kfx",

            # Archive and compression formats:
            "zip",  "tar",  "rar",  "gz",   "bz2",
            "7z",   "dmg",  "cab",  "iso",  "udf",

            # Image formats:
            "jpg",  "jpeg", "png",  "webp", "gif",
            "avif", "tif",  "tiff", "heif", "bmp",

            # Video and audio formats:
            "mpg",  "mpeg", "mp2",  "mp3",  "mp4",
            "m4a",  "m4v",  "ogg",  "oga",  "ogv",
            "mka",  "mkv",  "mov",  "avi",  "wav",
            "webm", "flac", "aif",  "aiff", "3gp",
            "spx",  "ts"
        );
    }

    /**
     * Function: delete_upload
     * Deletes an uploaded file.
     *
     * Parameters:
     *     $filename - Filename relative to the uploads directory.
     *
     * Returns:
     *     Whether or not the file was deleted successfully.
     */
    function delete_upload($filename): bool {
        $filename = str_replace(array(DIR, "/"), "", $filename);

        if ($filename == "")
            return false;

        $filepath = uploaded($filename, false);

        if (file_exists($filepath)) {
            Trigger::current()->call("delete_upload", $filename);
            return @unlink($filepath);
        }

        return false;
    }

    #---------------------------------------------
    # Input Validation and Processing
    #---------------------------------------------

    /**
     * Function: password_strength
     * Award a numeric score for the strength of a password.
     *
     * Parameters:
     *     $password - The password string to score.
     *
     * Returns:
     *     A numeric score for the strength of the password.
     */
    function password_strength($password = ""): int {
        $score = 0;

        if (empty($password))
            return $score;

        # Calculate the frequency of each char in the password.
        $frequency = array_count_values(str_split($password));

        # Award each unique char and punish more than 10 occurrences.
        foreach ($frequency as $occurrences)
            $score += (11 - $occurrences);

        # Award bonus points for different character types.
        $variations = array(
            "digits" => preg_match("/\d/", $password),
            "lower" => preg_match("/[a-z]/", $password),
            "upper" => preg_match("/[A-Z]/", $password),
            "nonWords" => preg_match("/\W/", $password)
        );

        $score += (array_sum($variations) - 1) * 10;

        return intval($score);
    }

    /**
     * Function: is_url
     * Does the string look like a web URL?
     *
     * Parameters:
     *     $string - The string to analyse.
     *
     * Returns:
     *     Whether or not the string matches the criteria.
     *
     * Notes:
     *     Recognises FQDN, IPv4 and IPv6.
     *
     * See Also:
     *     <add_scheme>
     */
    function is_url($string): bool {
        if (
            !is_string($string) and
            !$string instanceof Stringable
        )
            return false;

        return (
            preg_match(
                '~^(https?://)?([a-z0-9]([a-z0-9\-\.]*[a-z0-9])?\.[a-z]{2,63}\.?)(:[0-9]{1,5})?($|/)~i',
                $string
            ) or
            preg_match(
                '~^(https?://)?([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})(:[0-9]{1,5})?($|/)~',
                $string
            ) or
            preg_match(
                '~^(https?://)?(\[[a-f0-9\:]{3,39}\])(:[0-9]{1,5})?($|/)~i',
                $string
            )
        );
    }

    /**
     * Function: add_scheme
     * Prefixes a URL with a scheme if none was detected.
     *
     * Parameters:
     *     $url - The URL to analyse.
     *     $scheme - Force this scheme (optional).
     *
     * Returns:
     *     URL prefixed with a default or supplied scheme.
     *
     * See Also:
     *     <is_url>
     */
    function add_scheme($url, $scheme = null): string {
        preg_match('~^([a-z]+://)?(.+)~i', $url, $match);

        $match[1] = isset($scheme) ?
            $scheme :
            oneof($match[1], "http://") ;

        return $url = $match[1].$match[2];
    }

    /**
     * Function: is_email
     * Does the string look like an email address?
     *
     * Parameters:
     *     $string - The string to analyse.
     *
     * Notes:
     *     Recognises FQDN, IPv4 and IPv6.
     *
     * Returns:
     *     Whether or not the string matches the criteria.
     */
    function is_email($string): bool {
        if (
            !is_string($string) and
            !$string instanceof Stringable
        )
            return false;

        return (
            preg_match(
                '/^[^\\\\ <>@]+@([a-z0-9]([a-z0-9\-\.]*[a-z0-9])?\.[a-z]{2,63}\.?)$/i',
                $string
            ) or
            preg_match(
                '/^[^\\\\ <>@]+@([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})$/',
                $string
            ) or
            preg_match(
                '/^[^\\\\ <>@]+@(\[[a-f0-9\:]{3,39}\])$/i',
                $string
            )
        );
    }

    /**
     * Function: is_unsafe_ip
     * Is the string a private or reserved IP address?
     *
     * Parameters:
     *     $string - The string to analyse.
     *
     * Returns:
     *     Whether or not the string matches the criteria.
     */
    function is_unsafe_ip($string): bool {
        if (
            !is_string($string) and
            !$string instanceof Stringable
        )
            return false;

        if (preg_match('/^\[[a-fA-F0-9\:]{3,39}\]$/', $string))
            $string = substr($string, 1, -1);

        if (!filter_var($string, FILTER_VALIDATE_IP))
            return false;

        return (
            !filter_var(
                $string,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
            )
        );
    }

    /**
     * Function: is_datetime_zero
     * Is the string a SQL datetime "zero" variant?
     *
     * Parameters:
     *     $string - The string to analyse.
     *
     * Returns:
     *     Whether or not the string matches the criteria.
     */
    function is_datetime_zero($string): bool {
        if (
            !is_string($string) and
            !$string instanceof Stringable
        )
            return false;

        foreach (SQL_DATETIME_ZERO_VARIANTS as $variant) {
            if (strcmp($variant, $string) === 0)
                return true;
        }

        return false;
    }

    /**
     * Function: generate_captcha
     * Generates a captcha form element.
     *
     * Returns:
     *     A string containing HTML elements to add to a form.
     */
    function generate_captcha(): string {
        Trigger::current()->call("before_generate_captcha");

        foreach (get_declared_classes() as $class) {
            if (in_array("CaptchaProvider", class_implements($class)))
                return call_user_func($class."::generateCaptcha");
        }

        return "";
    }

    /**
     * Function: check_captcha
     * Checks the response to a captcha.
     *
     * Returns:
     *     Whether or not the captcha was defeated.
     */
    function check_captcha(): bool {
        Trigger::current()->call("before_check_captcha");

        foreach (get_declared_classes() as $class) {
            if (in_array("CaptchaProvider", class_implements($class)))
                return call_user_func($class."::checkCaptcha");
        }

        return true;
    }

    #---------------------------------------------
    # Responding to Requests
    #---------------------------------------------

    /**
     * Function: esce
     * Outputs an escaped echo for JavaScripts.
     *
     * Parameters:
     *     $variable - The variable to echo.
     *
     * Notes:
     *     Strings are escaped with backslashes,
     *     booleans expanded to "true" or "false".
     */
    function esce($variable): void {
        if (
            !is_scalar($variable) and
            !$variable instanceof Stringable
        )
            return;

        if (is_bool($variable)) {
            echo ($variable) ? "true" : "false" ;
        } else {
            echo addslashes((string) $variable);
        }
    }

    /**
     * Function: json_set
     * JSON encodes a value and checks for errors.
     *
     * Parameters:
     *     $value - The value to be encoded.
     *     $options - A bitmask of encoding options.
     *     $depth - Recursion depth for encoding.
     *
     * Returns:
     *     A JSON encoded string or false on failure.
     */
    function json_set($value, $options = 0, $depth = 512): string|false {
        $encoded = json_encode($value, $options, $depth);

        if (json_last_error())
            trigger_error(
                _f("JSON encoding error: %s", fix(json_last_error_msg(), false, true)),
                E_USER_WARNING
            );

        return $encoded;
    }

    /**
     * Function: json_get
     * JSON decodes a value and checks for errors.
     *
     * Parameters:
     *     $value - The UTF-8 string to be decoded.
     *     $assoc - Convert objects into associative arrays?
     *     $depth - Recursion depth for decoding.
     *     $options - A bitmask of decoding options.
     *
     * Returns:
     *     A JSON decoded value of the appropriate PHP type.
     */
    function json_get($value, $assoc = false, $depth = 512, $options = 0): mixed {
        $decoded = json_decode($value, $assoc, $depth, $options);

        if (json_last_error())
            trigger_error(
                _f("JSON decoding error: %s", fix(json_last_error_msg(), false, true)),
                E_USER_WARNING
            );

        return $decoded;
    }

    /**
     * Function: json_response
     * Send a structured JSON response.
     *
     * Parameters:
     *     $text - A string containing a response message.
     *     $data - Arbitrary data to be sent with the response.
     */
    function json_response($text = null, $data = null): void {
        header("Content-Type: application/json; charset=UTF-8");
        echo json_set(array("text" => $text, "data" => $data));
    }

    /**
     * Function: file_attachment
     * Send a file attachment to the visitor.
     *
     * Parameters:
     *     $contents - The bitstream to be delivered to the visitor.
     *     $filename - The name to be applied to the content upon download.
     */
    function file_attachment($contents = "", $filename = "caconym"): void {
        $safename = addslashes($filename);
        header("Content-Type: application/octet-stream");
        header("Content-Disposition: attachment; filename=\"".$safename."\"");

        if (!USE_COMPRESSION and !ini_get("zlib.output_compression"))
            header("Content-Length: ".strlen($contents));

        echo $contents;
    }

    /**
     * Function: zip_archive
     * Creates a basic flat Zip archive from an array of items.
     *
     * Parameters:
     *     $array - An associative array of names and contents.
     *
     * Returns:
     *     A Zip archive.
     *
     * See Also:
     *     https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
     */
    function zip_archive($array): string {
        $file = "";
        $cdir = "";
        $eocd = "";

        # Generate MS-DOS date/time format.
        $now  = getdate();
        $time = (
            0 |
            $now["seconds"] >> 1 |
            $now["minutes"] << 5 |
            $now["hours"] << 11
        );
        $date = (
            0 |
            $now["mday"] |
            $now["mon"] << 5 |
            ($now["year"] - 1980) << 9
        );

        foreach ($array as $name => $orig) {
            # Remove directory separators.
            $name = str_replace(array("\\", "/"), "", $name);
            $comp = $orig;
            $method = "\x00\x00";

            if (strlen($name) > 0xffff or strlen($orig) > 0xffffffff)
                trigger_error(
                    __("Failed to create Zip archive."),
                    E_USER_WARNING
                );

            if (function_exists("gzcompress")) {
                $zlib = gzcompress($orig, 6, ZLIB_ENCODING_DEFLATE);

                if ($zlib !== false) {
                    # Trim ZLIB header and checksum from the deflated data.
                    $zlib = substr(substr($zlib, 0, strlen($zlib) - 4), 2);

                    if (strlen($zlib) < strlen($orig)) {
                        $comp = $zlib;
                        $method = "\x08\x00";
                    }
                }
            }

            $head = "\x50\x4b\x03\x04";         # Local file header signature.
            $head.= "\x14\x00";                 # Version needed to extract.
            $head.= "\x00\x00";                 # General purpose bit flag.
            $head.= $method;                    # Compression method.
            $head.= pack("v", $time);           # Last mod file time.
            $head.= pack("v", $date);           # Last mod file date.

            $nlen = strlen($name);
            $olen = strlen($orig);
            $clen = strlen($comp);
            $crc  = crc32($orig);

            $head.= pack("V", $crc);            # CRC-32.
            $head.= pack("V", $clen);           # Compressed size.
            $head.= pack("V", $olen);           # Uncompressed size.
            $head.= pack("v", $nlen);           # File name length.
            $head.= pack("v", 0);               # Extra field length.

            $cdir.= "\x50\x4b\x01\x02";         # Central file header signature.
            $cdir.= "\x00\x00";                 # Version made by.
            $cdir.= "\x14\x00";                 # Version needed to extract.
            $cdir.= "\x00\x00";                 # General purpose bit flag.
            $cdir.= $method;                    # Compression method.
            $cdir.= pack("v", $time);           # Last mod file time.
            $cdir.= pack("v", $date);           # Last mod file date.
            $cdir.= pack("V", $crc);            # CRC-32.
            $cdir.= pack("V", $clen);           # Compressed size.
            $cdir.= pack("V", $olen);           # Uncompressed size.
            $cdir.= pack("v", $nlen);           # File name length.
            $cdir.= pack("v", 0);               # Extra field length.
            $cdir.= pack("v", 0);               # File comment length.
            $cdir.= pack("v", 0);               # Disk number start.
            $cdir.= pack("v", 0);               # Internal file attributes.
            $cdir.= pack("V", 32);              # External file attributes.
            $cdir.= pack("V", strlen($file));   # Relative offset of local header.
            $cdir.= $name;

            $file.= $head.$name.$comp;
        }

        $eocd.= "\x50\x4b\x05\x06";             # End of central directory signature.
        $eocd.= "\x00\x00";                     # Number of this disk.
        $eocd.= "\x00\x00";                     # Disk with start of central directory.
        $eocd.= pack("v", count($array));       # Entries on this disk.
        $eocd.= pack("v", count($array));       # Total number of entries.
        $eocd.= pack("V", strlen($cdir));       # Size of the central directory.
        $eocd.= pack("V", strlen($file));       # Offset of start of central directory.
        $eocd.= "\x00\x00";                     # ZIP file comment length.

        return $file.$cdir.$eocd;
    }

    /**
     * Function: email
     * Sends an email using PHP's mail() function or an alternative.
     */
    function email(): bool {
        if (!Config::current()->email_correspondence)
            return false;

        $function = "mail";
        Trigger::current()->filter($function, "send_mail");
        return call_user_func_array($function, func_get_args());
    }

    /**
     * Function: email_activate_account
     * Sends an activation email to a newly registered user.
     *
     * Parameters:
     *     $user - The user to receive the email.
     */
    function email_activate_account($user): bool {
        $config = Config::current();
        $trigger = Trigger::current();

        $url = $config->url."/?action=activate".
               "&amp;login=".urlencode($user->login).
               "&amp;token=".token($user->login);

        if ($trigger->exists("correspond_activate_account"))
            return $trigger->call("correspond_activate_account", $user, $url);

        $headers = array(
            "Content-Type" => "text/plain; charset=UTF-8",
            "From" => $config->email,
            "X-Mailer" => CHYRP_IDENTITY
        );

        $subject = _f("Activate your account at %s", $config->name);
        $message = _f("Hello, %s.", $user->login).
                   "\r\n".
                   "\r\n".
                   __("You are receiving this message because you registered a new account.").
                   "\r\n".
                   "\r\n".
                   __("Visit this link to activate your account:").
                   "\r\n".
                   unfix($url);

        return email($user->email, $subject, $message, $headers);
    }

    /**
     * Function: email_reset_password
     * Sends a password reset email to a user.
     *
     * Parameters:
     *     $user - The user to receive the email.
     */
    function email_reset_password($user): bool {
        $config = Config::current();
        $trigger = Trigger::current();
        $issue = strval(time());

        $url = $config->url."/?action=reset_password".
               "&amp;issue=".$issue.
               "&amp;login=".urlencode($user->login).
               "&amp;token=".token(array($issue, $user->login));

        if ($trigger->exists("correspond_reset_password"))
            return $trigger->call("correspond_reset_password", $user, $url);

        $headers = array(
            "Content-Type" => "text/plain; charset=UTF-8",
            "From" => $config->email,
            "X-Mailer" => CHYRP_IDENTITY
        );

        $subject = _f("Reset your password at %s", $config->name);
        $message = _f("Hello, %s.", $user->login).
                   "\r\n".
                   "\r\n".
                   __("You are receiving this message because you requested a new password.").
                   "\r\n".
                   "\r\n".
                   __("Visit this link to reset your password:").
                   "\r\n".
                   unfix($url);

        return email($user->email, $subject, $message, $headers);
    }

    /**
     * Function: javascripts
     * Returns inline JavaScript for core functionality and extensions.
     */
    function javascripts(): string {
        $config = Config::current();
        $route = Route::current();
        $theme = Theme::current();
        $trigger = Trigger::current();
        $visitor = Visitor::current();
        $nonce = "";

        $script = (ADMIN) ?
            MAIN_DIR.DIR."admin".DIR."javascripts".DIR."admin.js.php" :
            INCLUDES_DIR.DIR."main.js.php" ;

        $common = '<script src="'.
                  fix($config->chyrp_url."/includes/common.js", true).
                  '"></script>';

        ob_start();
        include $script;
        $ob = ob_get_clean();

        $trigger->call("javascripts_hash", $ob);
        $trigger->filter($nonce, "javascripts_nonce");

        return $common."\n<script nonce=\"".$nonce."\">".$ob."</script>\n";
    }
