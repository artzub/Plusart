<?php
/**
 * @author: ArtZub <artzub@gmail.com>
 */
class GoogleApis extends CApplicationComponent {

    /**
     * @var (@link apiClient)
     */
    protected $client;

    protected $suffix;

    protected $_auth = false;

    /**
     * @var array options (@link config.php) for api client (@link apiClient)
     */
    public $apiConfig = array();

    protected $apiPool = array();

    /**
     * @var array
     */
    public $apis = array();

    public function init($apiConfig = array()){
        parent::init();
        $this->suffix = "__gapis";
        $this->setApiConfig($apiConfig);
        $this->client = new apiClient($this->apiConfig);
        $this->client->setApplicationName(Yii::app()->name);
        $this->getApis();
    }

    /**
     * For perfomance reasons it uses Yii::app()->cache to store settings array.
     * @return array apis.
     */
    public function getApis() {
        if (Yii::app()->hasComponent('cache'))
            $apis = Yii::app()->cache->get('GoogleApis.apis');
        if (!isset($apis) || !is_array($apis)) {
            $apis = array();
            foreach ($this->apis as $api => $options) {
                $class = $this->getApiWrapper($api);
                $apis[$api] = (object) array(
                    'name' => $class->getApiName(),
                );
            }
            if (Yii::app()->hasComponent('cache'))
                Yii::app()->cache->set('GoogleApis.apis', $apis);
        }
        return $apis;
    }

    public function hasApiWrapper($api) {
        return isset($this->apis[strtolower($api)]);
    }

    public function getApiWrapper($api) {
        $api = strtolower($api);
        if ($this->hasApiWrapper($api)) {
            $api = $this->services[$api];

            $class = $api['class'];
            $point = strrpos($class, '.');
            // if it is yii path alias
            if ($point > 0) {
                Yii::import($class);
                $class = substr($class, $point + 1);
            }
            unset($api['class']);
            $wrapper = new $class();
            $wrapper->init($this, $api);
        }
        return $wrapper;
    }

    public function setRedirect($url) {
        if(isset($url))
            $this->client->setRedirectUri($url);
    }

    protected function setApiConfig($apiConfig = array()) {
        $this->apiConfig = array_merge($this->apiConfig, $apiConfig);
    }

    public function auth() {
        if(!$this->_auth)
            if ($this->getIsInitialized()) {
                if(isset($_GET['code'])) {
                    $this->client->authenticate();
                    refreshToken();
                    header('Location: http://' . $_SERVER['HTTP_HOST'] . $_SERVER['PHP_SELF']);
                }
                else
                    Yii::app()->request->redirect($this->client->createAuthUrl());
            }
        return $this->_auth;
    }

    protected function refreshToken() {
        $this->setState('access_token', $this->client->getAccessToken());
        $this->_auth = true;
    }

    public function deauth() {
        if($this->hasState("access_token")){
            $this->clearState("access_token");
        }
    }

    public function IsAuth() {
        return $this->_auth;
    }

    public function setState($name, $value) {
        Yii::app()->session[$name] = $value;
    }

    public function getState($name, $defaultValue = null) {
        return $this->hasState($name) ?
            Yii::app()->session[$name] : $defaultValue;
    }

    public function hasState($name) {
        return isset(Yii::app()->session[$name]);
    }

    public function clearState($name) {
        unset(Yii::app()->session[$name]);
    }
}