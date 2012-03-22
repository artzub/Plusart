<?php
/**
 * @author Artem Zubkov  <artzub@gmail.com>
 * @copyright 2011 Artem Zubkov
 * @license Apatche License 2
 * @package spin
 * @version 0.1
 */
class ProBar extends CWidget {

    public $options = array(
        'state' => 'Loading ...',
        'stateId' => 'probar_state',
        'probarId' => 'probar_bar',
        'colorStyle' => 'orange',
        'probarStyle' => 'nostripes',
        'htmlOptions' => array(),
    );

    private $colors = array(
        'orange' => 'probar_orange',
        'red' => 'probar_red',
        'green' => '',
    );

    private $proStyles = array(
        'nostripes' => 'probar_nostripes',
        'animate' => 'probar_animate'
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

        if(is_dir($assets)){
            $cs->registerCssFile($baseUrl . '/probar.css');
        }else
            throw new Exception(Yii::t('probar - Error: Couldn\'t find assets folder to publish.'));
    }

    public function run() {
        if(!isset($this->options['htmlOptions']) ||
           empty($this->options['htmlOptions']) ||
           empty($this->options['htmlOptions']['id']) ){
            $this->options['htmlOptions']['id'] = 'probar_container';
        }

        if (isset($this->colors[$this->options['colorStyle']]))
            $this->options['colorStyle'] = $this->colors[$this->options['colorStyle']];

        if (isset($this->proStyles[$this->options['probarStyle']]))
            $this->options['probarStyle'] = $this->proStyles[$this->options['probarStyle']];

        echo CHtml::openTag("div", $this->options['htmlOptions']);
?>
        <h1 id="<?=$this->options['stateId']?>"><?=$this->options['state']?></h1>
        <div class="probar_meter <?=$this->options['probarStyle']?> <?=$this->options['colorStyle']?>">
            <span id="<?=$this->options['probarId']?>" style="width: 100%"></span>
        </div>
<?php
        echo CHtml::closeTag('div');
    }
}