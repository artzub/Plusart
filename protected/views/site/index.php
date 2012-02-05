<?php $this->pageTitle=Yii::app()->name; ?>
<div class="box">
    <? if (!Yii::app()->gapis->IsAuth()) : ?>
        <?=CHtml::link("Connect to Google+", array("site/login"))?>
    <? else : ?>
    <div class="bigmenu">
        <ul>
            <li>Graphs:
                <ul>
                    <li><?=CHtml::link("Direct", array("site/graph","type" => "direct"))?></li>
                    <li><?=CHtml::link("Indirect", array("site/graph","type" => "indirect"))?></li>
                    <li><?=CHtml::link("Bubbles", array("site/graph","type" => "bubbles"))?></li>
                </ul>
            </li>
        </ul>
    </div>
    <? endif ; ?>
</div>