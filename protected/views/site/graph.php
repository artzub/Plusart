<?php
$name = isset($type) ? $type : 'Error';

$this->pageTitle=Yii::app()->name . ' - ' . $name;
$this->breadcrumbs=array(
	$name,
);

$this->widget('ext.widgets.google.gapiOAuth2Refresh.gapiOAuth2Refresh');
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
        jQuery("#probar-cont").hide();
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
        jQuery("#probar-cont").hide();
        jQuery("#spin-cont").hide();
        jQuery("#gfdc").hide();
        jQuery("#cresult").hide();
        jQuery("#graph-form_es_").hide();
        jQuery("#graph-form").show();
        jQuery("#graph-form_es_").html("");
        err = false;
    }

    function showAfter() {
        jQuery("#spin-cont").hide();
        jQuery("#probar-cont").show();
    }

    /*function run(html) {
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
    }*/

    var setState = function (state, pos) {
        setLabel(state);
        incPos(pos);
    };

    var incPos = function(pos) {
        if(pos == 1 || typeof(pos) == "undefined" || pos == null)
            pos = (jQuery("#probar").attr('width') || "0").replace('%', '') + 1;

        if(pos < 0)
            pos = -pos;

        pos = !pos ? '0%' : pos + '%';
        jQuery("#probar")[0].style.width = pos;
        jQuery("#probar")[0].textContent = pos;
    };

    var setLabel = function(state) {
        if (typeof(state) != "undefined" && state.length > 0)
            jQuery("#probar_state")[0].textContent = state;
    }

    //jQuery("#yw0_button").click();
    jQuery(document).ready(function($) {

        jQuery("#graph-form").submit(function( clickEvent ) {
            hideBefore();
            setState('Loading apis ...', 45);
            load_gapi(function() {
                showAfter();
                GraphGPlus.onStep = function(pos, max) {
                    pos = pos * 100 / (max || 100);
                    setState('Generation ...', pos);
                };
                GraphGPlus.onComplete = function() {
                    jQuery("#probar-cont").hide();
                    autoreftoken = true;
                    setCountDown();
                };
                GraphGPlus.onGenerate = function(data){
                    if (err)
                        return false;
                    jQuery("#cresult").show();
                    var pids = jQuery('#RunForm_pids').val();
                    setData(pids, data, true);
                    setTimeout(function(){
                        try {
                            var pids = jQuery('#RunForm_pids').val();
                            var html = getData(pids);
                            jsondata = html;//JSON.parse(html);
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
                GraphGPlus.onStep(0);
                autoreftoken = false;
                GraphGPlus.generate({
                    pids : jQuery("#RunForm_pids").val(),
                    maxResult : jQuery("#RunForm_maxResults").val(),
                    maxComments : jQuery("#RunForm_maxComments").val(),
                    maxPlusone : jQuery("#RunForm_maxPlusoners").val(),
                    maxReshare : jQuery("#RunForm_maxResharers").val(),
                    depth : jQuery("#RunForm_depth").val()
                });
            });
            clickEvent.preventDefault();
            return false;
        });

        setTimeout(function() {
            restartBefore();
        }, 100);
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

<?$this->widget('ext.widgets.probar.ProBar', array(
    'options' => array(
        'state' => 'Loading apis ...',
        'stateId' => 'probar_state',
        'probarId' => 'probar',
        'colorStyle' => 'orange',
        'probarStyle' => 'nostripes',
        'htmlOptions' => array(
            'id' => 'probar-cont',
            'class' => 'box',
            'style' => 'display:none',
        ),
    )
));?>

<div class="flash-success" id="cresult" style="display: none;">Data loaded.</div>

<?$this->widget('ext.widgets.google.GraphBuilder.GraphBuilder', array(
    /*
     */
));?>

<div class="form">

<?php $form=$this->beginWidget('CActiveForm', array(
	'id'=>'graph-form',
    'method' => 'get',
	'enableClientValidation'=>false,
	'clientOptions'=>array(
		'validateOnSubmit'=>false,
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

	<?php if(false && CCaptcha::checkRequirements()): ?>
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
        <?=CHtml::submitButton('Run', array('id' => 'runGraph'));?>
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