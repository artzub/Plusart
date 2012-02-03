<?php $this->pageTitle=Yii::app()->name; ?>
<div class="box">
    <? if (!Yii::app()->gapis->IsAuth()) : ?>
        <?=CHtml::link("Connect to Google+", array("site/login"))?>
        <? Yii::app()->session["from"] = Yii::app()->homeUrl; ?>
    <? endif ?>
</div>