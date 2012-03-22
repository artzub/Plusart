<?php
/**
 * @author Artem Zubkov  <artzub@gmail.com>
 * @copyright 2011 Artem Zubkov
 * @license Apatche License 2
 * @package spin
 * @version 0.1
 */
class GraphBuilder extends CWidget
{
    public function init() {
        $this->registerFiles();
    }

    /**
     * Register assets file
     *
     * @return nothing
     */
    private function registerFiles()
    {
        $assets = dirname(__FILE__).'/assets';
        $baseUrl = Yii::app()->assetManager->publish($assets);

        $cs = Yii::app()->clientScript;
        if(is_dir($assets)){
            $cs->registerScriptFile($baseUrl . '/generator.js');
            $cs->registerScriptFile($baseUrl . '/directGraph.js');
            $cs->registerScriptFile('https://apis.google.com/js/client.js', CClientScript::POS_HEAD);
        }else
            throw new Exception(Yii::t('GraphBuilder - Error: Couldn\'t find assets folder to publish.'));
    }

    public function run() {
        ?>
        <script type="text/javascript">
            function load_gapi(callback) {
                window.gapis_load_callback = callback;
                GraphGPlus.init_gapis(function(){
                    window.accessToken = accessToken || <?=Yii::app()->gapis->getTokenForJS()?>;
                    gapi.auth.setToken(accessToken);
                    if(typeof(window.gapis_load_callback) != 'undefined' && window.gapis_load_callback != null)
                        window.gapis_load_callback();
                });
            }

            (function($){
                $(document).ready(function(){
                    GraphGPlus.DataBuilder = new DirectGraphBuilder();
                })
            })(jQuery);
        </script>
        <?php
    }
}
