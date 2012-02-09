<?php
/**
 */
class Jit extends CWidget
{
    public $libs = array();

    public $htmlOptions = array();


    private $libsClass = array(
        'forcedirected' => array(
            'path' => 'jitlibs.ForceDirected',
            'classes' => array(
                'simple' => 'ForceDirected',
            ),
        ),
    );

    public function init() {
        Yii::setPathOfAlias('jitlibs',dirname(__FILE__).'/Libs');
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
        $extras = $assets.'/Extras';
        $baseUrl = Yii::app()->assetManager->publish($assets);
        $extrasUrl = Yii::app()->assetManager->publish($extras);

        $cs = Yii::app()->clientScript;
        if(is_dir($assets)){
            $cs->registerScriptFile($baseUrl . '/jit-yc.js');
            $cs->registerCssFile($baseUrl . '/jit.css');
            if (is_dir($extras)) {
                $cs->registerScriptFile($extrasUrl . '/excanvas.js');
            }
        }else
            throw new Exception(Yii::t('jit - Error: Couldn\'t find assets folder to publish.'));
    }

    public function run() {
        /*
         *  <div id="container">
                <div id="left-container">
                    <div id="id-list"></div>
                </div
                <div id="center-container">
                    <div id="infovis"></div>
                </div>

                <div id="right-container">

                    <div id="inner-details"></div>

                </div>

                <div id="log"></div>
            </div>
        */
        echo CHtml::openTag('div', $this->htmlOptions);

        echo CHtml::openTag('div', array(
            'id' => 'jit_container',
        ));

            echo CHtml::tag('div', array(
                'id' => 'jit_left-container',
            ), "");

            echo CHtml::openTag('div', array(
                'id' => 'jit_central-container',
            ));
                echo "ffff";
                foreach($this->libs as $lib => $params) {
                    $lib = strtolower($lib);
                    if(!isset($this->libsClass[$lib]))
                        continue;
                    if (!isset($params['type']))
                        $params['type'] = 'simple';

                    Yii::import($this->libsClass[$lib]['path'] . '.*');

                    $class = $this->libsClass[$lib]['classes'][$params['type']];
                    $opt = array(
                        'params' => $params
                    );
                    $this->widget($class, $opt);
                }
                echo "/ffff";
            echo CHtml::closeTag('div');

            echo CHtml::openTag('div', array(
                'id' => 'jit_right-container'
            ));
                echo CHtml::tag('div', array(
                    'id' => 'jit_inner-details',
                ), "");
            echo CHtml::closeTag('div');
            echo CHtml::tag('div', array(
                'id' => 'jit_log',
            ), "");
        echo CHtml::closeTag('div');

        echo CHtml::closeTag('div');
    }
}
