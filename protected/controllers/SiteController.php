<?php

class SiteController extends Controller
{
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

	public function actionLogin() {
        if(Yii::app()->gapis->auth()) {
            $goto = Yii::app()->session["from"];
            if(isset($goto)) {
                $this->redirect($goto);
            }
        }
	}

	/**
	 * Logs out the current user and redirect to homepage.
	 */
	public function actionLogout()
	{
        Yii::app()->gapis->clearState('person');
		Yii::app()->gapis->deauth();
		$this->redirect(Yii::app()->homeUrl);
	}
}