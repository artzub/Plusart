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

    protected $redirectAfter;

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

    public function init($config = array()){
        parent::init();
        $this->suffix = "__gapis";
        $this->setApiConfig($config);
        $this->client = new apiClient($this->apiConfig);
        $this->client->setApplicationName(Yii::app()->name);
        $this->initApis();

        $this->sign();
        $this->redirectAfter = Yii::app()->homeUrl;
        if($this->hasState('r_url_a')) {
            $this->redirectAfter = $this->getState('r_url_a');
        }
    }

    public function getClient() {
        return $this->client;
    }

    public function initApis() {
        if (!isset($apis) || !is_array($apis)) {
            $apis = array();
            foreach ($this->apis as $api => $options) {
                $apis[$api] = $this->getApiWrapper($api);
            }
        }
        $this->apiPool = $apis;
        return $this->apiPool;
    }

    public function hasApiWrapper($api) {
        return isset($this->apis[strtolower($api)]);
    }

    protected function createApiWrapper($api) {
        $api = strtolower($api);
        if ($this->hasApiWrapper($api)) {
            $api = $this->apis[$api];

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

    public function getApiWrapper($api) {
        $api = strtolower($api);
        if ($this->hasApiWrapper($api)) {
            $wrapper = $this->apiPool[$api];
            if(!isset($wrapper)) {
                $wrapper = $this->createApiWrapper($api);
                $this->apiPool[$api] = $wrapper;
            }
        }
        return $wrapper;
    }

    public function setRedirect($url) {
        if(isset($url))
            $this->client->setRedirectUri($url);
    }

    public function setRedirectAfter($url) {
        if(isset($url)) {
            $this->redirectAfter = $url;
            $this->setState('r_url_a', $this->redirectAfter);
        }
    }

    protected function setApiConfig($config = array()) {
        $this->apiConfig = array_merge($this->apiConfig, $config);
    }

    public function auth($redirect=null) {
        if(!$this->_auth)
            if ($this->getIsInitialized()) {
                if(isset($_GET['code'])) {
                    $this->client->authenticate();
                    $this->refreshToken();
                    $this->redirect();
                    //header('Location: ' . $this->apiConfig["http://plusor.net46.net/index.php/login"]);
                }
                else {
                    $this->setRedirect($redirect);
                    Yii::app()->request->redirect($this->client->createAuthUrl());
                }
            }
        return $this->_auth;
    }

    protected function redirect()
    {
        $this->clearState('r_url_a');
        Yii::app()->request->redirect(
            //Yii::app()->createAbsoluteUrl(
                empty($this->redirectAfter) ?
                    Yii::app()->homeUrl : $this->redirectAfter);
    }

    public function hasRedirectAfter() {
        return $this->hasState('r_url_a');
    }

    public function refreshToken() {
        $this->setState('access_token', $this->client->getAccessToken());
        $this->_auth = true;
    }

    public function deauth() {
        if($this->hasState("access_token")){
            $this->clearState("access_token");
        }
        $this->redirect();
    }

    public function isAuth() {
        return $this->_auth;
    }

    public function sign() {
        $this->_auth = $this->hasState("access_token");
        if($this->_auth) {
            $token = $this->getState("access_token");
            $this->client->setAccessToken($token);
            $token = json_decode($token, true);
            $expired = ($token['created'] + ($token['expires_in'] - 30)) < time();
            if($expired && isset($token['refresh_token'])) {
                $this->client->refreshToken($token['refresh_token']);
                $this->refreshToken();
            }
        }
        return $this->_auth;
    }

    public function getTokenForJS() {
        $token = array(
            "acceess_token" => "",
            "expires_in" => 3600
        );
        if ($this->hasState("access_token"))
            $token = $this->getState("access_token");
        return print_r($token, true);
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