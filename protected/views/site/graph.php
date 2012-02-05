<?php
$name = isset($type) ? $type : 'Error';

$this->pageTitle=Yii::app()->name . ' - ' . $name;
$this->breadcrumbs=array(
	$name,
);
?>

<h1><?=$name?></h1>

<div><?=$data?></div>

<?php if(Yii::app()->user->hasFlash('graph')): ?>

<div class="flash-success">
	<?php echo Yii::app()->user->getFlash('graph'); ?>
</div>

<?php else: ?>

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
        <?/*=CHtml::ajaxSubmitButton('Run', '', array(
            'type' => 'POST',
            'update' => '#output',
        ),
        array(
            'type' => 'submit'
        ));*/?>
        <?php echo CHtml::submitButton('Submit'); ?>
	</div>

<?php $this->endWidget(); ?>

</div><!-- form -->

<?php endif; ?>