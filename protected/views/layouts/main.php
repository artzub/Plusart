<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="language" content="en" />

	<!-- blueprint CSS framework -->
	<link rel="stylesheet" type="text/css" href="<?php echo Yii::app()->request->baseUrl; ?>/css/screen.css" media="screen, projection" />
	<link rel="stylesheet" type="text/css" href="<?php echo Yii::app()->request->baseUrl; ?>/css/print.css" media="print" />
	<!--[if lt IE 8]>
	<link rel="stylesheet" type="text/css" href="<?php echo Yii::app()->request->baseUrl; ?>/css/ie.css" media="screen, projection" />
	<![endif]-->

	<link rel="stylesheet" type="text/css" href="<?php echo Yii::app()->request->baseUrl; ?>/css/main.css" />
	<link rel="stylesheet" type="text/css" href="<?php echo Yii::app()->request->baseUrl; ?>/css/form.css" />
    <link rel="shortcut icon" type="image/x-icon" href="<?php echo Yii::app()->request->baseUrl; ?>/images/favicon.ico" />


	<title><?php echo CHtml::encode($this->pageTitle); ?></title>
</head>

<body>

<div class="container" id="page">

	<div id="header" style="overflow: hidden;">
		<div id="logo">
            <div class="left" style="overflow: hidden;">
                <?php echo CHtml::encode(Yii::app()->name); ?>
                <?php $this->widget('ext.widgets.social.social', array(
                        'networks' => array(
                        'googleplusone'=>array(
                            "size"=>"standard",
                            "annotation"=>"inline",
                        ),
                )));?>
            </div>
            <?  $person = Yii::app()->gapis->getState("person");
                if(isset($person)) : ?>
                <div class="user right">
                    <img src="<?=$person["img"]?>" alt="<?=$person["name"]?>" class="left">
                    <div class="user-info">
                        <div><a href="<?=$person["url"]?>"><?=$person["name"]?></a></div>
                        <div>(<?=CHtml::link('logout', array('logout'))?>)</div>
                    </div>
                </div>
            <? endif ?>
        </div>
	</div><!-- header -->
    <? /*
	<div id="mainmenu">
		<?php $this->widget('zii.widgets.CMenu',array(
			'items'=>array(
				array('label'=>'Home', 'url'=>array('/site/index')),
				array('label'=>'About', 'url'=>array('/site/page', 'view'=>'about')),
				array('label'=>'Contact', 'url'=>array('/site/contact')),
				array('label'=>'Login', 'url'=>array('/site/login'), 'visible'=>Yii::app()->user->isGuest),
				array('label'=>'Logout ('.Yii::app()->user->name.')', 'url'=>array('/site/logout'), 'visible'=>!Yii::app()->user->isGuest)
			),
		)); ?>
	</div><!-- mainmenu -->
    */ ?>
	<?php if(isset($this->breadcrumbs)):?>
		<?php $this->widget('zii.widgets.CBreadcrumbs', array(
			'links'=>$this->breadcrumbs,
		)); ?><!-- breadcrumbs -->
	<?php endif?>

	<?php echo $content; ?>

	<div class="clear"></div>

	<div id="footer">
		Copyright &copy; <?php echo date('Y'); ?> by Artem Zubkov <?=CHtml::link("google+", "http://profiles.google.com/artzub");?>.<br/>
		All Rights Reserved.<br/>
		<?php echo Yii::powered(); ?>
        <?$this->widget('ext.widgets.google.analytics.EGoogleAnalyticsWidget',
            array(
                'account'=>'UA-28343295-3',
                'domainName'=>array(),
                'searchSystems'=>array(),
            )
        );?>
	</div><!-- footer -->

</div><!-- page -->

</body>
</html>
