<?php
class ForceDirected extends CInputWidget
{
    public $params=array(
        'type' => 'simple'
    );

    private function registerFiles() {
        $assets = dirname(__FILE__).'/assets';
        $baseUrl = Yii::app()->assetManager->publish($assets);

        $cs = Yii::app()->clientScript;
        if(is_dir($assets)) {
            $cs->registerScriptFile($baseUrl . '/'. $this->params['type'] . '.js');
            $cs->registerCssFile($baseUrl . '/'. $this->params['type'] . '.css');
        }else
            throw new Exception(Yii::t('ForceDirected - Error: Couldn\'t find assets folder to publish.'));
    }

    public function run(){
        if (!isset($this->params['htmlOptions'])) {
            $this->params['htmlOptions'] = array(
                'id' => 'simple_fd'
            );
        }

        if (!isset($this->params['htmlOptions']['id']) ||
            empty($this->params['htmlOptions']['id'])) {
            $this->params['htmlOptions']['id'] = 'simple_fd';
        }

        if (!isset($this->params['objectName']))
            $this->params['objectName'] = $this->params['htmlOptions']['id'];

        $this->registerFiles();
        echo $this->render($this->params['type'], $this->params, true);
    }
}
