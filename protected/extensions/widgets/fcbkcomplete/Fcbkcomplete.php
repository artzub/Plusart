<?php
/**
 * User: Admin
 * Date: 27.03.12
 * Time: 2:04
 */
class Fcbkcomplete extends CWidget
{
    public $options = array(
        'itemid' => "",
        'json_url' => "null",
        'json_data' => "null",
        'usesdinamyc' => "false",
        'cache' => "true",
        'filter_case' => "false",
        'filter_hide' => "false",
        'firstselected' => "true",
        'onremove' => "null",
        'onselect' => "null",
        'filter_selected' => "true",
        'complete_text' => "Selected items",
        'height' => 20,
        'newel' => "false",           //show typed text like a element
        'maxshownitems' => 30,  //maximum numbers that will be shown at dropdown list (less better performance)
        'searchpropname' => null,
    );

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
        $cs->registerCoreScript('jquery');

        if(is_dir($assets)){
            $cs->registerScriptFile($baseUrl . '/jquery.fcbkcomplete.js');
            $cs->registerCssFile($baseUrl . '/style.css');
        }else
            throw new Exception(Yii::t('Fcbkcomplete - Error: Couldn\'t find assets folder to publish.'));
    }

    public function run() {

        Yii::app()->clientScript->registerScript("fcbk".$this->options['itemid'], "
            $('#". $this->options['itemid'] ."').fcbkcomplete
            ({
                ". (isset($this->options['json_url']) ? "json_url:'" . $this->options['json_url'] . "'," : "") ."
                ". (isset($this->options['json_data']) ? "json_data:" . $this->options['json_data'] . "," : "") ."
                ". (isset($this->options['cache']) ? "cache:" .  $this->options['cache'] . "," : "") ."
                ". (isset($this->options['filter_case']) ? "filter_case:" . $this->options['filter_case'] . "," : "") ."
                ". (isset($this->options['filter_hide']) ? "filter_hide:" . $this->options['filter_hide'] . "," : "") ."
                ". (isset($this->options['firstselected']) ? "firstselected:" . $this->options['firstselected'] . "," : "") ."
                ". (isset($this->options['onremove']) ? "onremove:" . $this->options['onremove'] . "," : "") ."
                ". (isset($this->options['onselect']) ? "onselect:" . $this->options['onselect'] . "," : "") ."
                ". (isset($this->options['filter_selected']) ? "filter_selected:" . $this->options['filter_selected'] . "," : "") ."
                ". (isset($this->options['complete_text']) ? "complete_text:'" . $this->options['complete_text'] . "'," : "") ."
                ". (isset($this->options['height']) ? "height:" . $this->options['height'] . "," : "") ."
                ". (isset($this->options['newel']) ? "newel:" . $this->options['newel'] . "," : "") ."
                ". (isset($this->options['maxshownitems']) ? "maxshownitems:" . $this->options['maxshownitems'] . "," : "") ."
                ". (isset($this->options['searchpropname']) ? "searchpropname:'" . $this->options['searchpropname'] . "'," : "") ."
            });
        ", CClientScript::POS_READY);
        echo '<select name="'. $this->options['itemid'] .'" id="'. $this->options['itemid'] .'"></select>';
    }
}
