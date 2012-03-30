<?php

class SiteController extends Controller
{
    private $nameGraph = array();
	/**
	 * Declares class-based actions.
	 */
	public function actions()
	{
		return array(
			// captcha action renders the CAPTCHA image displayed on the contact page
			'captcha'=>array(
				'class'=>'CCaptchaAction',
				'backColor'=>0xFFFFFF,
			),
			// page action renders "static" pages stored under 'protected/views/site/pages'
			// They can be accessed via: index.php?r=site/page&view=FileName
			'page'=>array(
				'class'=>'CViewAction',
			),
		);
	}

	/**
	 * This is the default 'index' action that is invoked
	 * when an action is not explicitly requested by users.
	 */
	public function actionIndex()
	{
		$this->render('index');
	}

    public function init() {
        $this->nameGraph = array(
            'direct' => Yii::t('app', 'Direct graph'),
            'indirect' => Yii::t('app', 'Indirect graph'),
            'bubbles' => Yii::t('app', 'Bubbles'),
        );

        if(Yii::app()->gapis->IsAuth() && Yii::app()->gapis->hasApiWrapper("Plus")) {
            $plus = Yii::app()->gapis->getApiWrapper("Plus");
            if (isset($plus) && !Yii::app()->gapis->hasState('person')) {
                $person = $plus->getPerson();
                !Yii::app()->gapis->setState('person', array(
                    "name" => $person["displayName"],
                    "url" => $person["url"],
                    "img" => $person['image']['url'],
                    "id" => $person["id"],
                ));
            }
        }
    }

	/**
	 * This is the action to handle external exceptions.
	 */
	public function actionError()
	{
	    if($error=Yii::app()->errorHandler->error)
	    {
	    	if(Yii::app()->request->isAjaxRequest)
	    		echo $error['message'];
	    	else
	        	$this->render('error', $error);
	    }
	}

	/**
	 * Displays the contact page
	 */
	public function actionContact()
	{
		$model=new ContactForm;
		if(isset($_POST['ContactForm']))
		{
			$model->attributes=$_POST['ContactForm'];
			if($model->validate())
			{
				$headers="From: {$model->email}\r\nReply-To: {$model->email}";
				mail(Yii::app()->params['adminEmail'],$model->subject,$model->body,$headers);
				Yii::app()->user->setFlash('contact','Thank you for contacting us. We will respond to you as soon as possible.');
				$this->refresh();
			}
		}
		$this->render('contact',array('model'=>$model));
	}

    private $data;

    public function actionGraph($type = "") {

        $type = strtolower($type);

        $model=new RunForm();
        /*if(isset($_GET['RunForm'])) {
            $model->setAttributes($_GET['RunForm'], false);
            if($model->validate())
            {
                $data = "";
                if(Yii::app()->gapis->IsAuth() && Yii::app()->gapis->hasApiWrapper("Plus")) {
                    $plus = Yii::app()->gapis->getApiWrapper("Plus");
                    $class = ucfirst($type) . 'GraphBuilder';
                    $builder = new $class();
                    $grapher = new Grapher($plus, $class);

                    $data = json_encode($grapher->getGraph(array(
                        'pids' => $model->pids,
                        'maxResults' => $model->maxResults,
                        'maxComments' => $model->maxComments,
                        'maxPlusoners' => $model->maxPlusoners,
                        'maxResharers' => $model->maxResharers,
                        'depth' => $model->depth,
                    )));
                    Yii::app()->user->setFlash('graph',"Complete!!!" . strlen($data));
                }
                else {
                    $data = "Wrapper Plus not found or don't auth";
                    Yii::app()->user->setFlash('graph',$data);
                }
                if(Yii::app()->request->isAjaxRequest){
                    echo $data;
                    Yii::app()->end();
                }
                //$this->refresh();
            }
        }*/
        $this->render('graph',array(
            'model' => $model,
            'type' => $this->nameGraph[$type],
            //'data' => $data,
        ));
    }

	public function actionLogin() {
        $this->setRedirect();
        if(Yii::app()->gapis->auth(/*Yii::app()->createAbsoluteUrl("site/login")*/)) {
            $this->redirect(Yii::app()->homeUrl);
        }
	}

    private function setRedirect()
    {
        $url = empty(Yii::app()->request->urlReferrer) ? Yii::app()->homeUrl : Yii::app()->request->urlReferrer;
        if(!Yii::app()->gapis->hasRedirectAfter()) {
            Yii::app()->gapis->setRedirectAfter($url);
        }
    }

    /**
	 * Logs out the current user and redirect to homepage.
	 */
	public function actionLogout()
	{
        $this->setRedirect();
        Yii::app()->gapis->clearState('person');
		Yii::app()->gapis->deauth();
		$this->redirect(Yii::app()->homeUrl);
	}

    public function actionSearch($type = "", $q=""){
        switch($type){
            case "guser" :

                if (!isset($q) || empty($q)) {
                    echo "[]";
                    Yii::app()->end();
                }

                $hash = md5($q);

                $json = Yii::app()->cache->get("search_" . $hash);

                if($json!==false) {
                    echo $json;
                    Yii::app()->end();
                }

                $values = array (
                    'ds'=>'es_profiles',
                    'client'=>'es-sharebox',
                    'partnerid'=>'es-profiles',
                    'tok'=>'SF5qnwOLuBty9aPAcKMtYg',
                    'authuser'=>0,
                    'xhr'=>'t',
                    'expid'=>'2b582408',
                    'gs_nf'=>1,
                    'q'=>$q
                );
                $ch = curl_init("https://plus.google.com/complete/search?" . http_build_query($values));
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_HEADER, false);
                curl_setopt($ch, CURLOPT_HTTPGET, true);
                curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);
                curl_setopt($ch, CURLOPT_HTTPHEADER,
                    array('Content-type: application/json'));
                $json = curl_exec($ch);
                $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                curl_close($ch);
                if ($code != 200) {
                    echo "";
                    Yii::app()->end();
                }

                $json = preg_replace('/^\[.*?\[/', '', $json);
                $json = preg_replace('/\],\{"k".*/', '', $json);
                $json = '[' . preg_replace('/\["(.*?").*?g:"(.*?").*?\]\]/', '{"value":"$2, "caption":"$1}', $json) . ']';
                echo $json;
                echo Yii::app()->cache->set("search_" . $hash, $json, 3600) ? "work" : "not work";
                Yii::app()->end();
                break;
        }
    }
}