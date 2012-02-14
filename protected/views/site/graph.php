<?php
$name = isset($type) ? $type : 'Error';

$this->pageTitle=Yii::app()->name . ' - ' . $name;
$this->breadcrumbs=array(
	$name,
);
?>

<? if(!Yii::app()->gapis->IsAuth()) : ?>
    <?=CHtml::link("Connect to Google+", array("site/login"))?>
<? else : ?>

<script type="text/javascript">
    var dataMap = {};

    function getData(pids) {
        return (typeof(dataMap[pids]) == 'undefined' || dataMap[pids] == null) ? {} : dataMap[pids];
    }

    function setData(pids, json_data, update) {
        if (typeof(dataMap[pids]) == 'undefined' || dataMap[pids] == null || update)
            dataMap[pids] = json_data;
    }

    function hideBefore(){
        err = false;
        //jQuery("#yw0_button").click();
        jQuery("#spin-cont").show();
        jQuery("#graph-form").hide();
        jQuery("#gfdc").hide();
    }

    var err = false;

    function error(er) {
        showAfter();
        restartBefore();
        err = true;
        jQuery("#graph-form_es_").html("<b>" + er.status + "</b><br />" + er.responseText);
        jQuery("#graph-form_es_").show();
    }

    function restartBefore() {
        jQuery("#gfdc").hide();
        jQuery("#cresult").hide();
        jQuery("#graph-form_es_").hide();
        jQuery("#graph-form").show();
        jQuery("#graph-form_es_").html("");
        err = false;
    }

    function showAfter() {
        jQuery("#spin-cont").hide();
    }

    function run(html) {
        showAfter();
        if (err)
            return false;
        jQuery("#cresult").show();
        pids = jQuery('#RunForm_pids').val();
        setData(pids, html, true);
        setTimeout(function(){
            try {
                pids = jQuery('#RunForm_pids').val();
                html = getData(pids);
                jsondata = JSON.parse(html);
                if(jsondata.error)
                    throw html;
                jQuery("#gfdc").show();
                jQuery("#cresult").hide();
                test_fd.run(jsondata);
            } catch (e) {
                er = {'status' : 'Error Data', 'responseText' : e };
                error(er);
            }
        }, 1);
    }

    //jQuery("#yw0_button").click();
    jQuery(document).ready(function($) {
        setTimeout(function() {
            restartBefore();
        }, 500);
    });
</script>

<h1><?=$name?></h1>

<?$this->widget('ext.widgets.spin.Spin', array(
    'options' => array(
        'presets'=>'large',
        'htmlOptions' => array(
            'id' => 'spin-cont',
            'class' => 'box',
        ),
    )
));?>

<div class="flash-success" id="cresult" style="display: none;">Data loaded.</div>

<div class="form">

<?php $form=$this->beginWidget('CActiveForm', array(
	'id'=>'graph-form',
	'enableClientValidation'=>true,
	'clientOptions'=>array(
		'validateOnSubmit'=>true,
	),
)); ?>

	<?php echo $form->errorSummary($model); ?>

    <? foreach($model as $key => $value) : ?>
        <?
            if($key == 'verifyCode')
                continue;
        ?>
        <div class="row">
    		<?php echo $form->labelEx($model,$key); ?>
    		<?php echo $form->textField($model,$key); ?>
    		<?php echo $form->error($model,$key); ?>
    	</div>
    <? endforeach ; ?>

	<?php if(CCaptcha::checkRequirements()): ?>
	<div class="row">
		<?php echo $form->labelEx($model,'verifyCode'); ?>
		<div>
		<?php $this->widget('CCaptcha'); ?>
		<?php echo $form->textField($model,'verifyCode'); ?>
		</div>
		<div class="hint">Please enter the letters as they are shown in the image above.
		<br/>Letters are not case-sensitive.</div>
		<?php echo $form->error($model,'verifyCode'); ?>
	</div>
	<?php endif; ?>

	<div class="row buttons">
        <?=CHtml::ajaxSubmitButton('Run', '', array(
            'type' => 'POST',
            'update' => '#output',
            'beforeSend' => 'hideBefore',
            'complete' => 'showAfter',
            'success' => 'run',
            'error' => 'error',
        ),
        array(
            'type' => 'submit',
            'id' => 'run'
        ));?>
        <?php // echo CHtml::submitButton('Submit'); ?>
	</div>

<?php $this->endWidget(); ?>

</div><!-- form -->

<?$this->widget('ext.widgets.jit.Jit', array(
    'libs' => array(
        'forcedirected' => array(
            'type' => 'simple',
            'htmlOptions' => array(
                'id' => 'test_fd'
            )
        ),
    ),
    'htmlOptions' => array(
        'id' => 'gfdc',
        //'style' => 'display:none;'
    ),
));?>

<? endif; ?>