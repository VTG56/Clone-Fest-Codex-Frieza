<?php
    require_once "model.Like.php";

    class Likes extends Modules {
        static function __install() {
            Like::install();
        }

        static function __uninstall($confirm) {
            if ($confirm)
                Like::uninstall();
        }

        static function admin_like_settings($admin) {
            $config = Config::current();

            if (!Visitor::current()->group->can("change_settings"))
                show_403(__("Access Denied"), __("You do not have sufficient privileges to change settings."));

            if (empty($_POST))
                return $admin->display("like_settings");

            if (!isset($_POST['hash']) or $_POST['hash'] != token($_SERVER["REMOTE_ADDR"]))
                show_403(__("Access Denied"), __("Invalid security key."));

            $set = array($config->set("module_like",
                                array("showOnFront" => isset($_POST['showOnFront']),
                                      "likeWithText" => isset($_POST['likeWithText']),
                                      "likeImage" => $_POST['likeImage'])));

            if (!in_array(false, $set))
                Flash::notice(__("Settings updated."), "/admin/?action=like_settings");
        }

        static function settings_nav($navs) {
            if (Visitor::current()->group->can("change_settings"))
                $navs["like_settings"] = array("title" => __("Likes", "likes"));

            return $navs;
        }

        static function route_like() {
            if (empty($_GET['post_id']) or !is_numeric($_GET['post_id']))
                error(__("Error"), __("An ID is required to like a post.", "likes"), null, 400);

            if (!Visitor::current()->group->can("like_post"))
                show_403(__("Access Denied"), __("You do not have sufficient privileges to like posts.", "likes"));

            $post = new Post($_GET['post_id']);

            if ($post->no_results)
                show_404(__("Not Found"), __("Post not found."));

            $like = new Like($post->id);
            $like->like();

            Flash::notice(__("Post liked.", "likes"), $post->url()."#likes_".$post->id);
        }

        static function route_unlike() {
            if (empty($_GET['post_id']) or !is_numeric($_GET['post_id']))
                error(__("Error"), __("An ID is required to unlike a post.", "likes"), null, 400);

            if (!Visitor::current()->group->can("unlike_post"))
                show_403(__("Access Denied"), __("You do not have sufficient privileges to unlike posts.", "likes"));

            $post = new Post($_GET['post_id']);

            if ($post->no_results)
                show_404(__("Not Found"), __("Post not found."));

            $like = new Like($post->id);
            $like->unlike();

            Flash::notice(__("Post unliked.", "likes"), $post->url()."#likes_".$post->id);
        }

        static function stylesheets($styles) {
            $styles[] = Config::current()->chyrp_url."/modules/likes/style.css";
            return $styles;
        }

        static function javascript() {
            include MODULES_DIR.DIR."likes".DIR."javascript.php";
        }

        static function ajax_like() {
            if (empty($_POST["post_id"]) or !is_numeric($_POST['post_id']))
                error(__("Error"), __("An ID is required to like a post.", "likes"), null, 400);

            # JavaScript can't know if this is allowed, so don't throw an error here.
            if (!Visitor::current()->group->can("like_post"))
                json_response(__("You do not have sufficient privileges to like posts.", "likes"), false);

            $post = new Post($_POST['post_id']);

            if ($post->no_results)
                show_404(__("Not Found"), __("Post not found."));

            $like = new Like($post->id);
            $like->like();
            $like->fetchCount();

            if ($like->total_count == 1)
                $text = __("You like this.", "likes");
            else
                $text = sprintf(_p("You and %d person like this.", "You and %d people like this.", ($like->total_count - 1), "likes"),
                                ($like->total_count - 1));

            json_response($text, true);
        }

        static function ajax_unlike() {
            if (empty($_POST["post_id"]) or !is_numeric($_POST['post_id']))
                error(__("Error"), __("An ID is required to unlike a post.", "likes"), null, 400);

            # JavaScript can't know if this is allowed, so don't throw an error here.
            if (!Visitor::current()->group->can("unlike_post"))
                json_response(__("You do not have sufficient privileges to unlike posts.", "likes"), false);

            $post = new Post($_POST['post_id']);

            if ($post->no_results)
                show_404(__("Not Found"), __("Post not found."));

            $like = new Like($post->id);
            $like->unlike();
            $like->fetchCount();

            if ($like->total_count == 0)
                $text = __("No likes yet.", "likes");
            else
                $text = sprintf(_p("%d person likes this.", "%d people like this.", $like->total_count, "likes"),
                                $like->total_count);

            json_response($text, true);
        }

        static function delete_post($post) {
            SQL::current()->delete("likes", array("post_id" => $post->id));
        }

        static function delete_user($user) {
            SQL::current()->update("likes", array("user_id" => $user->id), array("user_id" => 0));
        }

        public function post($post) {
            $post->has_many[] = "likes";
            $post->get_likes = self::get_likes($post);
        }

        static function get_likes($post) {
            $config = Config::current();
            $route = Route::current();
            $visitor = Visitor::current();
            $module_like = $config->module_like;

            if ($module_like["showOnFront"] == false and $route->action == "index")
                return;

            $like = new Like($post->id, $visitor->id);
            $html = '<div class="likes" id="likes_'.$post->id.'">';

            if (!$like->resolve()) {
                if ($visitor->group->can("like_post")) {
                    $html.= "<a class=\"likes like\" href=\"".
                                $config->chyrp_url."/?action=like&post_id=".
                                $post->id."\" data-post_id=\"".
                                $post->id."\">".
                                "<img src=\"".$module_like["likeImage"]."\" alt='Likes icon'>";

                    if ($module_like["likeWithText"]) {
                        $html.= " <span class='like'>".__("Like!", "likes")."</span>";
                        $html.= " <span class='unlike'>".__("Unlike!", "likes")."</span>";
                    }

                    $html.= "</a>";
                }

                $html.= " <span class='like_text'>";

                if ($like->total_count == 0)
                    $html.= __("No likes yet.", "likes");
                else
                    $html.= sprintf(_p("%d person likes this.", "%d people like this.", $like->total_count, "likes"),
                                    $like->total_count);

                $html.= "</span>";
            } else {
                if ($visitor->group->can("unlike_post")) {
                    $html.= "<a class=\"likes liked\" href=\"".
                                $config->chyrp_url."/?action=unlike&post_id=".
                                $post->id."\" data-post_id=\"".
                                $post->id."\">".
                                "<img src=\"".$module_like["likeImage"]."\" alt='Likes icon'>";

                    if ($module_like["likeWithText"]) {
                        $html.= " <span class='like'>".__("Like!", "likes")."</span>";
                        $html.= " <span class='unlike'>".__("Unlike!", "likes")."</span>";
                    }

                    $html.= "</a>";
                }

                $html.= " <span class='like_text'>";

                if ($like->total_count == 0)
                    $html.= __("No likes yet.", "likes");
                elseif ($like->total_count == 1)
                    $html.= __("You like this.", "likes");
                else
                    $html.= sprintf(_p("You and %d person like this.", "You and %d people like this.", ($like->total_count - 1), "likes"),
                                    ($like->total_count - 1));

                $html.= "</span>";
            }

            $html.= "</div>";
            return $post->get_likes = $html;
        }

        public function get_like_images() {
            $imagesDir = MODULES_DIR.DIR."likes".DIR."images".DIR;
            $images = glob($imagesDir . "*.{jpg,jpeg,png,gif,svg}", GLOB_BRACE);

            foreach ($images as $image) {
                $pattern = "/".preg_quote(DIR, "/")."(\w.*)".preg_quote(DIR, "/")."images".preg_quote(DIR, "/")."/";
                $image = preg_replace($pattern, "", $images);

                while (list($key, $val) = each($image))
                    $arr[] = Config::current()->chyrp_url."/modules/likes/images/$val";

                return array_combine($image, $arr);
            }
        }

        public function manage_posts_column_header() {
            echo '<th class="post_likes">'.__("Likes", "tags").'</th>';
        }

        public function manage_posts_column($post) {
            $like = new Like(array("post_id" => $post->id));
            echo '<td class="post_likes">'.$like->fetchCount().'</td>';
        }

        public function import_chyrp_post($entry, $post) {
            $chyrp = $entry->children("http://chyrp.net/export/1.0/");

            if (!isset($chyrp->like))
                return;

            foreach ($chyrp->like as $like) {
                $timestamp = $like->children("http://www.w3.org/2005/Atom")->published;
                $session_hash = $like->children("http://chyrp.net/export/1.0/")->hash;
                $login = $like->children("http://chyrp.net/export/1.0/")->login;

                $user = new User(array("login" => (string) $login));

                SQL::current()->insert("likes",
                                 array("post_id" => $post->id,
                                       "user_id" => (!$user->no_results) ? $user->id : 0,
                                       "timestamp" => $timestamp,
                                       "session_hash" => $session_hash));
            }
        }

        public function posts_export($atom, $post) {
            $likes = SQL::current()->select("likes",
                                             "*",
                                             array("post_id" => $post->id))->fetchAll();

            foreach ($likes as $like) {
                $user = new User($like["user_id"]);
                $login = (!$user->no_results) ? $user->login : "" ;

                $atom.= "        <chyrp:like>\r";
                $atom.= '            <chyrp:login>'.$login.'</chyrp:login>'."\r";
                $atom.= '            <published>'.$like["timestamp"].'</published>'."\r";
                $atom.= '            <chyrp:hash>'.$like["session_hash"].'</chyrp:hash>'."\r";
                $atom.= "        </chyrp:like>\r";
            }

            return $atom;
        }

        static function cacher_regenerate_triggers($regenerate) {
            $triggers = array("route_like", "route_unlike", "ajax_like", "ajax_unlike");
            return array_merge($regenerate, $triggers);
        }

        public function user_logged_in($user) {
            $_SESSION["likes"] = array();
        }
    }
