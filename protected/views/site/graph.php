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
        jQuery("#spin-cont").show();
        jQuery("#graph-form").hide();
        //jQuery("#gfdc").hide();
    }

    function showAfter() {
        jQuery("#spin-cont").hide();
        jQuery("#gfdc").show();
    }

    function run(html) {
        showAfter();
        pids = jQuery('#pids').val();
        setData(pids, html, true);
        try {
            jsondata = JSON.parse(html);
            test_fd.run(jsondata);
        } catch (e) {
            alert(e);
        }
    }
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
            'success' => "run",
            'error' => 'function(er) { alter(er); }',
        ),
        array(
            'type' => 'submit',
            'id' => 'run'
        ));?>
        <?php // echo CHtml::submitButton('Submit'); ?>
	</div>

<?php $this->endWidget(); ?>

</div><!-- form -->

<div id="output"><?=$data?></div>

<? endif; ?>