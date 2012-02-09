<?php
/**
 *social.php
 *
 * @author Artem Zubkov  <artzub@gmail.com>
 * @copyright 2011 Artem Zubkov
 * @license Apatche License 2
 * @package spin
 * @version 0.1
 */
class Spin extends CWidget
{
    /**
     *  'params' => array(
     *       'lines' => 8,
     *       'length' => 2,
     *       'width' => 2,
     *       'radius' => 3
     *  )
     */

    public $options = array(
        'color' => null,
        'presets' => 'tiny',
        'params' => array(),
        'htmlOption' => array(
            'id' => 'spin_container'
        )
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
            $cs->registerScriptFile($baseUrl . '/spin.min.js');
            $cs->registerScriptFile($baseUrl . '/jquery.spin.js');
        }else
            throw new Exception(Yii::t('spin - Error: Couldn\'t find assets folder to publish.'));
    }

    public function run() {
        if(!isset($this->options['htmlOptions']) ||
           empty($this->options['htmlOptions']) ||
           empty($this->options['htmlOptions']['id']) ){
            $this->options['htmlOptions']['id'] = 'spin_container';
        }
        echo CHtml::openTag("div", $this->options['htmlOptions']);
?>
        <script type="text/javascript">
            jQuery("#<?=$this->options['htmlOptions']['id']?>")
                .hide()
                .spin(<?=(!empty($this->options["params"]) ?
                    json_encode($this->options["params"]) : (
                        !empty($this->options["presets"]) ?
                            '"'.$this->options["presets"].'"'
                            : '"tiny"'
                ))?>);
        </script>
<?php
        echo CHtml::closeTag('div');
    }
}
